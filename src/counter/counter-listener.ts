import type {Message} from 'discord.js';
import {getEntries} from './counter-cache.js';
import {logHit} from './counter-service.js';
import {logger} from '../utils/logger.js';

export async function handleCounterMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guildId) return;

    const content = message.content;
    if (!content) return;

    const entries = await getEntries(message.guildId);
    if (entries.length === 0) return;

    for (const entry of entries) {
        if (entry.regex.test(content)) {
            // Fire-and-forget DB write
            logHit(entry.id, message.author.id).catch(err => {
                logger.error('Failed to log counter hit', err, {
                    counterId: entry.id,
                });
            });
        }
    }
}
