import {ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';

export function buildIdlePlayerView(): ContainerBuilder {
    return createContainer(SeleneTheme.colors.grey)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.idle))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText('再生中の曲はありません。`/play` で曲を追加してください。'),
        )
        .addTextDisplayComponents(
            createText('*60秒間操作がない場合、自動切断します...*'),
        );
}
