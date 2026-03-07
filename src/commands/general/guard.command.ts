import {type ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder} from 'discord.js';
import {registerCommand} from '../registry.js';
import {ensureGuardConfig} from '../../guard/guard-service.js';
import {buildGuardDashboard} from '../../ui/builders/guard/dashboard.builder.js';

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

    await interaction.deferReply({flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2});

    const result = await ensureGuardConfig(guildId);
    if (!result.ok) {
        await interaction.editReply({content: result.reason});
        return;
    }

    const dashboard = buildGuardDashboard(guildId, result.config);
    await interaction.editReply({components: [dashboard], flags: MessageFlags.IsComponentsV2});
}

registerCommand({
    data: new SlashCommandBuilder()
        .setName('guard')
        .setDescription('サーバーガードダッシュボードを表示する')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON(),
    execute: execute as (interaction: never) => Promise<void>,
});
