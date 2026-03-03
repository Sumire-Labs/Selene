import type {TicketConfig} from '@prisma/client';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ContainerBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';

const MAX_TICKET_OPTIONS = [
    {label: '1', value: '1'},
    {label: '2', value: '2'},
    {label: '3', value: '3'},
    {label: '5', value: '5'},
    {label: '無制限', value: '0'},
];

const AUTO_CLOSE_OPTIONS = [
    {label: '無効', value: '0'},
    {label: '12時間', value: '12'},
    {label: '24時間', value: '24'},
    {label: '48時間', value: '48'},
    {label: '72時間', value: '72'},
    {label: '1週間', value: '168'},
];

export function buildTicketAdvancedView(guildId: string, config: TicketConfig): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('⚙️ チケット詳細設定'))
        .addSeparatorComponents(createDivider());

    // Max tickets per user
    container.addTextDisplayComponents(createText('**ユーザーあたりの最大チケット数:**'));
    const currentMax = String(config.maxTicketsPerUser);
    const maxSelect = new StringSelectMenuBuilder()
        .setCustomId(`settings:ticket-max:${guildId}`)
        .addOptions(
            MAX_TICKET_OPTIONS.map(opt =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(opt.label)
                    .setValue(opt.value)
                    .setDefault(opt.value === currentMax),
            ),
        );
    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(maxSelect),
    );

    container.addSeparatorComponents(createDivider());

    // Auto close
    container.addTextDisplayComponents(createText('**自動クローズ:**'));
    const currentAutoClose = String(config.autoCloseHours ?? 0);
    const autoCloseSelect = new StringSelectMenuBuilder()
        .setCustomId(`settings:ticket-aclose:${guildId}`)
        .addOptions(
            AUTO_CLOSE_OPTIONS.map(opt =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(opt.label)
                    .setValue(opt.value)
                    .setDefault(opt.value === currentAutoClose),
            ),
        );
    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(autoCloseSelect),
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
