import type {EmbedFixConfig} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';
import {invalidateEmbedFixCache} from './embedfix-cache.js';

export async function getEmbedFixConfig(guildId: string): Promise<EmbedFixConfig | null> {
    return prisma.embedFixConfig.findUnique({where: {guildId}});
}

export async function ensureEmbedFixConfig(
    guildId: string,
): Promise<{ok: true; config: EmbedFixConfig} | {ok: false; reason: string}> {
    try {
        const config = await prisma.embedFixConfig.upsert({
            where: {guildId},
            update: {},
            create: {guildId},
        });
        return {ok: true, config};
    } catch (error) {
        logger.error('Failed to ensure embedfix config', error, {guildId});
        return {ok: false, reason: '埋め込み修正設定の初期化に失敗しました。'};
    }
}

export async function toggleEmbedFix(
    guildId: string,
): Promise<{ok: true; enabled: boolean} | {ok: false; reason: string}> {
    try {
        const current = await prisma.embedFixConfig.findUnique({where: {guildId}});
        if (!current) {
            return {ok: false, reason: '埋め込み修正設定が見つかりません。'};
        }
        const updated = await prisma.embedFixConfig.update({
            where: {guildId},
            data: {enabled: !current.enabled},
        });
        invalidateEmbedFixCache(guildId);
        return {ok: true, enabled: updated.enabled};
    } catch (error) {
        logger.error('Failed to toggle embedfix', error, {guildId});
        return {ok: false, reason: '埋め込み修正の切り替えに失敗しました。'};
    }
}
