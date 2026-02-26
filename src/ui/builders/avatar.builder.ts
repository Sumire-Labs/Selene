import {ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder} from 'discord.js';
import {SeleneTheme} from '../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from './base.builder.js';

export function buildAvatarView(username: string, avatarUrl: string): ContainerBuilder {
    return createContainer(SeleneTheme.colors.purple)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.avatar))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(`**${username}**`))
        .addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(avatarUrl),
            ),
        );
}
