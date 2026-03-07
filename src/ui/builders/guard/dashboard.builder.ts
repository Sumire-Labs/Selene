import type {GuardConfig} from '@prisma/client';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, type ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {CRITERIA_SHORT} from '../../../guard/types.js';

export function buildGuardDashboard(guildId: string, config: GuardConfig): ContainerBuilder {
    const accentColor = config.enabled ? SeleneTheme.colors.red : SeleneTheme.colors.grey;

    const container = createContainer(accentColor)
        .addTextDisplayComponents(createHeader(`\u{1F6E1}\uFE0F ${SeleneTheme.prefixes.guard}`))
        .addSeparatorComponents(createDivider());

    const statusIcon = config.enabled ? '\u2705' : '\u274C';
    const statusText = config.enabled ? '有効' : '無効';

    const tracking: string[] = [];
    if (config.trackMessages) tracking.push(CRITERIA_SHORT.messages);
    if (config.trackReactions) tracking.push(CRITERIA_SHORT.reactions);
    if (config.trackVoice) tracking.push(CRITERIA_SHORT.voice);
    const trackingText = tracking.length > 0 ? tracking.join(' / ') : 'なし';

    const logText = config.logChannelId ? `<#${config.logChannelId}>` : '未設定';

    container.addTextDisplayComponents(
        createText(
            `**ステータス:** ${statusIcon} ${statusText}\n` +
            `**非アクティブ期間:** ${config.inactivityDays}日\n` +
            `**トラッキング:** ${trackingText}\n` +
            `**ログチャンネル:** ${logText}`,
        ),
    );
    container.addSeparatorComponents(createDivider());

    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`guard:toggle:${guildId}`)
                .setLabel(config.enabled ? '\u274C 無効化' : '\u2705 有効化')
                .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`guard:config:${guildId}`)
                .setLabel('\u2699 設定')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`guard:action:${guildId}`)
                .setLabel('\u{1F464} アクション')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`guard:scan:${guildId}`)
                .setLabel('\u{1F50D} スキャン')
                .setStyle(ButtonStyle.Primary),
        ),
    );

    return container;
}
