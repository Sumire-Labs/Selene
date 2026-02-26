import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';

export function buildIdlePlayerView(guildId: string): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.grey)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.idle))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText('再生中の曲はありません。下のボタンから曲を追加してください。'),
        )
        .addTextDisplayComponents(
            createText('*60秒間操作がない場合、自動切断します...*'),
        );

    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`player:add:${guildId}`)
                .setLabel('曲を追加')
                .setEmoji('➕')
                .setStyle(ButtonStyle.Success),
        ),
    );

    return container;
}
