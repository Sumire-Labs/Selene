import type {Message} from 'discord.js';
import {getCachedEmbedFixConfig} from '../settings/embedfix-cache.js';
import {platformHandlers} from './handlers/index.js';
import {logger} from '../utils/logger.js';

export async function handleEmbedFixMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guildId) return;

    const efConfig = await getCachedEmbedFixConfig(message.guildId);
    if (efConfig && !efConfig.enabled) return;

    const content = message.content;
    if (!content) return;

    for (const handler of platformHandlers) {
        const match = handler.match(content);
        if (!match) continue;

        try {
            await handler.handle(message, match);
        } catch (err) {
            logger.error(`embedfix handler [${handler.name}] failed`, err);
        }
        return;
    }
}
