import type {XpRoleReward} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';
import {MAX_XP_ROLE_REWARDS} from '../config/constants.js';

export async function getRoleRewards(guildId: string): Promise<XpRoleReward[]> {
    return prisma.xpRoleReward.findMany({
        where: {guildId},
        orderBy: {level: 'asc'},
    });
}

export async function addRoleReward(
    guildId: string,
    level: number,
    roleId: string,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        const count = await prisma.xpRoleReward.count({where: {guildId}});
        if (count >= MAX_XP_ROLE_REWARDS) {
            return {ok: false, reason: `ロール報酬は最大${MAX_XP_ROLE_REWARDS}個までです。`};
        }
        await prisma.xpRoleReward.upsert({
            where: {guildId_level: {guildId, level}},
            update: {roleId},
            create: {guildId, level, roleId},
        });
        return {ok: true};
    } catch (error) {
        logger.error('Failed to add role reward', error, {guildId, level});
        return {ok: false, reason: 'ロール報酬の追加に失敗しました。'};
    }
}

export async function removeRoleReward(
    guildId: string,
    rewardId: number,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.xpRoleReward.delete({where: {id: rewardId}});
        return {ok: true};
    } catch (error) {
        logger.error('Failed to remove role reward', error, {guildId, rewardId});
        return {ok: false, reason: 'ロール報酬の削除に失敗しました。'};
    }
}

export async function getRewardsForLevel(guildId: string, level: number): Promise<XpRoleReward[]> {
    return prisma.xpRoleReward.findMany({
        where: {guildId, level: {lte: level}},
        orderBy: {level: 'asc'},
    });
}
