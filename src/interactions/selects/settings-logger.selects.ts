import type {AnySelectMenuInteraction, ChannelSelectMenuInteraction, StringSelectMenuInteraction} from 'discord.js';
import {MessageFlags} from 'discord.js';
import {getLoggerConfig, setCategoryChannel, setDefaultChannel, updateEnabledEvents} from '../../settings/logger-service.js';
import {buildLoggerEventsView} from '../../ui/builders/settings/logger-events.builder.js';
import {buildLoggerChannelsView} from '../../ui/builders/settings/logger-channels.builder.js';
import {CATEGORY_EVENTS, type LogEventCategoryType} from '../../settings/types.js';

export async function handleLoggerSelect(
    interaction: AnySelectMenuInteraction, action: string, guildId: string, param?: string,
): Promise<void> {
    switch (action) {
        case 'log-evsel': {
            if (!param) return;
            const category = param as LogEventCategoryType;
            const selectedEvents = (interaction as StringSelectMenuInteraction).values;

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

        case 'log-chdef': {
            const channelId = (interaction as ChannelSelectMenuInteraction).values[0];
            if (!channelId) return;

            const result = await setDefaultChannel(guildId, channelId);
            if (!result.ok) return;

            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, param as LogEventCategoryType ?? 'MESSAGE');
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

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
    }
}
