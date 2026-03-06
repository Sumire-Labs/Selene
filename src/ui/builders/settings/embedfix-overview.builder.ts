import type {EmbedFixConfig} from '@prisma/client';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, type ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';

export function buildEmbedFixOverview(guildId: string, config: EmbedFixConfig): ContainerBuilder {
    const accentColor = config.enabled ? SeleneTheme.colors.blue : SeleneTheme.colors.grey;

    const container = createContainer(accentColor)
        .addTextDisplayComponents(createHeader(`🔗 埋め込み修正`))
        .addSeparatorComponents(createDivider());

    const statusIcon = config.enabled ? '✅' : '❌';
    const statusText = config.enabled ? '有効' : '無効';

    container.addTextDisplayComponents(
        createText(
            `**ステータス:** ${statusIcon} ${statusText}\n\n` +
            `Twitter/X・Instagram・TikTok・Bluesky・Redditのリンクを検出し、埋め込みプレビューを自動表示します。`,
        ),
    );
    container.addSeparatorComponents(createDivider());

    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:ef-toggle:${guildId}`)
                .setLabel(config.enabled ? '❌ 無効化' : '✅ 有効化')
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`settings:back:${guildId}`)
                .setLabel('◀ 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
