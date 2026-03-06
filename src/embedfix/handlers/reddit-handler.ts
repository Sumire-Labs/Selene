import {type Message, MessageFlags} from 'discord.js';
import type {PlatformHandler, UrlMatch} from '../handler-types.js';
import type {RedditListingResponse} from '../reddit-types.js';
import {buildRedditView} from '../../ui/builders/embedfix/reddit.builder.js';
import {logger} from '../../utils/logger.js';

const REDDIT_URL_RE = /https?:\/\/(?:(?:www|old|new)\.)?reddit\.com\/r\/(\w+)\/comments\/(\w+)\S*/i;

async function fetchRedditPost(subreddit: string, postId: string) {
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;
    try {
        const res = await fetch(url, {
            headers: {'User-Agent': 'Selene Discord Bot/1.0'},
        });
        if (!res.ok) {
            logger.warn('Reddit API returned non-OK status', {status: res.status, subreddit, postId});
            return null;
        }
        const data = (await res.json()) as RedditListingResponse[];
        return data[0]?.data?.children?.[0]?.data ?? null;
    } catch (err) {
        logger.error('Failed to fetch Reddit post', err, {subreddit, postId});
        return null;
    }
}

export const redditHandler: PlatformHandler = {
    name: 'reddit',

    match(content: string): UrlMatch | null {
        const m = REDDIT_URL_RE.exec(content);
        if (!m) return null;
        return {
            originalUrl: m[0],
            groups: {subreddit: m[1], postId: m[2]},
        };
    },

    async handle(message: Message, match: UrlMatch): Promise<void> {
        const {subreddit, postId} = match.groups;

        const post = await fetchRedditPost(subreddit, postId);
        if (!post) return;

        // Skip NSFW posts
        if (post.over_18) return;

        try {
            await message.suppressEmbeds(true);
        } catch {
            // Permission missing
        }

        const container = buildRedditView(post);

        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
