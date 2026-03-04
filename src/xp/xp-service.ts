import type {XpConfig, UserXp, XpRoleReward} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';
import {invalidateXpCache} from './xp-cache.js';
import {levelFromXp} from './xp-table.js';
import {MAX_XP_ROLE_REWARDS} from '../config/constants.js';
import type {NotificationMode, AddXpResult} from './types.js';

// ────────────────── Config CRUD ──────────────────

export async function getXpConfig(guildId: string): Promise<XpConfig | null> {
    return prisma.xpConfig.findUnique({where: {guildId}});
}

export async function ensureXpConfig(
    guildId: string,
): Promise<{ok: true; config: XpConfig} | {ok: false; reason: string}> {
    try {
        const config = await prisma.xpConfig.upsert({
            where: {guildId},
            update: {},
            create: {guildId},
        });
        return {ok: true, config};
    } catch (error) {
        logger.error('Failed to ensure XP config', error, {guildId});
        return {ok: false, reason: '経験値設定の初期化に失敗しました。'};
    }
}

export async function toggleXp(
    guildId: string,
): Promise<{ok: true; enabled: boolean} | {ok: false; reason: string}> {
    try {
        const current = await prisma.xpConfig.findUnique({where: {guildId}});
        if (!current) return {ok: false, reason: '経験値設定が見つかりません。'};
        const updated = await prisma.xpConfig.update({
            where: {guildId},
            data: {enabled: !current.enabled},
        });
        invalidateXpCache(guildId);
        return {ok: true, enabled: updated.enabled};
    } catch (error) {
        logger.error('Failed to toggle XP', error, {guildId});
        return {ok: false, reason: '経験値の切り替えに失敗しました。'};
    }
}

export async function updateMultiplier(
    guildId: string,
    multiplier: number,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.xpConfig.update({where: {guildId}, data: {multiplier}});
        invalidateXpCache(guildId);
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update multiplier', error, {guildId});
        return {ok: false, reason: '倍率の更新に失敗しました。'};
    }
}

export async function updateMessageXp(
    guildId: string,
    xp: number,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.xpConfig.update({where: {guildId}, data: {messageXp: xp}});
        invalidateXpCache(guildId);
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update message XP', error, {guildId});
        return {ok: false, reason: 'メッセージXPの更新に失敗しました。'};
    }
}

export async function updateVoiceXp(
    guildId: string,
    xp: number,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.xpConfig.update({where: {guildId}, data: {voiceXpPerMinute: xp}});
        invalidateXpCache(guildId);
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update voice XP', error, {guildId});
        return {ok: false, reason: 'ボイスXPの更新に失敗しました。'};
    }
}

export async function updateCooldown(
    guildId: string,
    seconds: number,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.xpConfig.update({where: {guildId}, data: {cooldownSeconds: seconds}});
        invalidateXpCache(guildId);
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update cooldown', error, {guildId});
        return {ok: false, reason: 'クールダウンの更新に失敗しました。'};
    }
}

export async function updateNotificationMode(
    guildId: string,
    mode: NotificationMode,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.xpConfig.update({where: {guildId}, data: {notificationMode: mode}});
        invalidateXpCache(guildId);
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update notification mode', error, {guildId});
        return {ok: false, reason: '通知モードの更新に失敗しました。'};
    }
}

export async function updateNotificationChannel(
    guildId: string,
    channelId: string | null,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.xpConfig.update({where: {guildId}, data: {notificationChannelId: channelId}});
        invalidateXpCache(guildId);
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update notification channel', error, {guildId});
        return {ok: false, reason: '通知チャンネルの更新に失敗しました。'};
    }
}

// ────────────────── User XP ──────────────────

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

// ────────────────── Role Rewards ──────────────────

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
