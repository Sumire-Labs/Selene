import type {Guild, GuildMember} from 'discord.js';
import {logger} from '../utils/logger.js';
import {GUARD_MAX_KICK_BATCH} from '../config/constants.js';
import {invalidateScanCache} from './guard-service.js';

interface ActionResult {
    ok: boolean;
    reason?: string;
}

function validateTarget(guild: Guild, executor: GuildMember, target: GuildMember): ActionResult {
    if (target.user.bot && target.id === guild.client.user?.id) {
        return {ok: false, reason: 'Bot自身に対してこの操作は実行できません。'};
    }
    if (target.id === executor.id) {
        return {ok: false, reason: '自分自身に対してこの操作は実行できません。'};
    }
    if (target.id === guild.ownerId) {
        return {ok: false, reason: 'サーバーオーナーに対してこの操作は実行できません。'};
    }
    const botMember = guild.members.me;
    if (botMember && target.roles.highest.position >= botMember.roles.highest.position) {
        return {ok: false, reason: 'Botより上位のロールを持つメンバーには操作できません。'};
    }
    if (target.roles.highest.position >= executor.roles.highest.position && executor.id !== guild.ownerId) {
        return {ok: false, reason: '自分と同等以上のロールを持つメンバーには操作できません。'};
    }
    return {ok: true};
}

export async function kickMember(
    guild: Guild,
    executor: GuildMember,
    targetId: string,
    reason?: string,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        const target = await guild.members.fetch(targetId).catch(() => null);
        if (!target) return {ok: false, reason: '対象メンバーが見つかりません。'};

        const validation = validateTarget(guild, executor, target);
        if (!validation.ok) return {ok: false, reason: validation.reason!};

        await target.kick(reason ?? 'ガード: 管理者によるKick');
        invalidateScanCache(guild.id);
        logger.info('Guard: member kicked', {guildId: guild.id, targetId, executorId: executor.id});
        return {ok: true};
    } catch (error) {
        logger.error('Guard: failed to kick member', error, {guildId: guild.id, targetId});
        return {ok: false, reason: 'Kickの実行に失敗しました。'};
    }
}

export async function banMember(
    guild: Guild,
    executor: GuildMember,
    targetId: string,
    reason?: string,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        const target = await guild.members.fetch(targetId).catch(() => null);
        if (!target) return {ok: false, reason: '対象メンバーが見つかりません。'};

        const validation = validateTarget(guild, executor, target);
        if (!validation.ok) return {ok: false, reason: validation.reason!};

        await target.ban({reason: reason ?? 'ガード: 管理者によるBAN'});
        invalidateScanCache(guild.id);
        logger.info('Guard: member banned', {guildId: guild.id, targetId, executorId: executor.id});
        return {ok: true};
    } catch (error) {
        logger.error('Guard: failed to ban member', error, {guildId: guild.id, targetId});
        return {ok: false, reason: 'BANの実行に失敗しました。'};
    }
}

export async function kickInactiveMembers(
    guild: Guild,
    executor: GuildMember,
    userIds: string[],
    reason?: string,
): Promise<{ok: true; kicked: number; failed: number} | {ok: false; reason: string}> {
    const batch = userIds.slice(0, GUARD_MAX_KICK_BATCH);
    let kicked = 0;
    let failed = 0;

    for (const userId of batch) {
        const result = await kickMember(guild, executor, userId, reason ?? 'ガード: 非アクティブ一括Kick');
        if (result.ok) {
            kicked++;
        } else {
            failed++;
        }
    }

    invalidateScanCache(guild.id);
    logger.info('Guard: batch kick completed', {guildId: guild.id, kicked, failed, total: batch.length});
    return {ok: true, kicked, failed};
}
