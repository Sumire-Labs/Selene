import {ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder} from 'discord.js';

export function createContainer(accentColor: number): ContainerBuilder {
    return new ContainerBuilder().setAccentColor(accentColor);
}

export function createHeader(text: string): TextDisplayBuilder {
    return new TextDisplayBuilder().setContent(text);
}

export function createText(text: string): TextDisplayBuilder {
    return new TextDisplayBuilder().setContent(text);
}

export function createDivider(
    spacing: SeparatorSpacingSize = SeparatorSpacingSize.Small,
): SeparatorBuilder {
    return new SeparatorBuilder().setDivider(true).setSpacing(spacing);
}
