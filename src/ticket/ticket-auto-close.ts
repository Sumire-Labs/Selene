import type {Client} from 'discord.js';
import {prisma} from '../database/client.js';
import {TICKET_AUTO_CLOSE_CHECK_INTERVAL_MS, TICKET_CHANNEL_PREFIX} from '../config/constants.js';
import {logger} from '../utils/logger.js';

export function startTicketAutoClose(client: Client): void {
    setInterval(async () => {
        try {
            const configs = await prisma.ticketConfig.findMany({
                where: {autoCloseHours: {not: null}},
            });

            for (const config of configs) {
                if (!config.categoryId || !config.autoCloseHours) continue;

                const guild = client.guilds.cache.get(config.guildId);
                if (!guild) continue;

                const thresholdMs = config.autoCloseHours * 60 * 60 * 1000;
                const now = Date.now();

                const category = guild.channels.cache.get(config.categoryId);
                if (!category || !('children' in category)) continue;

                for (const [, channel] of category.children.cache) {
                    if (!channel.name.startsWith(`${TICKET_CHANNEL_PREFIX}-`)) continue;
                    if (!channel.createdTimestamp) continue;

                    if (now - channel.createdTimestamp > thresholdMs) {
                        try {
                            await channel.delete('チケット自動クローズ');
                            logger.info('Auto-closed ticket channel', {
                                guildId: config.guildId,
                                channelName: channel.name,
                            });
                        } catch (error) {
                            logger.error('Failed to auto-close ticket channel', error, {
                                guildId: config.guildId,
                                channelId: channel.id,
                            });
                        }
                    }
                }
            }
        } catch (error) {
            logger.error('Ticket auto-close check failed', error);
        }
    }, TICKET_AUTO_CLOSE_CHECK_INTERVAL_MS);
}
