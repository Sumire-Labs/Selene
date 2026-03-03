import type {Client} from 'discord.js';
import {startCooldownCleanup} from '../utils/cooldown.js';
import {startTicketAutoClose} from '../ticket/ticket-auto-close.js';
import {logger} from '../utils/logger.js';

export function startScheduler(client: Client): void {
    startCooldownCleanup();
    startTicketAutoClose(client);
    logger.info('Scheduler started (cooldown cleanup, ticket auto-close)');
}
