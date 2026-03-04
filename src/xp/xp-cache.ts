import type {XpConfig} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';

const cache = new Map<string, XpConfig>();

export async function getCachedXpConfig(guildId: string): Promise<XpConfig | null> {
    const cached = cache.get(guildId);
    if (cached) return cached;

    const config = await prisma.xpConfig.findUnique({where: {guildId}});
    if (config) {
        cache.set(guildId, config);
        logger.debug('XP config cache loaded', {guildId});
    }
    return config;
}

export function invalidateXpCache(guildId: string): void {
    cache.delete(guildId);
}
