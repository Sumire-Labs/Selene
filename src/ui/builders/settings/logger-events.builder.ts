import type {LoggerConfig} from '@prisma/client';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ContainerBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {
    CATEGORY_EVENTS,
    CATEGORY_LABELS,
    EVENT_LABELS,
    LogEventCategory,
    type LogEventCategoryType,
} from '../../../settings/types.js';

export function buildLoggerEventsView(
    guildId: string,
    config: LoggerConfig,
    activeCategory: LogEventCategoryType,
): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(
            createHeader(`${CATEGORY_LABELS[activeCategory]}イベント設定`),
        )
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText('記録するイベントを選択してください。'));

    // StringSelectMenu for events in active category
    const events = CATEGORY_EVENTS[activeCategory];
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`settings:log-evsel:${guildId}:${activeCategory}`)
        .setPlaceholder('イベントを選択...')
        .setMinValues(0)
        .setMaxValues(events.length)
        .addOptions(
            events.map(event => ({
                label: EVENT_LABELS[event],
                value: event,
                default: config.enabledEvents.includes(event),
            })),
        );

    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
    );
    container.addSeparatorComponents(createDivider());

    // Category tab buttons
    const categories = Object.values(LogEventCategory) as LogEventCategoryType[];
    const tabRow = new ActionRowBuilder<ButtonBuilder>();

    for (const cat of categories) {
        tabRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:log-evcat:${guildId}:${cat}`)
                .setLabel(CATEGORY_LABELS[cat])
                .setStyle(cat === activeCategory ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(cat === activeCategory),
        );
    }
    container.addActionRowComponents(tabRow);

    // Back button
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:log-evback:${guildId}`)
                .setLabel('◀ 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
