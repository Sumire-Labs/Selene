import {startCooldownCleanup} from '../utils/cooldown.js';
import {logger} from '../utils/logger.js';

export function startScheduler(): void {
    startCooldownCleanup();
    logger.info('Scheduler started (cooldown cleanup)');
}
