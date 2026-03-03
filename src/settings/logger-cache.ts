import type {LoggerConfig} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';

const cache = new Map<string, LoggerConfig>();

export async function getCachedLoggerConfig(guildId: string): Promise<LoggerConfig | null> {
    const cached = cache.get(guildId);
    if (cached) return cached;

    const config = await prisma.loggerConfig.findUnique({where: {guildId}});
    if (config) {
        cache.set(guildId, config);
        logger.debug('Logger cache loaded', {guildId});
    }
    return config;
}

export function invalidateLoggerCache(guildId: string): void {
    cache.delete(guildId);
}
