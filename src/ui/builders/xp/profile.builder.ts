import type {ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {levelProgress} from '../../../xp/xp-table.js';
import {formatCompactNumber} from '../../../utils/formatters.js';

function buildProgressBar(current: number, total: number, length = 16): string {
    const filled = total > 0 ? Math.round((current / total) * length) : 0;
    const empty = length - filled;
    return '▰'.repeat(filled) + '▱'.repeat(empty);
}

function formatVoiceTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

function formatJoinDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return '今日';
    if (diffDays < 30) return `${diffDays}日前`;
    const months = Math.floor(diffDays / 30);
    if (months < 12) return `${months}ヶ月前`;
    const years = Math.floor(months / 12);
    return `${years}年前`;
}

export function buildProfileView(
    displayName: string,
    totalXp: number,
    rank: number,
    totalMessages: number,
    totalVoiceMinutes: number,
    joinedAt: Date | null,
): ContainerBuilder {
    const progress = levelProgress(totalXp);
    const bar = buildProgressBar(progress.currentXp, progress.requiredXp);

    const container = createContainer(SeleneTheme.colors.purple)
        .addTextDisplayComponents(
            createHeader(`${SeleneTheme.prefixes.profile}`),
        )
        .addSeparatorComponents(createDivider());

    // Level & rank
    container.addTextDisplayComponents(
        createText(
            `**${displayName}**\n` +
            `-# レベル ${progress.level} | ランク #${rank}\n` +
            `-# ${bar}\n` +
            `-# ${formatCompactNumber(progress.currentXp)} / ${formatCompactNumber(progress.requiredXp)} XP`,
        ),
    );
    container.addSeparatorComponents(createDivider());

    // Stats
    const lines = [
        `📨 メッセージ: **${formatCompactNumber(totalMessages)}**`,
        `🔊 通話時間: **${formatVoiceTime(totalVoiceMinutes)}**`,
    ];
    if (joinedAt) {
        lines.push(`📅 参加日: **${formatJoinDate(joinedAt)}**`);
    }

    container.addTextDisplayComponents(createText(lines.join('\n')));

    return container;
}
