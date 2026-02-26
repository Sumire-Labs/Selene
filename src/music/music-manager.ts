import type {Client} from 'discord.js';
import type {KazagumoPlayer} from 'kazagumo';
import {GuildPlayer} from './guild-player.js';
import {logger} from '../utils/logger.js';

class MusicManager {
    private readonly players = new Map<string, GuildPlayer>();

    get(guildId: string): GuildPlayer | undefined {
        return this.players.get(guildId);
    }

    create(guildId: string, kazagumoPlayer: KazagumoPlayer, client: Client): GuildPlayer {
        const existing = this.players.get(guildId);
        if (existing) return existing;

        const guildPlayer = new GuildPlayer(guildId, kazagumoPlayer, client);
        this.players.set(guildId, guildPlayer);
        logger.info('GuildPlayer created', {guildId});
        return guildPlayer;
    }

    async destroy(guildId: string): Promise<void> {
        const guildPlayer = this.players.get(guildId);
        if (!guildPlayer) return;

        await guildPlayer.cleanup();
        this.players.delete(guildId);
        logger.info('GuildPlayer destroyed', {guildId});
    }

    getAll(): IterableIterator<GuildPlayer> {
        return this.players.values();
    }
}

export const musicManager = new MusicManager();
