import {type ButtonInteraction, MessageFlags} from 'discord.js';
import {registerButtonHandler} from '../handler.js';
import {ensureLoggerConfig, getLoggerConfig, setCategoryChannel, toggleLogger} from '../../settings/logger-service.js';
import {buildSettingsDashboard} from '../../ui/builders/settings/dashboard.builder.js';
import {buildLoggerOverview} from '../../ui/builders/settings/logger-overview.builder.js';
import {buildLoggerEventsView} from '../../ui/builders/settings/logger-events.builder.js';
import {buildLoggerChannelsView} from '../../ui/builders/settings/logger-channels.builder.js';
import {LogEventCategory, type LogEventCategoryType} from '../../settings/types.js';
import {logger} from '../../utils/logger.js';

async function handleSettingsButton(interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const action = parts[1];
    const guildId = parts[2];
    const param = parts[3] as string | undefined;

    if (!guildId) {
        logger.warn('Settings button missing guildId', {customId: interaction.customId});
        return;
    }

    await interaction.deferUpdate();

    switch (action) {
        // Dashboard → category detail
        case 'cat': {
            if (param === 'logger') {
                const result = await ensureLoggerConfig(guildId);
                if (!result.ok) {
                    await interaction.editReply({content: result.reason});
                    return;
                }
                const view = buildLoggerOverview(guildId, result.config);
                await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            }
            break;
        }

        // Back to dashboard
        case 'back': {
            const dashboard = buildSettingsDashboard(guildId);
            await interaction.editReply({components: [dashboard], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // Toggle logger enabled/disabled
        case 'log-toggle': {
            const toggleResult = await toggleLogger(guildId);
            if (!toggleResult.ok) {
                await interaction.editReply({content: toggleResult.reason});
                return;
            }
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerOverview(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // Navigate to events view
        case 'log-events': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerEventsView(guildId, config, LogEventCategory.MESSAGE);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // Switch event category tab
        case 'log-evcat': {
            if (!param) return;
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerEventsView(guildId, config, param as LogEventCategoryType);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // Events view → back to overview
        case 'log-evback': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerOverview(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // Navigate to channels view
        case 'log-channels': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, LogEventCategory.MESSAGE);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // Switch channel category tab
        case 'log-chtab': {
            if (!param) return;
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, param as LogEventCategoryType);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // Reset category channel override
        case 'log-chrst': {
            if (!param) return;
            await setCategoryChannel(guildId, param as LogEventCategoryType, null);
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, param as LogEventCategoryType);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // Channels view → back to overview
        case 'log-chback': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerOverview(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        default:
            logger.warn(`Unknown settings button action: ${action}`);
    }
}

registerButtonHandler('settings', handleSettingsButton as (interaction: never) => Promise<void>);
