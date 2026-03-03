import type {LoggerConfig} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';
import {invalidateLoggerCache} from './logger-cache.js';
import {CATEGORY_CHANNEL_FIELD, type LogEventCategoryType} from './types.js';

export type LoggerConfigData = LoggerConfig;

export async function getLoggerConfig(guildId: string): Promise<LoggerConfigData | null> {
    return prisma.loggerConfig.findUnique({where: {guildId}});
}

export async function ensureLoggerConfig(
    guildId: string,
): Promise<{ok: true; config: LoggerConfigData} | {ok: false; reason: string}> {
    try {
        const config = await prisma.loggerConfig.upsert({
            where: {guildId},
            update: {},
            create: {guildId},
        });
        return {ok: true, config};
    } catch (error) {
        logger.error('Failed to ensure logger config', error, {guildId});
        return {ok: false, reason: 'ロガー設定の初期化に失敗しました。'};
    }
}

export async function toggleLogger(
    guildId: string,
): Promise<{ok: true; enabled: boolean} | {ok: false; reason: string}> {
    try {
        const current = await prisma.loggerConfig.findUnique({where: {guildId}});
        if (!current) {
            return {ok: false, reason: 'ロガー設定が見つかりません。'};
        }
        const updated = await prisma.loggerConfig.update({
            where: {guildId},
            data: {enabled: !current.enabled},
        });
        invalidateLoggerCache(guildId);
        return {ok: true, enabled: updated.enabled};
    } catch (error) {
        logger.error('Failed to toggle logger', error, {guildId});
        return {ok: false, reason: 'ロガーの切り替えに失敗しました。'};
    }
}

export async function setDefaultChannel(
    guildId: string,
    channelId: string,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.loggerConfig.update({
            where: {guildId},
            data: {defaultChannelId: channelId},
        });
        invalidateLoggerCache(guildId);
        return {ok: true};
    } catch (error) {
        logger.error('Failed to set default channel', error, {guildId});
        return {ok: false, reason: 'デフォルトチャンネルの設定に失敗しました。'};
    }
}

export async function setCategoryChannel(
    guildId: string,
    category: LogEventCategoryType,
    channelId: string | null,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        const field = CATEGORY_CHANNEL_FIELD[category];
        await prisma.loggerConfig.update({
            where: {guildId},
            data: {[field]: channelId},
        });
        invalidateLoggerCache(guildId);
        return {ok: true};
    } catch (error) {
        logger.error('Failed to set category channel', error, {guildId, category});
        return {ok: false, reason: 'カテゴリチャンネルの設定に失敗しました。'};
    }
}

export async function updateEnabledEvents(
    guildId: string,
    events: string[],
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.loggerConfig.update({
            where: {guildId},
            data: {enabledEvents: events},
        });
        invalidateLoggerCache(guildId);
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update enabled events', error, {guildId});
        return {ok: false, reason: 'イベント設定の更新に失敗しました。'};
    }
}
