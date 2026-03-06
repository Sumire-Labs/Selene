import {type Message, MessageFlags} from 'discord.js';
import type {PlatformHandler, UrlMatch} from '../handler-types.js';
import type {FxTweetResponse} from '../twitter-types.js';
import {downloadVideo} from '../embedfix-service.js';
import {buildTweetView} from '../../ui/builders/embedfix/tweet.builder.js';
import {logger} from '../../utils/logger.js';

const TWITTER_URL_RE = /https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/(\w+)\/status\/(\d+)\S*/i;

async function fetchTweet(screenName: string, statusId: string) {
    const url = `https://api.fxtwitter.com/${screenName}/status/${statusId}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            logger.warn('fxtwitter API returned non-OK status', {status: res.status, screenName, statusId});
            return null;
        }
        const data = (await res.json()) as FxTweetResponse;
        return data.tweet ?? null;
    } catch (err) {
        logger.error('Failed to fetch tweet from fxtwitter', err, {screenName, statusId});
        return null;
    }
}

export const twitterHandler: PlatformHandler = {
    name: 'twitter',

    match(content: string): UrlMatch | null {
        const m = TWITTER_URL_RE.exec(content);
        if (!m) return null;
        return {
            originalUrl: m[0],
            groups: {screenName: m[1], statusId: m[2]},
        };
    },

    async handle(message: Message, match: UrlMatch): Promise<void> {
        const {screenName, statusId} = match.groups;

        const tweet = await fetchTweet(screenName, statusId);
        if (!tweet) return;

        const videoUrl = tweet.media?.videos?.[0]?.url;
        const videoBuffer = videoUrl ? await downloadVideo(videoUrl) : null;

        try {
            await message.suppressEmbeds(true);
        } catch {
            // Permission missing — continue without suppression
        }

        const {container, files} = buildTweetView(tweet, videoBuffer);

        await message.reply({
            components: [container],
            files,
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
