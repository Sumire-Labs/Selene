import type {GuardConfig} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';

const cache = new Map<string, GuardConfig>();

export async function getCachedGuardConfig(guildId: string): Promise<GuardConfig | null> {
    const cached = cache.get(guildId);
    if (cached) return cached;

    const config = await prisma.guardConfig.findUnique({where: {guildId}});
    if (config) {
        cache.set(guildId, config);
        logger.debug('Guard cache loaded', {guildId});
    }
    return config;
}

export function invalidateGuardCache(guildId: string): void {
    cache.delete(guildId);
}
