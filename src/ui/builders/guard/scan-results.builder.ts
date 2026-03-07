import {ActionRowBuilder, ButtonBuilder, ButtonStyle, type ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import type {InactiveMember} from '../../../guard/types.js';
import {GUARD_SCAN_PAGE_SIZE} from '../../../config/constants.js';

export function buildGuardScanResults(
    guildId: string,
    members: InactiveMember[],
    page: number,
): ContainerBuilder {
    const totalPages = Math.max(1, Math.ceil(members.length / GUARD_SCAN_PAGE_SIZE));
    const currentPage = Math.min(page, totalPages - 1);
    const start = currentPage * GUARD_SCAN_PAGE_SIZE;
    const pageMembers = members.slice(start, start + GUARD_SCAN_PAGE_SIZE);

    const container = createContainer(members.length > 0 ? SeleneTheme.colors.red : SeleneTheme.colors.green)
        .addTextDisplayComponents(
            createHeader(`\u{1F50D} ${SeleneTheme.prefixes.guard} - スキャン結果`),
        )
        .addSeparatorComponents(createDivider());

    if (members.length === 0) {
        container.addTextDisplayComponents(
            createText('\u2705 非アクティブなメンバーは見つかりませんでした。'),
        );
    } else {
        container.addTextDisplayComponents(
            createText(`**${members.length}人** の非アクティブメンバーが見つかりました。`),
        );
        container.addSeparatorComponents(createDivider());

        const lines = pageMembers.map((m, i) => {
            const idx = start + i + 1;
            const lastAct = m.lastActivity
                ? `<t:${Math.floor(m.lastActivity.getTime() / 1000)}:R>`
                : '記録なし';
            return `**${idx}.** <@${m.userId}> — 最終活動: ${lastAct}`;
        });

        container.addTextDisplayComponents(createText(lines.join('\n')));
    }

    container.addSeparatorComponents(createDivider());
    container.addTextDisplayComponents(
        createText(`ページ ${currentPage + 1} / ${totalPages}`),
    );

    // Pagination + action buttons
    const navRow = new ActionRowBuilder<ButtonBuilder>();
    navRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`guard:scan-page:${guildId}:${currentPage - 1}`)
            .setLabel('\u25C0')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0),
        new ButtonBuilder()
            .setCustomId(`guard:scan-page:${guildId}:${currentPage + 1}`)
            .setLabel('\u25B6')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage >= totalPages - 1),
    );

    if (members.length > 0) {
        navRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`guard:scan-kickall:${guildId}`)
                .setLabel(`\u{1F462} 全員Kick (${members.length}人)`)
                .setStyle(ButtonStyle.Danger),
        );
    }

    navRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`guard:back:${guildId}`)
            .setLabel('\u25C0 戻る')
            .setStyle(ButtonStyle.Secondary),
    );

    container.addActionRowComponents(navRow);

    return container;
}
