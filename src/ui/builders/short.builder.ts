import {ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from './base.builder.js';

export function buildShortUrlView(shortUrl: string): ContainerBuilder {
    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.short))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(shortUrl));
}
