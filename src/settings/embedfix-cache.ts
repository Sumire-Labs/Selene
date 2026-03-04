import type {EmbedFixConfig} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';

const cache = new Map<string, EmbedFixConfig>();

export async function getCachedEmbedFixConfig(guildId: string): Promise<EmbedFixConfig | null> {
    const cached = cache.get(guildId);
    if (cached) return cached;

    const config = await prisma.embedFixConfig.findUnique({where: {guildId}});
    if (config) {
        cache.set(guildId, config);
        logger.debug('EmbedFix cache loaded', {guildId});
    }
    return config;
}

export function invalidateEmbedFixCache(guildId: string): void {
    cache.delete(guildId);
}
