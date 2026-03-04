import type {XpConfig} from '@prisma/client';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, type ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {NOTIFICATION_MODE_LABELS, type NotificationMode} from '../../../xp/types.js';

export function buildXpOverview(
    guildId: string,
    config: XpConfig,
    rewardCount: number,
): ContainerBuilder {
    const accentColor = config.enabled ? SeleneTheme.colors.green : SeleneTheme.colors.grey;

    const container = createContainer(accentColor)
        .addTextDisplayComponents(createHeader(`📈 ${SeleneTheme.prefixes.xp}`))
        .addSeparatorComponents(createDivider());

    const statusIcon = config.enabled ? '✅' : '❌';
    const statusText = config.enabled ? '有効' : '無効';
    const mode = NOTIFICATION_MODE_LABELS[config.notificationMode as NotificationMode] ?? config.notificationMode;

    container.addTextDisplayComponents(
        createText(
            `**ステータス:** ${statusIcon} ${statusText}\n` +
            `**倍率:** ${config.multiplier}x\n` +
            `**メッセージXP:** ${config.messageXp} XP\n` +
            `**ボイスXP:** ${config.voiceXpPerMinute} XP/分\n` +
            `**クールダウン:** ${config.cooldownSeconds}秒\n` +
            `**通知モード:** ${mode}\n` +
            `**ロール報酬:** ${rewardCount}個`,
        ),
    );
    container.addSeparatorComponents(createDivider());

    // Row 1
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:xp-toggle:${guildId}`)
                .setLabel(config.enabled ? '❌ 無効化' : '✅ 有効化')
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`settings:xp-basic:${guildId}`)
                .setLabel('⚙️ 基本設定')
                .setStyle(ButtonStyle.Primary),
        ),
    );

    // Row 2
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:xp-notif:${guildId}`)
                .setLabel('🔔 通知設定')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`settings:xp-rewards:${guildId}`)
                .setLabel('🎁 ロール報酬')
                .setStyle(ButtonStyle.Primary),
        ),
    );

    // Row 3
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:xp-users:${guildId}`)
                .setLabel('👤 ユーザー管理')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`settings:back:${guildId}`)
                .setLabel('◀ 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
