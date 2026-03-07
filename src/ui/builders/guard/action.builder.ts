import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ContainerBuilder,
    UserSelectMenuBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';

export function buildGuardAction(guildId: string): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader(`\u{1F464} ${SeleneTheme.prefixes.guard} - アクション`))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText('対象ユーザーを選択してください。'),
        );

    const userSelect = new UserSelectMenuBuilder()
        .setCustomId(`guard:act-user:${guildId}`)
        .setPlaceholder('ユーザーを選択...');

    container.addActionRowComponents(
        new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect),
    );

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

export function buildGuardActionTarget(guildId: string, userId: string, username: string): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader(`\u{1F464} ${SeleneTheme.prefixes.guard} - アクション`))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(`**対象:** <@${userId}> (${username})`),
        );

    container.addSeparatorComponents(createDivider());
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`guard:act-kick:${guildId}:${userId}`)
                .setLabel('\u{1F462} Kick')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`guard:act-ban:${guildId}:${userId}`)
                .setLabel('\u{1F528} BAN')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`guard:action:${guildId}`)
                .setLabel('\u25C0 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
