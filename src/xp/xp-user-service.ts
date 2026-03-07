import type {UserXp} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';
import {levelFromXp} from './xp-table.js';
import type {AddXpResult} from './types.js';

export async function addMessageXp(
    guildId: string,
    userId: string,
    amount: number,
): Promise<AddXpResult> {
    const record = await prisma.userXp.upsert({
        where: {guildId_userId: {guildId, userId}},
        update: {
            xp: {increment: amount},
            totalMessages: {increment: 1},
        },
        create: {guildId, userId, xp: amount, totalMessages: 1},
    });

    const oldLevel = record.level;
    const newLevel = levelFromXp(record.xp);
    const leveledUp = newLevel > oldLevel;

    if (leveledUp) {
        await prisma.userXp.update({
            where: {id: record.id},
            data: {level: newLevel},
        });
    }

    return {ok: true, xp: record.xp, level: newLevel, leveledUp, oldLevel, newLevel};
}

export async function addVoiceXp(
    guildId: string,
    userId: string,
    amount: number,
    minutes: number,
): Promise<AddXpResult> {
    const record = await prisma.userXp.upsert({
        where: {guildId_userId: {guildId, userId}},
        update: {
            xp: {increment: amount},
            totalVoiceMinutes: {increment: minutes},
        },
        create: {guildId, userId, xp: amount, totalVoiceMinutes: minutes},
    });

    const oldLevel = record.level;
    const newLevel = levelFromXp(record.xp);
    const leveledUp = newLevel > oldLevel;

    if (leveledUp) {
        await prisma.userXp.update({
            where: {id: record.id},
            data: {level: newLevel},
        });
    }

    return {ok: true, xp: record.xp, level: newLevel, leveledUp, oldLevel, newLevel};
}

export async function getUserXp(guildId: string, userId: string): Promise<UserXp | null> {
    return prisma.userXp.findUnique({where: {guildId_userId: {guildId, userId}}});
}

export async function getUserRank(guildId: string, userId: string): Promise<number> {
    const user = await prisma.userXp.findUnique({where: {guildId_userId: {guildId, userId}}});
    if (!user) return 0;

    const count = await prisma.userXp.count({
        where: {guildId, xp: {gt: user.xp}},
    });
    return count + 1;
}

export async function setUserXp(
    guildId: string,
    userId: string,
    xp: number,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        const newLevel = levelFromXp(xp);
        await prisma.userXp.upsert({
            where: {guildId_userId: {guildId, userId}},
            update: {xp, level: newLevel},
            create: {guildId, userId, xp, level: newLevel},
        });
        return {ok: true};
    } catch (error) {
        logger.error('Failed to set user XP', error, {guildId, userId});
        return {ok: false, reason: 'ユーザーXPの設定に失敗しました。'};
    }
}
