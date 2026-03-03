import {
    ChannelType,
    MessageFlags,
    type ModalSubmitInteraction,
    OverwriteType,
    PermissionFlagsBits,
} from 'discord.js';
import {registerModalHandler} from '../handler.js';
import {getTicketConfig, incrementTicketCounter} from '../../ticket/ticket-service.js';
import {buildTicketWelcomeView} from '../../ui/builders/ticket/panel.builder.js';
import {TICKET_CHANNEL_PREFIX} from '../../config/constants.js';
import {logger} from '../../utils/logger.js';

async function handleTicketCreateModal(interaction: ModalSubmitInteraction): Promise<void> {
    const guildId = interaction.customId.split(':')[1];
    if (!guildId) return;

    const title = interaction.fields.getTextInputValue('title').trim();
    const description = interaction.fields.getTextInputValue('description').trim();

    if (!title || !description) {
        await interaction.reply({
            content: 'タイトルと説明を入力してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    const config = await getTicketConfig(guildId);
    if (!config || !config.categoryId || !config.supportRoleId) {
        await interaction.editReply({content: 'チケットシステムが設定されていません。'});
        return;
    }

    // Check max tickets per user
    if (config.maxTicketsPerUser > 0 && config.categoryId) {
        const guild = interaction.guild!;
        const category = guild.channels.cache.get(config.categoryId);
        if (category && 'children' in category) {
            let userTicketCount = 0;
            for (const [, channel] of category.children.cache) {
                if (!channel.name.startsWith('ticket-')) continue;
                const perms = channel.permissionOverwrites.cache.get(interaction.user.id);
                if (perms?.allow.has(PermissionFlagsBits.ViewChannel)) {
                    userTicketCount++;
                }
            }
            if (userTicketCount >= config.maxTicketsPerUser) {
                await interaction.editReply({
                    content: `チケットの上限（${config.maxTicketsPerUser}件）に達しています。`,
                });
                return;
            }
        }
    }

    const counter = await incrementTicketCounter(guildId);
    const channelName = `${TICKET_CHANNEL_PREFIX}-${String(counter).padStart(4, '0')}`;

    const guild = interaction.guild!;
    const userId = interaction.user.id;

    const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: config.categoryId,
        permissionOverwrites: [
            {
                id: guild.id,
                type: OverwriteType.Role,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: userId,
                type: OverwriteType.Member,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            },
            {
                id: config.supportRoleId,
                type: OverwriteType.Role,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            },
            {
                id: guild.client.user.id,
                type: OverwriteType.Member,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageChannels,
                ],
            },
        ],
    });

    const welcomeView = buildTicketWelcomeView(userId, title, description);
    await ticketChannel.send({
        content: `<@${userId}> <@&${config.supportRoleId}>`,
        components: [welcomeView],
        flags: MessageFlags.IsComponentsV2,
    });

    await interaction.editReply({
        content: `チケットが作成されました: <#${ticketChannel.id}>`,
    });

    logger.info('Ticket created', {guildId, channelName, userId});
}

registerModalHandler('ticket-create', handleTicketCreateModal as (interaction: never) => Promise<void>);
