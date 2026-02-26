import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';

export function buildTicketPanelView(): ContainerBuilder {
    return createContainer(SeleneTheme.colors.purple)
        .addTextDisplayComponents(createHeader(`🎫 ${SeleneTheme.prefixes.ticket}`))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText('サポートが必要な場合は、下のボタンからチケットを作成してください。\nスタッフが対応いたします。'),
        )
        .addSeparatorComponents(createDivider())
        .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket:create')
                    .setLabel('🎫 チケットを作成')
                    .setStyle(ButtonStyle.Primary),
            ),
        );
}

export function buildTicketWelcomeView(
    userId: string,
    title: string,
    description: string,
): ContainerBuilder {
    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader(`🎫 ${title}`))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(`**作成者:** <@${userId}>`))
        .addTextDisplayComponents(createText(description))
        .addSeparatorComponents(createDivider())
        .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket:close')
                    .setLabel('🔒 チケットを閉じる')
                    .setStyle(ButtonStyle.Danger),
            ),
        );
}

export function buildTicketSetupConfirmView(
    panelChannelId: string,
    categoryId: string,
    supportRoleId: string,
): ContainerBuilder {
    return createContainer(SeleneTheme.colors.green)
        .addTextDisplayComponents(createHeader(`🎫 ${SeleneTheme.prefixes.ticket}設定完了`))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**パネルチャンネル:** <#${panelChannelId}>\n` +
                `**カテゴリ:** <#${categoryId}>\n` +
                `**サポートロール:** <@&${supportRoleId}>`,
            ),
        )
        .addTextDisplayComponents(
            createText('チケットシステムのセットアップが完了しました。'),
        );
}
