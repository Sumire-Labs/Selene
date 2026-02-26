import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import type {PeriodFilter, UserCount, WordCount} from '../../../counter/counter-service.js';

function periodLabel(period: PeriodFilter): string {
    switch (period) {
        case 'd':
            return '今日';
        case 'w':
            return '今週';
        default:
            return '全期間';
    }
}

export function buildStatsView(
    guildId: string,
    period: PeriodFilter,
    wordCounts: WordCount[],
    userCounts: UserCount[],
): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.green)
        .addTextDisplayComponents(createHeader(`📊 ${SeleneTheme.prefixes.counter}統計 (${periodLabel(period)})`))
        .addSeparatorComponents(createDivider());

    // Word counts
    if (wordCounts.length === 0) {
        container.addTextDisplayComponents(createText('データがありません。'));
    } else {
        const wordLines = wordCounts.map(w => `${w.word} — ${w.count}回`);
        container.addTextDisplayComponents(createText(`📈 **単語別カウント:**\n${wordLines.join('\n')}`));
    }

    // User ranking
    if (userCounts.length > 0) {
        container.addSeparatorComponents(createDivider());
        const userLines = userCounts.map((u, i) => `${i + 1}. <@${u.userId}> — ${u.count}回`);
        container.addTextDisplayComponents(createText(`👑 **ユーザーランキング:**\n${userLines.join('\n')}`));
    }

    container.addSeparatorComponents(createDivider());

    // Tab buttons
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`counter:set:${guildId}:0`)
                .setLabel('📝 設定')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`counter:tab:${guildId}:sta`)
                .setLabel('📊 統計')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
        ),
    );

    // Period filter buttons
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`counter:sta:${guildId}:d`)
                .setLabel('📅 今日')
                .setStyle(period === 'd' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(period === 'd'),
            new ButtonBuilder()
                .setCustomId(`counter:sta:${guildId}:w`)
                .setLabel('📅 今週')
                .setStyle(period === 'w' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(period === 'w'),
            new ButtonBuilder()
                .setCustomId(`counter:sta:${guildId}:a`)
                .setLabel('📅 全期間')
                .setStyle(period === 'a' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(period === 'a'),
        ),
    );

    return container;
}
