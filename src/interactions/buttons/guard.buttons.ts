import {
    ActionRowBuilder,
    type ButtonInteraction,
    type GuildMember,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import {registerButtonHandler} from '../handler.js';
import {ensureGuardConfig, scanInactiveMembers, toggleGuard} from '../../guard/guard-service.js';
import {kickInactiveMembers} from '../../guard/guard-action-service.js';
import {buildGuardDashboard} from '../../ui/builders/guard/dashboard.builder.js';
import {buildGuardConfig} from '../../ui/builders/guard/config.builder.js';
import {buildGuardAction} from '../../ui/builders/guard/action.builder.js';
import {buildGuardScanResults} from '../../ui/builders/guard/scan-results.builder.js';
import {logger} from '../../utils/logger.js';

const MODAL_ACTIONS = new Set(['act-kick', 'act-ban']);

// In-memory scan results for kickall
const scanResultsCache = new Map<string, string[]>();

async function handleGuardButton(interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const action = parts[1];
    const guildId = parts[2];
    const param = parts[3] as string | undefined;

    if (!guildId) {
        logger.warn('Guard button missing guildId', {customId: interaction.customId});
        return;
    }

    // Modal actions must run before deferUpdate
    if (MODAL_ACTIONS.has(action)) {
        const targetId = param;
        if (!targetId) return;

        const modalId = action === 'act-kick' ? `guard-kick:${guildId}:${targetId}` : `guard-ban:${guildId}:${targetId}`;
        const title = action === 'act-kick' ? 'Kick 理由' : 'BAN 理由';

        const modal = new ModalBuilder()
            .setCustomId(modalId)
            .setTitle(title)
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('reason')
                        .setLabel('理由 (任意)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                        .setMaxLength(200),
                ),
            );

        await interaction.showModal(modal);
        return;
    }

    await interaction.deferUpdate();

    if (action === 'back') {
        const result = await ensureGuardConfig(guildId);
        if (!result.ok) {
            await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
            return;
        }
        const dashboard = buildGuardDashboard(guildId, result.config);
        await interaction.editReply({components: [dashboard], flags: MessageFlags.IsComponentsV2});
        return;
    }

    if (action === 'toggle') {
        const result = await toggleGuard(guildId);
        if (!result.ok) {
            await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
            return;
        }
        const configResult = await ensureGuardConfig(guildId);
        if (!configResult.ok) return;
        const dashboard = buildGuardDashboard(guildId, configResult.config);
        await interaction.editReply({components: [dashboard], flags: MessageFlags.IsComponentsV2});
        return;
    }

    if (action === 'config') {
        const result = await ensureGuardConfig(guildId);
        if (!result.ok) {
            await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
            return;
        }
        const view = buildGuardConfig(guildId, result.config);
        await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        return;
    }

    if (action === 'action') {
        const view = buildGuardAction(guildId);
        await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        return;
    }

    if (action === 'scan') {
        const guild = interaction.guild;
        if (!guild) return;
        const result = await ensureGuardConfig(guildId);
        if (!result.ok) {
            await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
            return;
        }
        const inactive = await scanInactiveMembers(guild, result.config);
        scanResultsCache.set(guildId, inactive.map(m => m.userId));
        const view = buildGuardScanResults(guildId, inactive, 0);
        await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        return;
    }

    if (action === 'scan-page') {
        const page = Number(param);
        if (isNaN(page)) return;
        const guild = interaction.guild;
        if (!guild) return;
        const result = await ensureGuardConfig(guildId);
        if (!result.ok) return;
        const inactive = await scanInactiveMembers(guild, result.config);
        const view = buildGuardScanResults(guildId, inactive, page);
        await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        return;
    }

    if (action === 'scan-kickall') {
        const guild = interaction.guild;
        if (!guild) return;
        const userIds = scanResultsCache.get(guildId);
        if (!userIds || userIds.length === 0) {
            await interaction.followUp({content: 'スキャン結果が見つかりません。再度スキャンしてください。', flags: MessageFlags.Ephemeral});
            return;
        }
        const executor = interaction.member as GuildMember;
        const result = await kickInactiveMembers(guild, executor, userIds, 'ガード: 非アクティブ一括Kick');
        scanResultsCache.delete(guildId);
        if (!result.ok) {
            await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
            return;
        }
        await interaction.followUp({
            content: `一括Kick完了: **${result.kicked}人** Kick / **${result.failed}人** 失敗`,
            flags: MessageFlags.Ephemeral,
        });
        // Refresh dashboard
        const configResult = await ensureGuardConfig(guildId);
        if (!configResult.ok) return;
        const dashboard = buildGuardDashboard(guildId, configResult.config);
        await interaction.editReply({components: [dashboard], flags: MessageFlags.IsComponentsV2});
        return;
    }

    logger.warn(`Unknown guard button action: ${action}`);
}

registerButtonHandler('guard', handleGuardButton as (interaction: never) => Promise<void>);
