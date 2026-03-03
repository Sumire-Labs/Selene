import {ActionRowBuilder, type ContainerBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {SETTINGS_CATEGORIES} from '../../../settings/types.js';

export function buildSettingsDashboard(guildId: string): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.purple)
        .addTextDisplayComponents(createHeader(`⚙️ ${SeleneTheme.prefixes.settings}`))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                'サーバーの各機能を設定します。\n下のメニューから設定したい機能を選んでください。',
            ),
        )
        .addSeparatorComponents(createDivider());

    const select = new StringSelectMenuBuilder()
        .setCustomId(`settings:cat:${guildId}`)
        .setPlaceholder('設定カテゴリを選択...')
        .addOptions(
            SETTINGS_CATEGORIES.map(cat =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(cat.label)
                    .setValue(cat.id)
                    .setEmoji(cat.emoji),
            ),
        );

    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select),
    );

    return container;
}
