import type {LoggerConfig} from '@prisma/client';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, type ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {
    CATEGORY_CHANNEL_FIELD,
    CATEGORY_EVENTS,
    CATEGORY_LABELS,
    LogEventCategory,
    type LogEventCategoryType,
} from '../../../settings/types.js';

export function buildLoggerOverview(guildId: string, config: LoggerConfig): ContainerBuilder {
    const accentColor = config.enabled ? SeleneTheme.colors.blue : SeleneTheme.colors.grey;

    const container = createContainer(accentColor)
        .addTextDisplayComponents(createHeader(`📋 ${SeleneTheme.prefixes.logger}`))
        .addSeparatorComponents(createDivider());

    // Status & default channel
    const statusIcon = config.enabled ? '✅' : '❌';
    const statusText = config.enabled ? '有効' : '無効';
    const defaultCh = config.defaultChannelId
        ? `<#${config.defaultChannelId}>`
        : '未設定';

    container.addTextDisplayComponents(
        createText(
            `**ステータス:** ${statusIcon} ${statusText}\n` +
            `**デフォルトチャンネル:** ${defaultCh}`,
        ),
    );
    container.addSeparatorComponents(createDivider());

    // Per-category summary
    const categories = Object.values(LogEventCategory) as LogEventCategoryType[];
    const lines: string[] = [];

    for (const cat of categories) {
        const allEvents = CATEGORY_EVENTS[cat];
        const enabledCount = allEvents.filter(e => config.enabledEvents.includes(e)).length;
        const channelField = CATEGORY_CHANNEL_FIELD[cat];
        const channelId = config[channelField] as string | null;
        const channelDisplay = channelId ? `<#${channelId}>` : 'デフォルト';
        lines.push(`${CATEGORY_LABELS[cat]} (${enabledCount}/${allEvents.length}) → ${channelDisplay}`);
    }

    container.addTextDisplayComponents(createText(lines.join('\n')));
    container.addSeparatorComponents(createDivider());

    // Action buttons - row 1
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:log-toggle:${guildId}`)
                .setLabel(config.enabled ? '❌ 無効化' : '✅ 有効化')
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`settings:log-events:${guildId}`)
                .setLabel('📨 イベント設定')
                .setStyle(ButtonStyle.Primary),
        ),
    );

    // Action buttons - row 2
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:log-channels:${guildId}`)
                .setLabel('📁 チャンネル設定')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`settings:back:${guildId}`)
                .setLabel('◀ 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
