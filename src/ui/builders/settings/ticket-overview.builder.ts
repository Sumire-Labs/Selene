import type {TicketConfig} from '@prisma/client';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, type ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {TICKET_DEFAULT_TITLE, TICKET_DEFAULT_DESCRIPTION} from '../../../config/constants.js';

export function buildTicketOverview(guildId: string, config: TicketConfig): ContainerBuilder {
    const isConfigured = !!(config.panelChannelId && config.categoryId && config.supportRoleId);
    const accentColor = isConfigured ? SeleneTheme.colors.blue : SeleneTheme.colors.grey;

    const container = createContainer(accentColor)
        .addTextDisplayComponents(createHeader('🎫 チケット設定'))
        .addSeparatorComponents(createDivider());

    // Status
    const statusIcon = isConfigured ? '✅' : '⚠️';
    const statusText = isConfigured ? '設定済み' : '未設定';
    const panelCh = config.panelChannelId ? `<#${config.panelChannelId}>` : '未設定';
    const category = config.categoryId ? `<#${config.categoryId}>` : '未設定';
    const role = config.supportRoleId ? `<@&${config.supportRoleId}>` : '未設定';

    container.addTextDisplayComponents(
        createText(
            `**ステータス:** ${statusIcon} ${statusText}\n` +
            `**パネルチャンネル:** ${panelCh}\n` +
            `**カテゴリ:** ${category}\n` +
            `**サポートロール:** ${role}`,
        ),
    );
    container.addSeparatorComponents(createDivider());

    // Panel customization
    const title = config.panelTitle || TICKET_DEFAULT_TITLE;
    const desc = config.panelDescription || TICKET_DEFAULT_DESCRIPTION;
    const descPreview = desc.length > 50 ? desc.slice(0, 50) + '...' : desc;

    container.addTextDisplayComponents(
        createText(
            `**パネルタイトル:** ${title}\n` +
            `**パネル説明:** ${descPreview}`,
        ),
    );
    container.addSeparatorComponents(createDivider());

    // Advanced settings
    const maxDisplay = config.maxTicketsPerUser === 0 ? '無制限' : `${config.maxTicketsPerUser}`;
    const autoCloseDisplay = config.autoCloseHours
        ? `${config.autoCloseHours}時間`
        : '無効';

    container.addTextDisplayComponents(
        createText(`**ユーザー上限:** ${maxDisplay} / **自動クローズ:** ${autoCloseDisplay}`),
    );
    container.addSeparatorComponents(createDivider());

    // Buttons row 1
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:ticket-setup:${guildId}`)
                .setLabel('🔧 基本設定')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`settings:ticket-edit:${guildId}`)
                .setLabel('✏️ パネル編集')
                .setStyle(ButtonStyle.Primary),
        ),
    );

    // Buttons row 2
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:ticket-adv:${guildId}`)
                .setLabel('⚙️ 詳細設定')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`settings:ticket-deploy:${guildId}`)
                .setLabel('📤 パネル送信')
                .setStyle(ButtonStyle.Success)
                .setDisabled(!isConfigured),
            new ButtonBuilder()
                .setCustomId(`settings:back:${guildId}`)
                .setLabel('◀ 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
