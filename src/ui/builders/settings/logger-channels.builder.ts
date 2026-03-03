import type {LoggerConfig} from '@prisma/client';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    type ContainerBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {
    CATEGORY_CHANNEL_FIELD,
    CATEGORY_LABELS,
    LogEventCategory,
    type LogEventCategoryType,
} from '../../../settings/types.js';

export function buildLoggerChannelsView(
    guildId: string,
    config: LoggerConfig,
    activeCategory: LogEventCategoryType,
): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('📁 チャンネル設定'))
        .addSeparatorComponents(createDivider());

    // Default channel select
    container.addTextDisplayComponents(createText('**デフォルトチャンネル:**'));

    const defaultSelect = new ChannelSelectMenuBuilder()
        .setCustomId(`settings:log-chdef:${guildId}`)
        .setPlaceholder('デフォルトチャンネルを選択...')
        .setChannelTypes(ChannelType.GuildText);

    if (config.defaultChannelId) {
        defaultSelect.setDefaultChannels([config.defaultChannelId]);
    }

    container.addActionRowComponents(
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(defaultSelect),
    );
    container.addSeparatorComponents(createDivider());

    // Category channel summary
    const categories = Object.values(LogEventCategory) as LogEventCategoryType[];
    const lines: string[] = [];
    for (const cat of categories) {
        const field = CATEGORY_CHANNEL_FIELD[cat];
        const channelId = config[field] as string | null;
        const marker = cat === activeCategory ? '▸ ' : '   ';
        const display = channelId ? `<#${channelId}>` : 'デフォルト';
        lines.push(`${marker}${CATEGORY_LABELS[cat]}: ${display}`);
    }

    container.addTextDisplayComponents(createText('**個別チャンネル:**\n' + lines.join('\n')));

    // Category override select
    container.addTextDisplayComponents(
        createText(`${CATEGORY_LABELS[activeCategory]}の送信先:`),
    );

    const catSelect = new ChannelSelectMenuBuilder()
        .setCustomId(`settings:log-chcat:${guildId}:${activeCategory}`)
        .setPlaceholder('チャンネルを選択...')
        .setChannelTypes(ChannelType.GuildText);

    const currentField = CATEGORY_CHANNEL_FIELD[activeCategory];
    const currentChannelId = config[currentField] as string | null;
    if (currentChannelId) {
        catSelect.setDefaultChannels([currentChannelId]);
    }

    container.addActionRowComponents(
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(catSelect),
    );

    // Category tab buttons + reset
    const tabRow = new ActionRowBuilder<ButtonBuilder>();
    for (const cat of categories) {
        tabRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:log-chtab:${guildId}:${cat}`)
                .setLabel(CATEGORY_LABELS[cat])
                .setStyle(cat === activeCategory ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(cat === activeCategory),
        );
    }
    tabRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`settings:log-chrst:${guildId}:${activeCategory}`)
            .setLabel('🔄 リセット')
            .setStyle(ButtonStyle.Danger),
    );
    container.addActionRowComponents(tabRow);

    // Back button
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:log-chback:${guildId}`)
                .setLabel('◀ 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
