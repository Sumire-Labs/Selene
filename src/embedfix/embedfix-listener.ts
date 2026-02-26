import {type Message, MessageFlags} from 'discord.js';
import {downloadVideo, fetchTweet} from './embedfix-service.js';
import {buildTweetView} from '../ui/builders/embedfix/tweet.builder.js';

const TWITTER_URL_RE = /https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/(\w+)\/status\/(\d+)\S*/gi;

export async function handleEmbedFixMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guildId) return;

    const content = message.content;
    if (!content) return;

    // Reset lastIndex since the regex is global
    TWITTER_URL_RE.lastIndex = 0;
    const match = TWITTER_URL_RE.exec(content);
    if (!match) return;

    const [, screenName, statusId] = match;

    const tweet = await fetchTweet(screenName, statusId);
    if (!tweet) return;

    // Download video if present
    const videoUrl = tweet.media?.videos?.[0]?.url;
    const videoBuffer = videoUrl ? await downloadVideo(videoUrl) : null;

    // Suppress original embeds (best-effort — requires MANAGE_MESSAGES)
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
}
