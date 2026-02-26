import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {MATCH_TYPE_EXACT, MATCH_TYPE_WORD} from '../../../config/constants.js';

interface CounterItem {
    word: string;
    matchType: number;
}

function matchLabel(matchType: number): string {
    switch (matchType) {
        case MATCH_TYPE_EXACT:
            return '完全一致';
        case MATCH_TYPE_WORD:
            return '単語一致';
        default:
            return '部分一致';
    }
}

export function buildSettingsView(
    guildId: string,
    counters: CounterItem[],
    selectedIdx: number,
): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader(`📝 ${SeleneTheme.prefixes.counter}設定`))
        .addSeparatorComponents(createDivider());

    if (counters.length === 0) {
        container.addTextDisplayComponents(createText('登録されたカウンターはありません。'));
    } else {
        const lines = counters.map((c, i) => {
            const prefix = i === selectedIdx ? '▸ ' : '   ';
            return `${prefix}**${c.word}** (${matchLabel(c.matchType)})`;
        });
        container.addTextDisplayComponents(createText(lines.join('\n')));
    }

    container.addSeparatorComponents(createDivider());

    // Tab buttons
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`counter:tab:${guildId}:set`)
                .setLabel('📝 設定')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`counter:sta:${guildId}:a`)
                .setLabel('📊 統計')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    // Action buttons
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`counter:up:${guildId}:${selectedIdx}`)
                .setLabel('▲')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(counters.length === 0),
            new ButtonBuilder()
                .setCustomId(`counter:dn:${guildId}:${selectedIdx}`)
                .setLabel('▼')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(counters.length === 0),
            new ButtonBuilder()
                .setCustomId(`counter:del:${guildId}:${selectedIdx}`)
                .setLabel('🗑 削除')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(counters.length === 0),
            new ButtonBuilder()
                .setCustomId(`counter:add:${guildId}:0`)
                .setLabel('➕ 追加')
                .setStyle(ButtonStyle.Success),
        ),
    );

    return container;
}
