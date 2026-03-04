import type {XpConfig} from '@prisma/client';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    type ContainerBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {NOTIFICATION_MODE_OPTIONS} from '../../../xp/types.js';

export function buildXpNotificationView(guildId: string, config: XpConfig): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('🔔 レベルアップ通知設定'))
        .addSeparatorComponents(createDivider());

    // Notification mode
    container.addTextDisplayComponents(createText('**通知モード:**'));
    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`settings:xp-nmode:${guildId}`)
                .addOptions(
                    NOTIFICATION_MODE_OPTIONS.map(opt =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(opt.label)
                            .setValue(opt.value)
                            .setDefault(opt.value === config.notificationMode),
                    ),
                ),
        ),
    );

    // Channel select (only for dedicated mode)
    if (config.notificationMode === 'dedicated') {
        container.addTextDisplayComponents(createText('**通知チャンネル:**'));
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId(`settings:xp-nch:${guildId}`)
            .setPlaceholder('通知を送信するチャンネルを選択...')
            .setChannelTypes(ChannelType.GuildText);
        if (config.notificationChannelId) {
            channelSelect.setDefaultChannels([config.notificationChannelId]);
        }
        container.addActionRowComponents(
            new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelect),
        );
    }

    container.addSeparatorComponents(createDivider());

    // Back button
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:xp-back:${guildId}`)
                .setLabel('◀ 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
