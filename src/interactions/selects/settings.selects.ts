import {
    type AnySelectMenuInteraction,
    MessageFlags,
    type StringSelectMenuInteraction,
} from 'discord.js';
import {registerSelectMenuHandler} from '../handler.js';
import {ensureLoggerConfig} from '../../settings/logger-service.js';
import {ensureTicketConfig} from '../../ticket/ticket-service.js';
import {ensureEmbedFixConfig} from '../../settings/embedfix-service.js';
import {ensureXpConfig, getRoleRewards} from '../../xp/xp-service.js';
import {buildLoggerOverview} from '../../ui/builders/settings/logger-overview.builder.js';
import {buildTicketOverview} from '../../ui/builders/settings/ticket-overview.builder.js';
import {buildXpOverview} from '../../ui/builders/settings/xp-overview.builder.js';
import {buildEmbedFixOverview} from '../../ui/builders/settings/embedfix-overview.builder.js';
import {handleLoggerSelect} from './settings-logger.selects.js';
import {handleTicketSelect} from './settings-ticket.selects.js';
import {handleXpSelect} from './settings-xp.selects.js';
import {logger} from '../../utils/logger.js';

async function handleSettingsSelect(interaction: AnySelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const action = parts[1];
    const guildId = parts[2];
    const param = parts[3] as string | undefined;

    if (!guildId) {
        logger.warn('Settings select missing guildId', {customId: interaction.customId});
        return;
    }

    await interaction.deferUpdate();

    // Dashboard category select
    if (action === 'cat') {
        const selected = (interaction as StringSelectMenuInteraction).values[0];
        if (selected === 'logger') {
            const result = await ensureLoggerConfig(guildId);
            if (!result.ok) {
                await interaction.editReply({content: result.reason});
                return;
            }
            const view = buildLoggerOverview(guildId, result.config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        } else if (selected === 'ticket') {
            const result = await ensureTicketConfig(guildId);
            if (!result.ok) {
                await interaction.editReply({content: result.reason});
                return;
            }
            const view = buildTicketOverview(guildId, result.config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        } else if (selected === 'xp') {
            const result = await ensureXpConfig(guildId);
            if (!result.ok) {
                await interaction.editReply({content: result.reason});
                return;
            }
            const rewards = await getRoleRewards(guildId);
            const view = buildXpOverview(guildId, result.config, rewards.length);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        } else if (selected === 'embedfix') {
            const result = await ensureEmbedFixConfig(guildId);
            if (!result.ok) {
                await interaction.editReply({content: result.reason});
                return;
            }
            const view = buildEmbedFixOverview(guildId, result.config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
        }
        return;
    }

    // Delegate to feature handlers by prefix
    if (action.startsWith('log-')) {
        await handleLoggerSelect(interaction, action, guildId, param);
    } else if (action.startsWith('ticket-')) {
        await handleTicketSelect(interaction, action, guildId);
    } else if (action.startsWith('xp-')) {
        await handleXpSelect(interaction, action, guildId, param);
    } else {
        logger.warn(`Unknown settings select action: ${action}`);
    }
}

registerSelectMenuHandler('settings', handleSettingsSelect as (interaction: never) => Promise<void>);
