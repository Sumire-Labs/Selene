import {
    type AnySelectMenuInteraction,
    type ChannelSelectMenuInteraction,
    MessageFlags,
    type StringSelectMenuInteraction,
    type UserSelectMenuInteraction,
} from 'discord.js';
import {registerSelectMenuHandler} from '../handler.js';
import {updateInactivityDays, updateLogChannel, updateTrackingCriteria} from '../../guard/guard-service.js';
import {buildGuardConfig} from '../../ui/builders/guard/config.builder.js';
import {buildGuardActionTarget} from '../../ui/builders/guard/action.builder.js';
import {logger} from '../../utils/logger.js';

async function handleGuardSelect(interaction: AnySelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const action = parts[1];
    const guildId = parts[2];

    if (!guildId) {
        logger.warn('Guard select missing guildId', {customId: interaction.customId});
        return;
    }

    await interaction.deferUpdate();

    if (action === 'cfg-days') {
        const value = Number((interaction as StringSelectMenuInteraction).values[0]);
        const result = await updateInactivityDays(guildId, value);
        if (!result.ok) {
            await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
            return;
        }
        const view = buildGuardConfig(guildId, result.config);
        await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        return;
    }

    if (action === 'cfg-track') {
        const values = (interaction as StringSelectMenuInteraction).values;
        const result = await updateTrackingCriteria(
            guildId,
            values.includes('messages'),
            values.includes('reactions'),
            values.includes('voice'),
        );
        if (!result.ok) {
            await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
            return;
        }
        const view = buildGuardConfig(guildId, result.config);
        await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        return;
    }

    if (action === 'cfg-log') {
        const channelId = (interaction as ChannelSelectMenuInteraction).values[0] ?? null;
        const result = await updateLogChannel(guildId, channelId);
        if (!result.ok) {
            await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
            return;
        }
        const view = buildGuardConfig(guildId, result.config);
        await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        return;
    }

    if (action === 'act-user') {
        const userId = (interaction as UserSelectMenuInteraction).values[0];
        if (!userId) return;
        const member = await interaction.guild?.members.fetch(userId).catch(() => null);
        const username = member?.user.username ?? userId;
        const view = buildGuardActionTarget(guildId, userId, username);
        await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        return;
    }

    logger.warn(`Unknown guard select action: ${action}`);
}

registerSelectMenuHandler('guard', handleGuardSelect as (interaction: never) => Promise<void>);
