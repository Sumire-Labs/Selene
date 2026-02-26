import {prisma} from '../database/client.js';
import {logger} from '../utils/logger.js';

export interface TicketConfigData {
    guildId: string;
    panelChannelId: string;
    categoryId: string;
    supportRoleId: string;
    panelMessageId: string | null;
    ticketCounter: number;
}

export async function upsertTicketConfig(
    guildId: string,
    panelChannelId: string,
    categoryId: string,
    supportRoleId: string,
): Promise<{ ok: true; config: TicketConfigData } | { ok: false; reason: string }> {
    try {
        const config = await prisma.ticketConfig.upsert({
            where: {guildId},
            update: {panelChannelId, categoryId, supportRoleId},
            create: {guildId, panelChannelId, categoryId, supportRoleId},
        });
        return {ok: true, config};
    } catch (error) {
        logger.error('Failed to upsert ticket config', error, {guildId});
        return {ok: false, reason: 'チケット設定の保存に失敗しました。'};
    }
}

export async function getTicketConfig(guildId: string): Promise<TicketConfigData | null> {
    return prisma.ticketConfig.findUnique({where: {guildId}});
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
