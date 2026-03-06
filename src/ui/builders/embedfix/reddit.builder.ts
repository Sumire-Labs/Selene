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
import {formatCompactNumber, truncateText} from '../../../utils/formatters.js';
import type {RedditPostData} from '../../../embedfix/reddit-types.js';

export function buildRedditView(post: RedditPostData): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.reddit)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.reddit))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(`r/${post.subreddit}`))
        .addTextDisplayComponents(createText(`**${post.title}**`));

    if (post.selftext) {
        container.addTextDisplayComponents(createText(truncateText(post.selftext, 500)));
    }

    // Post image (not video)
    const imageUrl = post.preview?.images?.[0]?.source?.url;
    if (imageUrl && !post.is_video) {
        // Reddit HTML-encodes URLs in preview
        const decodedUrl = imageUrl.replace(/&amp;/g, '&');
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(decodedUrl),
            ),
        );
    }

    // Stats line
    const ratio = Math.round(post.upvote_ratio * 100);
    container
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `⬆ ${formatCompactNumber(post.score)} (${ratio}%)  💬 ${formatCompactNumber(post.num_comments)}`,
            ),
        );

    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('🔗 元の投稿')
                .setURL(`https://www.reddit.com${post.permalink}`),
        ),
    );

    return container;
}
