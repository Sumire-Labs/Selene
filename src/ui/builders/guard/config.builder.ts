import type {GuardConfig} from '@prisma/client';
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
import {CRITERIA_LABELS, INACTIVITY_OPTIONS} from '../../../guard/types.js';

export function buildGuardConfig(guildId: string, config: GuardConfig): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.grey)
        .addTextDisplayComponents(createHeader(`\u2699\uFE0F ${SeleneTheme.prefixes.guard} - 設定`))
        .addSeparatorComponents(createDivider());

    // Inactivity days select
    container.addTextDisplayComponents(createText('**非アクティブ期間**'));
    const daysSelect = new StringSelectMenuBuilder()
        .setCustomId(`guard:cfg-days:${guildId}`)
        .setPlaceholder(`現在: ${config.inactivityDays}日`)
        .addOptions(
            INACTIVITY_OPTIONS.map(opt =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(opt.label)
                    .setValue(String(opt.value))
                    .setDefault(config.inactivityDays === opt.value),
            ),
        );
    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(daysSelect),
    );

    // Tracking criteria select (multi)
    container.addTextDisplayComponents(createText('**トラッキング対象**'));
    const defaults: string[] = [];
    if (config.trackMessages) defaults.push('messages');
    if (config.trackReactions) defaults.push('reactions');
    if (config.trackVoice) defaults.push('voice');

    const trackSelect = new StringSelectMenuBuilder()
        .setCustomId(`guard:cfg-track:${guildId}`)
        .setPlaceholder('トラッキング対象を選択...')
        .setMinValues(1)
        .setMaxValues(3)
        .addOptions(
            Object.entries(CRITERIA_LABELS).map(([key, label]) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(label)
                    .setValue(key)
                    .setDefault(defaults.includes(key)),
            ),
        );
    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(trackSelect),
    );

    // Log channel select
    container.addTextDisplayComponents(
        createText(`**ログチャンネル:** ${config.logChannelId ? `<#${config.logChannelId}>` : '未設定'}`),
    );
    const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId(`guard:cfg-log:${guildId}`)
        .setPlaceholder('ログチャンネルを選択...')
        .setChannelTypes(ChannelType.GuildText);
    container.addActionRowComponents(
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelect),
    );

    // Back button
    container.addSeparatorComponents(createDivider());
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`guard:back:${guildId}`)
                .setLabel('\u25C0 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
