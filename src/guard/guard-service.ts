import type {GuardConfig} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';
import {invalidateGuardCache} from './guard-cache.js';
import type {InactiveMember} from './types.js';
import {GUARD_SCAN_CACHE_TTL_MS} from '../config/constants.js';
import type {Guild} from 'discord.js';

// --- Config CRUD ---

export async function getGuardConfig(guildId: string): Promise<GuardConfig | null> {
    return prisma.guardConfig.findUnique({where: {guildId}});
}

export async function ensureGuardConfig(
    guildId: string,
): Promise<{ok: true; config: GuardConfig} | {ok: false; reason: string}> {
    try {
        const config = await prisma.guardConfig.upsert({
            where: {guildId},
            update: {},
            create: {guildId},
        });
        return {ok: true, config};
    } catch (error) {
        logger.error('Failed to ensure guard config', error, {guildId});
        return {ok: false, reason: 'ガード設定の初期化に失敗しました。'};
    }
}

export async function toggleGuard(
    guildId: string,
): Promise<{ok: true; enabled: boolean} | {ok: false; reason: string}> {
    try {
        const current = await prisma.guardConfig.findUnique({where: {guildId}});
        if (!current) return {ok: false, reason: 'ガード設定が見つかりません。'};
        const updated = await prisma.guardConfig.update({
            where: {guildId},
            data: {enabled: !current.enabled},
        });
        invalidateGuardCache(guildId);
        return {ok: true, enabled: updated.enabled};
    } catch (error) {
        logger.error('Failed to toggle guard', error, {guildId});
        return {ok: false, reason: 'ガードの切り替えに失敗しました。'};
    }
}

export async function updateInactivityDays(
    guildId: string,
    days: number,
): Promise<{ok: true; config: GuardConfig} | {ok: false; reason: string}> {
    try {
        const config = await prisma.guardConfig.update({
            where: {guildId},
            data: {inactivityDays: days},
        });
        invalidateGuardCache(guildId);
        return {ok: true, config};
    } catch (error) {
        logger.error('Failed to update inactivity days', error, {guildId});
        return {ok: false, reason: '非アクティブ期間の更新に失敗しました。'};
    }
}

export async function updateTrackingCriteria(
    guildId: string,
    trackMessages: boolean,
    trackReactions: boolean,
    trackVoice: boolean,
): Promise<{ok: true; config: GuardConfig} | {ok: false; reason: string}> {
    try {
        const config = await prisma.guardConfig.update({
            where: {guildId},
            data: {trackMessages, trackReactions, trackVoice},
        });
        invalidateGuardCache(guildId);
        return {ok: true, config};
    } catch (error) {
        logger.error('Failed to update tracking criteria', error, {guildId});
        return {ok: false, reason: 'トラッキング対象の更新に失敗しました。'};
    }
}

export async function updateLogChannel(
    guildId: string,
    logChannelId: string | null,
): Promise<{ok: true; config: GuardConfig} | {ok: false; reason: string}> {
    try {
        const config = await prisma.guardConfig.update({
            where: {guildId},
            data: {logChannelId},
        });
        invalidateGuardCache(guildId);
        return {ok: true, config};
    } catch (error) {
        logger.error('Failed to update log channel', error, {guildId});
        return {ok: false, reason: 'ログチャンネルの更新に失敗しました。'};
    }
}

// --- Activity tracking ---

export async function updateMemberActivity(
    guildId: string,
    userId: string,
    field: 'lastMessageAt' | 'lastReactionAt' | 'lastVoiceAt',
): Promise<void> {
    try {
        const now = new Date();
        await prisma.memberActivity.upsert({
            where: {guildId_userId: {guildId, userId}},
            update: {[field]: now},
            create: {guildId, userId, [field]: now},
        });
    } catch (error) {
        logger.error('Failed to update member activity', error, {guildId, userId, field});
    }
}

// --- Inactive scan ---

const scanCache = new Map<string, {members: InactiveMember[]; cachedAt: number}>();

export async function scanInactiveMembers(
    guild: Guild,
    config: GuardConfig,
): Promise<InactiveMember[]> {
    const cacheKey = guild.id;
    const cached = scanCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < GUARD_SCAN_CACHE_TTL_MS) {
        return cached.members;
    }

    const members = await guild.members.fetch();
    const activities = await prisma.memberActivity.findMany({
        where: {guildId: guild.id},
    });

    const activityMap = new Map(activities.map(a => [a.userId, a]));
    const threshold = new Date(Date.now() - config.inactivityDays * 24 * 60 * 60 * 1000);
    const inactive: InactiveMember[] = [];

    for (const [, member] of members) {
        if (member.user.bot) continue;
        if (member.id === guild.ownerId) continue;

        const activity = activityMap.get(member.id);
        let lastActivity: Date | null = null;

        if (activity) {
            const dates: Date[] = [];
            if (config.trackMessages && activity.lastMessageAt) dates.push(activity.lastMessageAt);
            if (config.trackReactions && activity.lastReactionAt) dates.push(activity.lastReactionAt);
            if (config.trackVoice && activity.lastVoiceAt) dates.push(activity.lastVoiceAt);
            if (dates.length > 0) {
                lastActivity = new Date(Math.max(...dates.map(d => d.getTime())));
            }
        }

        if (!lastActivity || lastActivity < threshold) {
            inactive.push({
                userId: member.id,
                lastActivity,
                joinedAt: member.joinedAt,
            });
        }
    }

    scanCache.set(cacheKey, {members: inactive, cachedAt: Date.now()});
    return inactive;
}

export function invalidateScanCache(guildId: string): void {
    scanCache.delete(guildId);
}
