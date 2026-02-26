import {
    ActionRowBuilder,
    AttachmentBuilder,
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
import type {FxTweet} from '../../../embedfix/types.js';

export interface TweetViewResult {
    container: ContainerBuilder;
    files: AttachmentBuilder[];
}

export function buildTweetView(tweet: FxTweet, videoBuffer?: Buffer | null): TweetViewResult {
    const files: AttachmentBuilder[] = [];

    const container = createContainer(SeleneTheme.colors.twitter)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.embedfix))
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    createText(`**${tweet.author.name}** @${tweet.author.screen_name}`),
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(tweet.author.avatar_url),
                ),
        )
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(tweet.text));

    const hasVideo = tweet.media?.videos && tweet.media.videos.length > 0;

    if (hasVideo && videoBuffer) {
        // Embed video inline via MediaGallery + attachment
        const filename = 'video.mp4';
        files.push(new AttachmentBuilder(videoBuffer, {name: filename}));
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(`attachment://${filename}`),
            ),
        );
    } else {
        // Photos or video thumbnail fallback
        const mediaItems = tweet.media?.all;
        if (mediaItems && mediaItems.length > 0) {
            const gallery = new MediaGalleryBuilder();
            for (const item of mediaItems) {
                const url = item.type === 'video' ? (item.thumbnail_url ?? item.url) : item.url;
                gallery.addItems(new MediaGalleryItemBuilder().setURL(url));
            }
            container.addMediaGalleryComponents(gallery);
        }
    }

    // Stats line
    container
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `♡ ${formatCompactNumber(tweet.likes)}  🔁 ${formatCompactNumber(tweet.retweets)}  👁 ${formatCompactNumber(tweet.views)}`,
            ),
        );

    // Action row: link button
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('🔗 元ツイート')
                .setURL(tweet.url),
        ),
    );

    return {container, files};
}
