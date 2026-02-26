import {prisma} from '../database/client.js';
import {invalidateGuild} from './counter-cache.js';
import {MAX_COUNTERS_PER_GUILD} from '../config/constants.js';

export async function addCounter(
    guildId: string,
    word: string,
    matchType: number,
): Promise<{ ok: true } | { ok: false; reason: string }> {
    const count = await prisma.counter.count({where: {guildId}});
    if (count >= MAX_COUNTERS_PER_GUILD) {
        return {ok: false, reason: `登録上限 (${MAX_COUNTERS_PER_GUILD}個) に達しています。`};
    }

    const existing = await prisma.counter.findUnique({where: {guildId_word: {guildId, word}}});
    if (existing) {
        return {ok: false, reason: `「${word}」は既に登録されています。`};
    }

    await prisma.counter.create({data: {guildId, word, matchType}});
    invalidateGuild(guildId);
    return {ok: true};
}

export async function deleteCounter(guildId: string, counterId: number): Promise<void> {
    await prisma.counter.delete({where: {id: counterId}}).catch(() => {
    });
    invalidateGuild(guildId);
}

export async function listCounters(guildId: string) {
    return prisma.counter.findMany({where: {guildId}, orderBy: {id: 'asc'}});
}

export async function logHit(counterId: number, userId: string): Promise<void> {
    await prisma.counterLog.create({data: {counterId, userId}});
}

export type PeriodFilter = 'd' | 'w' | 'a';

function periodStart(period: PeriodFilter): Date | null {
    const now = new Date();
    switch (period) {
        case 'd': {
            const d = new Date(now);
            d.setHours(0, 0, 0, 0);
            return d;
        }
        case 'w': {
            const d = new Date(now);
            d.setDate(d.getDate() - d.getDay());
            d.setHours(0, 0, 0, 0);
            return d;
        }
        default:
            return null;
    }
}

export interface WordCount {
    word: string;
    count: number;
}

export interface UserCount {
    userId: string;
    count: number;
}

export async function getWordCounts(guildId: string, period: PeriodFilter): Promise<WordCount[]> {
    const start = periodStart(period);
    const counters = await prisma.counter.findMany({where: {guildId}, select: {id: true, word: true}});
    if (counters.length === 0) return [];

    const counterIds = counters.map(c => c.id);
    const where: any = {counterId: {in: counterIds}};
    if (start) where.createdAt = {gte: start};

    const grouped = await prisma.counterLog.groupBy({
        by: ['counterId'],
        where,
        _count: {id: true},
        orderBy: {_count: {id: 'desc'}},
    });

    const idToWord = new Map(counters.map(c => [c.id, c.word]));
    return grouped.map(g => ({word: idToWord.get(g.counterId) ?? '?', count: g._count.id}));
}

export async function getUserCounts(guildId: string, period: PeriodFilter): Promise<UserCount[]> {
    const start = periodStart(period);
    const counters = await prisma.counter.findMany({where: {guildId}, select: {id: true}});
    if (counters.length === 0) return [];

    const counterIds = counters.map(c => c.id);
    const where: any = {counterId: {in: counterIds}};
    if (start) where.createdAt = {gte: start};

    const grouped = await prisma.counterLog.groupBy({
        by: ['userId'],
        where,
        _count: {id: true},
        orderBy: {_count: {id: 'desc'}},
        take: 10,
    });

    return grouped.map(g => ({userId: g.userId, count: g._count.id}));
}
