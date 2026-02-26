import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';

export interface CounterEntry {
    id: number;
    word: string;
    matchType: number;
    regex: RegExp;
}

function buildRegex(word: string, matchType: number): RegExp {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    switch (matchType) {
        case 2: // exact
            return new RegExp('^' + escaped + '$', 'i');
        case 3: // word
            return new RegExp('(?:^|\\s)' + escaped + '(?:\\s|$)', 'i');
        default: // 1 = partial
            return new RegExp(escaped, 'i');
    }
}

const cache = new Map<string, CounterEntry[]>();

export async function getEntries(guildId: string): Promise<CounterEntry[]> {
    const cached = cache.get(guildId);
    if (cached) return cached;

    const rows = await prisma.counter.findMany({where: {guildId}});
    const entries = rows.map(r => ({
        id: r.id,
        word: r.word,
        matchType: r.matchType,
        regex: buildRegex(r.word, r.matchType),
    }));

    cache.set(guildId, entries);
    logger.debug('Counter cache loaded', {guildId, count: entries.length});
    return entries;
}

export function invalidateGuild(guildId: string): void {
    cache.delete(guildId);
}
