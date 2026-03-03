import {type ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder} from 'discord.js';
import {registerCommand} from '../registry.js';
import {buildSettingsDashboard} from '../../ui/builders/settings/dashboard.builder.js';

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

    const dashboard = buildSettingsDashboard(guildId);
    await interaction.editReply({components: [dashboard], flags: MessageFlags.IsComponentsV2});
}

registerCommand({
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('サーバー設定ダッシュボードを表示する')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON(),
    execute: execute as (interaction: never) => Promise<void>,
});
