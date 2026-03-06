import {type Message, MessageFlags} from 'discord.js';
import type {PlatformHandler, UrlMatch} from '../handler-types.js';
import type {TikWmResponse} from '../tiktok-types.js';
import {downloadVideo} from '../embedfix-service.js';
import {buildTikTokView} from '../../ui/builders/embedfix/tiktok.builder.js';
import {logger} from '../../utils/logger.js';

const TIKTOK_URL_RE = /https?:\/\/(?:(?:www|vm)\.)?tiktok\.com\/(?:@[\w.]+\/video\/(\d+)|([A-Za-z0-9]+))\S*/i;

async function fetchTikTokData(url: string): Promise<TikWmResponse | null> {
    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
            logger.warn('TikWm API returned non-OK status', {status: res.status, url});
            return null;
        }
        return (await res.json()) as TikWmResponse;
    } catch (err) {
        logger.error('Failed to fetch TikTok data', err, {url});
        return null;
    }
}

export const tiktokHandler: PlatformHandler = {
    name: 'tiktok',

    match(content: string): UrlMatch | null {
        const m = TIKTOK_URL_RE.exec(content);
        if (!m) return null;
        return {
            originalUrl: m[0],
            groups: {videoId: m[1] ?? m[2]},
        };
    },

    async handle(message: Message, match: UrlMatch): Promise<void> {
        const response = await fetchTikTokData(match.originalUrl);
        if (!response?.data) return;

        const videoBuffer = response.data.play ? await downloadVideo(response.data.play) : null;

        try {
            await message.suppressEmbeds(true);
        } catch {
            // Permission missing
        }

        const {container, files} = buildTikTokView(response.data, match.originalUrl, videoBuffer);

        await message.reply({
            components: [container],
            files,
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
