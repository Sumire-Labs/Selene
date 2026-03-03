import type {TicketConfig} from '@prisma/client';
import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';

export type TicketConfigData = TicketConfig;

export async function ensureTicketConfig(
    guildId: string,
): Promise<{ok: true; config: TicketConfigData} | {ok: false; reason: string}> {
    try {
        const config = await prisma.ticketConfig.upsert({
            where: {guildId},
            update: {},
            create: {guildId},
        });
        return {ok: true, config};
    } catch (error) {
        logger.error('Failed to ensure ticket config', error, {guildId});
        return {ok: false, reason: 'チケット設定の初期化に失敗しました。'};
    }
}

export async function getTicketConfig(guildId: string): Promise<TicketConfigData | null> {
    return prisma.ticketConfig.findUnique({where: {guildId}});
}

export async function updatePanelChannel(
    guildId: string,
    channelId: string,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.ticketConfig.update({where: {guildId}, data: {panelChannelId: channelId}});
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update panel channel', error, {guildId});
        return {ok: false, reason: 'パネルチャンネルの設定に失敗しました。'};
    }
}

export async function updateCategory(
    guildId: string,
    categoryId: string,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.ticketConfig.update({where: {guildId}, data: {categoryId}});
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update category', error, {guildId});
        return {ok: false, reason: 'カテゴリの設定に失敗しました。'};
    }
}

export async function updateSupportRole(
    guildId: string,
    roleId: string,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.ticketConfig.update({where: {guildId}, data: {supportRoleId: roleId}});
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update support role', error, {guildId});
        return {ok: false, reason: 'サポートロールの設定に失敗しました。'};
    }
}

export async function updatePanelCustomization(
    guildId: string,
    title?: string,
    description?: string,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.ticketConfig.update({
            where: {guildId},
            data: {panelTitle: title, panelDescription: description},
        });
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update panel customization', error, {guildId});
        return {ok: false, reason: 'パネルのカスタマイズに失敗しました。'};
    }
}

export async function updateMaxTicketsPerUser(
    guildId: string,
    max: number,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.ticketConfig.update({where: {guildId}, data: {maxTicketsPerUser: max}});
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update max tickets per user', error, {guildId});
        return {ok: false, reason: 'ユーザー上限の設定に失敗しました。'};
    }
}

export async function updateAutoCloseHours(
    guildId: string,
    hours: number | null,
): Promise<{ok: true} | {ok: false; reason: string}> {
    try {
        await prisma.ticketConfig.update({where: {guildId}, data: {autoCloseHours: hours}});
        return {ok: true};
    } catch (error) {
        logger.error('Failed to update auto close hours', error, {guildId});
        return {ok: false, reason: '自動クローズの設定に失敗しました。'};
    }
}

export async function updatePanelMessageId(guildId: string, panelMessageId: string): Promise<void> {
    await prisma.ticketConfig.update({
        where: {guildId},
        data: {panelMessageId},
    });
}

export async function incrementTicketCounter(guildId: string): Promise<number> {
    const updated = await prisma.ticketConfig.update({
        where: {guildId},
        data: {ticketCounter: {increment: 1}},
    });
    return updated.ticketCounter;
}
