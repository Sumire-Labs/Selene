import type {TicketConfig} from '@prisma/client';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    type ContainerBuilder,
    RoleSelectMenuBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';

export function buildTicketSetupView(guildId: string, config: TicketConfig): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('🔧 チケット基本設定'))
        .addSeparatorComponents(createDivider());

    // Panel channel select
    container.addTextDisplayComponents(createText('**パネルチャンネル:**'));
    const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId(`settings:ticket-ch:${guildId}`)
        .setPlaceholder('パネルを送信するチャンネルを選択...')
        .setChannelTypes(ChannelType.GuildText);
    if (config.panelChannelId) {
        channelSelect.setDefaultChannels([config.panelChannelId]);
    }
    container.addActionRowComponents(
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelect),
    );

    // Category select
    container.addTextDisplayComponents(createText('**カテゴリ:**'));
    const categorySelect = new ChannelSelectMenuBuilder()
        .setCustomId(`settings:ticket-cat:${guildId}`)
        .setPlaceholder('チケットを作成するカテゴリを選択...')
        .setChannelTypes(ChannelType.GuildCategory);
    if (config.categoryId) {
        categorySelect.setDefaultChannels([config.categoryId]);
    }
    container.addActionRowComponents(
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(categorySelect),
    );

    // Support role select
    container.addTextDisplayComponents(createText('**サポートロール:**'));
    const roleSelect = new RoleSelectMenuBuilder()
        .setCustomId(`settings:ticket-role:${guildId}`)
        .setPlaceholder('サポートロールを選択...');
    if (config.supportRoleId) {
        roleSelect.setDefaultRoles([config.supportRoleId]);
    }
    container.addActionRowComponents(
        new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect),
    );

    container.addSeparatorComponents(createDivider());

    // Back button
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:ticket-back:${guildId}`)
                .setLabel('◀ 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
