import {type Message, MessageFlags} from 'discord.js';
import type {PlatformHandler, UrlMatch} from '../handler-types.js';
import type {BskyPostThreadResponse, BskyResolveHandleResponse} from '../bluesky-types.js';
import {buildBlueskyView} from '../../ui/builders/embedfix/bluesky.builder.js';
import {logger} from '../../utils/logger.js';

const BLUESKY_URL_RE = /https?:\/\/bsky\.app\/profile\/([\w.-]+)\/post\/([a-z0-9]+)\S*/i;

async function resolveHandle(handle: string): Promise<string | null> {
    const url = `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = (await res.json()) as BskyResolveHandleResponse;
        return data.did;
    } catch (err) {
        logger.error('Failed to resolve Bluesky handle', err, {handle});
        return null;
    }
}

async function fetchPost(did: string, rkey: string) {
    const uri = `at://${did}/app.bsky.feed.post/${rkey}`;
    const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}&depth=0`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            logger.warn('Bluesky getPostThread returned non-OK status', {status: res.status, uri});
            return null;
        }
        const data = (await res.json()) as BskyPostThreadResponse;
        return data.thread.post;
    } catch (err) {
        logger.error('Failed to fetch Bluesky post', err, {did, rkey});
        return null;
    }
}

export const blueskyHandler: PlatformHandler = {
    name: 'bluesky',

    match(content: string): UrlMatch | null {
        const m = BLUESKY_URL_RE.exec(content);
        if (!m) return null;
        return {
            originalUrl: m[0],
            groups: {handle: m[1], rkey: m[2]},
        };
    },

    async handle(message: Message, match: UrlMatch): Promise<void> {
        const {handle, rkey} = match.groups;

        const did = await resolveHandle(handle);
        if (!did) return;

        const post = await fetchPost(did, rkey);
        if (!post) return;

        try {
            await message.suppressEmbeds(true);
        } catch {
            // Permission missing
        }

        const container = buildBlueskyView(post, match.originalUrl);

        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
