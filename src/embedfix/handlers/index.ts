import type {PlatformHandler} from '../handler-types.js';
import {twitterHandler} from './twitter-handler.js';
import {instagramHandler} from './instagram-handler.js';
import {tiktokHandler} from './tiktok-handler.js';
import {blueskyHandler} from './bluesky-handler.js';
import {redditHandler} from './reddit-handler.js';

export const platformHandlers: PlatformHandler[] = [
    twitterHandler,
    instagramHandler,
    tiktokHandler,
    blueskyHandler,
    redditHandler,
];
