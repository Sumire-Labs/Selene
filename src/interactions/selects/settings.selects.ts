import {
    type AnySelectMenuInteraction,
    type ChannelSelectMenuInteraction,
    MessageFlags,
    type StringSelectMenuInteraction,
} from 'discord.js';
import {registerSelectMenuHandler} from '../handler.js';
import {
    getLoggerConfig,
    setCategoryChannel,
    setDefaultChannel,
    updateEnabledEvents,
} from '../../settings/logger-service.js';
import {buildLoggerEventsView} from '../../ui/builders/settings/logger-events.builder.js';
import {buildLoggerChannelsView} from '../../ui/builders/settings/logger-channels.builder.js';
import {CATEGORY_EVENTS, type LogEventCategoryType} from '../../settings/types.js';
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

    switch (action) {
        // Event selection within a category
        case 'log-evsel': {
            if (!param) return;
            const category = param as LogEventCategoryType;
            const selectedEvents = (interaction as StringSelectMenuInteraction).values;

            // Merge: keep events from other categories, replace this category's events
            const config = await getLoggerConfig(guildId);
            if (!config) return;

            const thisCategoryEvents = CATEGORY_EVENTS[category];
            const otherEvents = config.enabledEvents.filter(e => !thisCategoryEvents.includes(e as never));
            const merged = [...otherEvents, ...selectedEvents];

            const result = await updateEnabledEvents(guildId, merged);
            if (!result.ok) return;

            const updatedConfig = await getLoggerConfig(guildId);
            if (!updatedConfig) return;
            const view = buildLoggerEventsView(guildId, updatedConfig, category);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // Default channel selection
        case 'log-chdef': {
            const channelId = (interaction as ChannelSelectMenuInteraction).values[0];
            if (!channelId) return;

            const result = await setDefaultChannel(guildId, channelId);
            if (!result.ok) return;

            const config = await getLoggerConfig(guildId);
            if (!config) return;
            // Re-render with first category tab active
            const view = buildLoggerChannelsView(guildId, config, param as LogEventCategoryType ?? 'MESSAGE');
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // Category channel override
        case 'log-chcat': {
            if (!param) return;
            const category = param as LogEventCategoryType;
            const channelId = (interaction as ChannelSelectMenuInteraction).values[0];
            if (!channelId) return;

            const result = await setCategoryChannel(guildId, category, channelId);
            if (!result.ok) return;

            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, category);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        default:
            logger.warn(`Unknown settings select action: ${action}`);
    }
}

registerSelectMenuHandler('settings', handleSettingsSelect as (interaction: never) => Promise<void>);
