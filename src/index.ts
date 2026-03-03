import {startBot} from './client.js';
import {startScheduler} from './scheduler/index.js';
import {logger} from './utils/logger.js';

async function loadModules(): Promise<void> {
    // General commands
    await import('./commands/general/ping.command.js');
    await import('./commands/general/avatar.command.js');
    await import('./commands/general/short.command.js');

    // Music commands
    await import('./commands/music/play.command.js');

    // Button handlers
    await import('./interactions/buttons/ping.buttons.js');
    await import('./interactions/buttons/player.buttons.js');

    // Modal handlers
    await import('./interactions/modals/player-add.modal.js');
    await import('./interactions/modals/counter-add.modal.js');

    // Counter
    await import('./commands/general/counter.command.js');
    await import('./interactions/buttons/counter.buttons.js');

    // Ticket
    await import('./commands/general/ticket.command.js');
    await import('./interactions/buttons/ticket.buttons.js');
    await import('./interactions/modals/ticket-create.modal.js');

    // Settings
    await import('./commands/general/settings.command.js');
    await import('./interactions/buttons/settings.buttons.js');
    await import('./interactions/selects/settings.selects.js');
}

async function main(): Promise<void> {
    logger.info('Starting Selene...');
    await loadModules();
    await startBot();
    startScheduler();
}

main().catch((error) => {
    logger.error('Fatal error during startup', error);
    process.exit(1);
});
