import type {ButtonInteraction} from 'discord.js';
import {MessageFlags} from 'discord.js';
import {getLoggerConfig, setCategoryChannel, toggleLogger} from '../../settings/logger-service.js';
import {buildLoggerOverview} from '../../ui/builders/settings/logger-overview.builder.js';
import {buildLoggerEventsView} from '../../ui/builders/settings/logger-events.builder.js';
import {buildLoggerChannelsView} from '../../ui/builders/settings/logger-channels.builder.js';
import {LogEventCategory, type LogEventCategoryType} from '../../settings/types.js';

export async function handleLoggerButton(
    interaction: ButtonInteraction, action: string, guildId: string, param?: string,
): Promise<void> {
    switch (action) {
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

        case 'log-events': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerEventsView(guildId, config, LogEventCategory.MESSAGE);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-evcat': {
            if (!param) return;
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerEventsView(guildId, config, param as LogEventCategoryType);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-evback': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerOverview(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-channels': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, LogEventCategory.MESSAGE);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-chtab': {
            if (!param) return;
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, param as LogEventCategoryType);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-chrst': {
            if (!param) return;
            await setCategoryChannel(guildId, param as LogEventCategoryType, null);
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, param as LogEventCategoryType);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-chback': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerOverview(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }
    }
}
