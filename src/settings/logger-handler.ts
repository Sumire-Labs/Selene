import type {Client, ContainerBuilder} from 'discord.js';
import {MessageFlags} from 'discord.js';
import {getCachedLoggerConfig} from './logger-cache.js';
import {CATEGORY_CHANNEL_FIELD, type LogEventCategoryType, type LogEventType} from './types.js';
import {logger} from '../utils/logger.js';

export async function sendLog(
    client: Client,
    guildId: string,
    event: LogEventType,
    category: LogEventCategoryType,
    buildFn: () => ContainerBuilder,
): Promise<void> {
    try {
        const config = await getCachedLoggerConfig(guildId);
        if (!config?.enabled) return;
        if (!config.enabledEvents.includes(event)) return;

        const channelField = CATEGORY_CHANNEL_FIELD[category];
        const channelId = (config[channelField] as string | null) ?? config.defaultChannelId;
        if (!channelId) return;

        const channel = await client.channels.fetch(channelId);
        if (!channel?.isTextBased() || !('send' in channel)) return;

        await channel.send({
            components: [buildFn()],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {parse: []},
        });
    } catch (error) {
        logger.error('Failed to send log', error, {guildId, event});
    }
}
