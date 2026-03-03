import {ActionRowBuilder, ButtonBuilder, ButtonStyle, type ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {SETTINGS_CATEGORIES} from '../../../settings/types.js';

export function buildSettingsDashboard(guildId: string): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.purple)
        .addTextDisplayComponents(createHeader(`⚙️ ${SeleneTheme.prefixes.settings}`))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                'サーバーの各機能を設定します。\n下のボタンから設定したい機能を選んでください。',
            ),
        )
        .addSeparatorComponents(createDivider());

    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const cat of SETTINGS_CATEGORIES) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:cat:${guildId}:${cat.id}`)
                .setLabel(`${cat.emoji} ${cat.label}`)
                .setStyle(ButtonStyle.Secondary),
        );
    }
    container.addActionRowComponents(row);

    return container;
}
