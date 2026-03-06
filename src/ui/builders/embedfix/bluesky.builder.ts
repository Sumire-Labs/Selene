import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {formatCompactNumber} from '../../../utils/formatters.js';
import type {BskyPost} from '../../../embedfix/bluesky-types.js';

export function buildBlueskyView(post: BskyPost, originalUrl: string): ContainerBuilder {
    const displayName = post.author.displayName ?? post.author.handle;

    const container = createContainer(SeleneTheme.colors.bluesky)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.bluesky));

    const section = new SectionBuilder()
        .addTextDisplayComponents(
            createText(`**${displayName}** @${post.author.handle}`),
        );

    if (post.author.avatar) {
        section.setThumbnailAccessory(
            new ThumbnailBuilder().setURL(post.author.avatar),
        );
    }

    container
        .addSectionComponents(section)
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(post.record.text));

    // Image gallery
    const images = post.embed?.images;
    if (images && images.length > 0) {
        const gallery = new MediaGalleryBuilder();
        for (const img of images) {
            gallery.addItems(new MediaGalleryItemBuilder().setURL(img.fullsize));
        }
        container.addMediaGalleryComponents(gallery);
    }

    // Stats line
    container
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `♡ ${formatCompactNumber(post.likeCount)}  ↻ ${formatCompactNumber(post.repostCount)}  ○ ${formatCompactNumber(post.replyCount)}`,
            ),
        );

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
