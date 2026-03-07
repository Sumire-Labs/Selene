import type {XpConfig} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';
import {invalidateXpCache} from './xp-cache.js';
import type {NotificationMode} from './types.js';

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
