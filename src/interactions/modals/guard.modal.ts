import {type GuildMember, MessageFlags, type ModalSubmitInteraction} from 'discord.js';
import {registerModalHandler} from '../handler.js';
import {kickMember, banMember} from '../../guard/guard-action-service.js';
import {ensureGuardConfig} from '../../guard/guard-service.js';
import {buildGuardDashboard} from '../../ui/builders/guard/dashboard.builder.js';
import {logger} from '../../utils/logger.js';

async function handleGuardKickModal(interaction: ModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const guildId = parts[1];
    const targetId = parts[2];
    if (!guildId || !targetId) return;

    const reason = interaction.fields.getTextInputValue('reason').trim() || undefined;

    await interaction.deferUpdate();

    const guild = interaction.guild;
    if (!guild) return;
    const executor = interaction.member as GuildMember;

    const result = await kickMember(guild, executor, targetId, reason);
    if (!result.ok) {
        await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
        return;
    }

    await interaction.followUp({
        content: `<@${targetId}> をKickしました。`,
        flags: MessageFlags.Ephemeral,
    });

    const configResult = await ensureGuardConfig(guildId);
    if (!configResult.ok) return;
    const dashboard = buildGuardDashboard(guildId, configResult.config);
    await interaction.editReply({components: [dashboard], flags: MessageFlags.IsComponentsV2});

    logger.info('Guard: kick executed via modal', {guildId, targetId});
}

async function handleGuardBanModal(interaction: ModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const guildId = parts[1];
    const targetId = parts[2];
    if (!guildId || !targetId) return;

    const reason = interaction.fields.getTextInputValue('reason').trim() || undefined;

    await interaction.deferUpdate();

    const guild = interaction.guild;
    if (!guild) return;
    const executor = interaction.member as GuildMember;

    const result = await banMember(guild, executor, targetId, reason);
    if (!result.ok) {
        await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
        return;
    }

    await interaction.followUp({
        content: `<@${targetId}> をBANしました。`,
        flags: MessageFlags.Ephemeral,
    });

    const configResult = await ensureGuardConfig(guildId);
    if (!configResult.ok) return;
    const dashboard = buildGuardDashboard(guildId, configResult.config);
    await interaction.editReply({components: [dashboard], flags: MessageFlags.IsComponentsV2});

    logger.info('Guard: ban executed via modal', {guildId, targetId});
}

registerModalHandler('guard-kick', handleGuardKickModal as (interaction: never) => Promise<void>);
registerModalHandler('guard-ban', handleGuardBanModal as (interaction: never) => Promise<void>);
