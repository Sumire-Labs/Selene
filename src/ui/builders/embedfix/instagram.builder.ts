import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {truncateText} from '../../../utils/formatters.js';
import type {InstagramOEmbedResponse} from '../../../embedfix/instagram-types.js';

export function buildInstagramView(data: InstagramOEmbedResponse, originalUrl: string): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.instagram)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.instagram))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(`**${data.author_name}**`));

    if (data.title) {
        container.addTextDisplayComponents(createText(truncateText(data.title, 300)));
    }

    if (data.thumbnail_url) {
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(data.thumbnail_url),
            ),
        );
    }

    container.addSeparatorComponents(createDivider());

    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('🔗 元の投稿')
                .setURL(originalUrl),
        ),
    );

    return container;
}
