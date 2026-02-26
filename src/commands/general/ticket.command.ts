import {
    ChannelType,
    type ChatInputCommandInteraction,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js';
import {registerCommand} from '../registry.js';
import {upsertTicketConfig, getTicketConfig, updatePanelMessageId} from '../../ticket/ticket-service.js';
import {buildTicketPanelView, buildTicketSetupConfirmView} from '../../ui/builders/ticket/panel.builder.js';
import {logger} from '../../utils/logger.js';

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) return;

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({
            content: 'このコマンドは管理者のみ使用できます。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const channel = interaction.options.getChannel('channel', true);
    const category = interaction.options.getChannel('category', true);
    const role = interaction.options.getRole('role', true);

    if (channel.type !== ChannelType.GuildText) {
        await interaction.reply({
            content: 'パネルチャンネルにはテキストチャンネルを指定してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (category.type !== ChannelType.GuildCategory) {
        await interaction.reply({
            content: 'カテゴリにはカテゴリチャンネルを指定してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    await interaction.deferReply({flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2});

    // Delete old panel message if exists
    const existingConfig = await getTicketConfig(guildId);
    if (existingConfig?.panelMessageId) {
        try {
            const oldChannel = await interaction.guild!.channels.fetch(existingConfig.panelChannelId);
            if (oldChannel?.isTextBased()) {
                const oldMessage = await oldChannel.messages.fetch(existingConfig.panelMessageId);
                await oldMessage.delete();
            }
        } catch {
            // Old message may already be deleted
        }
    }

    // Save config to DB
    const result = await upsertTicketConfig(guildId, channel.id, category.id, role.id);
    if (!result.ok) {
        await interaction.editReply({content: result.reason});
        return;
    }

    // Send panel to target channel
    const panelChannel = await interaction.guild!.channels.fetch(channel.id);
    if (!panelChannel?.isTextBased()) {
        await interaction.editReply({content: 'パネルチャンネルにメッセージを送信できません。'});
        return;
    }

    const panelMessage = await panelChannel.send({
        components: [buildTicketPanelView()],
        flags: MessageFlags.IsComponentsV2,
    });

    // Save panel message ID
    await updatePanelMessageId(guildId, panelMessage.id);

    // Reply with confirmation
    const confirmView = buildTicketSetupConfirmView(channel.id, category.id, role.id);
    await interaction.editReply({
        components: [confirmView],
        flags: MessageFlags.IsComponentsV2,
    });

    logger.info('Ticket system configured', {guildId, panelChannelId: channel.id, categoryId: category.id});
}

registerCommand({
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('チケットシステムを設定する')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(opt =>
            opt
                .setName('channel')
                .setDescription('パネルを送信するテキストチャンネル')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true),
        )
        .addChannelOption(opt =>
            opt
                .setName('category')
                .setDescription('チケットチャンネルを作成するカテゴリ')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true),
        )
        .addRoleOption(opt =>
            opt
                .setName('role')
                .setDescription('サポートロール')
                .setRequired(true),
        )
        .toJSON(),
    execute: execute as (interaction: never) => Promise<void>,
});
