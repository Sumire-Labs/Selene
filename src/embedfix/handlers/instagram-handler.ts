import {type Message, MessageFlags} from 'discord.js';
import type {PlatformHandler, UrlMatch} from '../handler-types.js';
import type {InstagramOEmbedResponse} from '../instagram-types.js';
import {buildInstagramView} from '../../ui/builders/embedfix/instagram.builder.js';
import {logger} from '../../utils/logger.js';

const INSTAGRAM_URL_RE = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)\S*/i;

async function fetchInstagramOEmbed(url: string): Promise<InstagramOEmbedResponse | null> {
    const apiUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
            logger.warn('Instagram oEmbed API returned non-OK status', {status: res.status, url});
            return null;
        }
        return (await res.json()) as InstagramOEmbedResponse;
    } catch (err) {
        logger.error('Failed to fetch Instagram oEmbed', err, {url});
        return null;
    }
}

export const instagramHandler: PlatformHandler = {
    name: 'instagram',

    match(content: string): UrlMatch | null {
        const m = INSTAGRAM_URL_RE.exec(content);
        if (!m) return null;
        return {
            originalUrl: m[0],
            groups: {shortcode: m[1]},
        };
    },

    async handle(message: Message, match: UrlMatch): Promise<void> {
        const data = await fetchInstagramOEmbed(match.originalUrl);
        if (!data) return;

        try {
            await message.suppressEmbeds(true);
        } catch {
            // Permission missing
        }

        const container = buildInstagramView(data, match.originalUrl);

        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
