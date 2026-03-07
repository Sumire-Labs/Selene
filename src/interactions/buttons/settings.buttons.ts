import type {ButtonInteraction} from 'discord.js';
import {MessageFlags} from 'discord.js';
import {registerButtonHandler} from '../handler.js';
import {buildSettingsDashboard} from '../../ui/builders/settings/dashboard.builder.js';
import {handleLoggerButton} from './settings-logger.buttons.js';
import {handleTicketButton} from './settings-ticket.buttons.js';
import {handleXpButton} from './settings-xp.buttons.js';
import {handleEmbedFixButton} from './settings-embedfix.buttons.js';
import {logger} from '../../utils/logger.js';

const MODAL_ACTIONS = new Set(['xp-rwadd', 'xp-uedit', 'ticket-edit']);

async function handleSettingsButton(interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const action = parts[1];
    const guildId = parts[2];
    const param = parts[3] as string | undefined;

    if (!guildId) {
        logger.warn('Settings button missing guildId', {customId: interaction.customId});
        return;
    }

    // Modal actions must run before deferUpdate
    if (MODAL_ACTIONS.has(action)) {
        if (action.startsWith('xp-')) {
            await handleXpButton(interaction, action, guildId, param);
        } else if (action.startsWith('ticket-')) {
            await handleTicketButton(interaction, action, guildId);
        }
        return;
    }

    await interaction.deferUpdate();

    // Back to dashboard
    if (action === 'back') {
        const dashboard = buildSettingsDashboard(guildId);
        await interaction.editReply({components: [dashboard], flags: MessageFlags.IsComponentsV2});
        return;
    }

    // Delegate to feature handlers by prefix
    if (action.startsWith('log-')) {
        await handleLoggerButton(interaction, action, guildId, param);
    } else if (action.startsWith('ticket-')) {
        await handleTicketButton(interaction, action, guildId);
    } else if (action.startsWith('xp-')) {
        await handleXpButton(interaction, action, guildId, param);
    } else if (action.startsWith('ef-')) {
        await handleEmbedFixButton(interaction, action, guildId);
    } else {
        logger.warn(`Unknown settings button action: ${action}`);
    }
}

registerButtonHandler('settings', handleSettingsButton as (interaction: never) => Promise<void>);
