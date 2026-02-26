import type {Kazagumo} from 'kazagumo';
import {musicManager} from './music-manager.js';
import {logger} from '../utils/logger.js';

export function wirePlayerEvents(kazagumo: Kazagumo): void {
    kazagumo.on('playerStart', (player, track) => {
        logger.info('Track started', {guildId: player.guildId, title: track.title});

        const guildPlayer = musicManager.get(player.guildId);
        if (!guildPlayer) return;

        guildPlayer.clearIdleTimeout();
        guildPlayer.startUpdateLoop();
        void guildPlayer.sendOrUpdatePlayerMessage();
    });

    kazagumo.on('playerEnd', (player) => {
        logger.info('Track ended', {guildId: player.guildId});

        const guildPlayer = musicManager.get(player.guildId);
        if (!guildPlayer) return;

        // If queue is empty and not looping, the playerEmpty event will fire
    });

    kazagumo.on('playerEmpty', (player) => {
        logger.info('Queue empty', {guildId: player.guildId});

        const guildPlayer = musicManager.get(player.guildId);
        if (!guildPlayer) return;

        guildPlayer.stopUpdateLoop();
        void guildPlayer.sendOrUpdatePlayerMessage();

        guildPlayer.startIdleTimeout(async () => {
            logger.info('Idle timeout reached, destroying player', {guildId: player.guildId});
            await player.destroy();
            await musicManager.destroy(player.guildId);
        });
    });

    kazagumo.on('playerClosed', (player, data) => {
        logger.warn('Player WebSocket closed', {
            guildId: player.guildId,
            code: data.code,
            reason: data.reason,
        });
    });

    kazagumo.on('playerException', (player, data) => {
        logger.error('Player exception', {
            guildId: player.guildId,
            message: data.exception?.message,
        });
    });

    kazagumo.on('playerDestroy', (player) => {
        logger.info('Player destroyed', {guildId: player.guildId});
        void musicManager.destroy(player.guildId);
    });
}
