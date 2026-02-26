import type {Client, Message, TextChannel} from 'discord.js';
import {MessageFlags} from 'discord.js';
import type {KazagumoPlayer, KazagumoTrack} from 'kazagumo';
import type {LoopMode, PlayerDisplayState, PlayerViewMode, TrackInfo} from './types.js';
import {buildCompactPlayerView} from '../ui/builders/player/compact.builder.js';
import {buildFullPlayerView} from '../ui/builders/player/full.builder.js';
import {buildIdlePlayerView} from '../ui/builders/player/idle.builder.js';
import {VOLUME_MAX, VOLUME_MIN, VOLUME_STEP} from '../config/constants.js';
import {config} from '../config/index.js';
import {logger} from '../utils/logger.js';

export class GuildPlayer {
    readonly guildId: string;
    readonly player: KazagumoPlayer;
    private readonly client: Client;

    viewMode: PlayerViewMode = 'compact';
    playerMessageId: string | null = null;
    textChannelId: string | null = null;

    private isUpdating = false;
    private updateInterval: ReturnType<typeof setInterval> | null = null;
    private idleTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(guildId: string, player: KazagumoPlayer, client: Client) {
        this.guildId = guildId;
        this.player = player;
        this.client = client;
    }

    get isPaused(): boolean {
        return this.player.paused;
    }

    get loopMode(): LoopMode {
        return this.player.loop;
    }

    get volume(): number {
        return this.player.volume;
    }

    get position(): number {
        return this.player.position;
    }

    get currentTrack(): KazagumoTrack | null {
        return this.player.queue.current ?? null;
    }

    togglePause(): void {
        this.player.pause(!this.player.paused);
    }

    skip(): void {
        this.player.skip();
    }

    async stop(): Promise<void> {
        this.player.queue.clear();
        this.player.skip();
        this.stopUpdateLoop();
    }

    cycleLoopMode(): void {
        const cycle: LoopMode[] = ['none', 'track', 'queue'];
        const idx = cycle.indexOf(this.player.loop);
        const next = cycle[(idx + 1) % cycle.length];
        this.player.setLoop(next);
    }

    shuffleQueue(): void {
        const queue = this.player.queue;
        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }
    }

    async adjustVolume(direction: 'up' | 'down'): Promise<void> {
        const current = this.player.volume;
        const next = direction === 'up'
            ? Math.min(current + VOLUME_STEP, VOLUME_MAX)
            : Math.max(current - VOLUME_STEP, VOLUME_MIN);
        await this.player.setVolume(next);
    }

    toggleViewMode(): void {
        this.viewMode = this.viewMode === 'compact' ? 'full' : 'compact';
    }

    getDisplayState(): PlayerDisplayState | null {
        const current = this.currentTrack;
        if (!current) return null;

        return {
            track: toTrackInfo(current),
            position: this.position,
            isPaused: this.isPaused,
            loopMode: this.loopMode,
            volume: this.volume,
            queue: [...this.player.queue].map(toTrackInfo),
            guildId: this.guildId,
        };
    }

    // --- Message Anchor ---

    async sendOrUpdatePlayerMessage(channelId?: string): Promise<void> {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            const targetChannelId = channelId ?? this.textChannelId;
            if (!targetChannelId) return;

            this.textChannelId = targetChannelId;

            const channel = await this.client.channels.fetch(targetChannelId) as TextChannel | null;
            if (!channel?.isTextBased()) return;

            const state = this.getDisplayState();
            const container = state
                ? (this.viewMode === 'compact'
                    ? buildCompactPlayerView(state)
                    : buildFullPlayerView(state))
                : buildIdlePlayerView(this.guildId);

            if (this.playerMessageId) {
                try {
                    const msg = await channel.messages.fetch(this.playerMessageId);
                    await msg.edit({
                        components: [container],
                        flags: MessageFlags.IsComponentsV2,
                    });
                    return;
                } catch {
                    // Message was deleted or fetch failed — fall through to send new one
                }
            }

            // Send new message
            const sent: Message = await channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });
            this.playerMessageId = sent.id;
        } catch (error) {
            logger.error('Failed to send/update player message', error, {
                guildId: this.guildId,
            });
        } finally {
            this.isUpdating = false;
        }
    }

    // --- Update Loop ---

    startUpdateLoop(): void {
        this.stopUpdateLoop();
        this.updateInterval = setInterval(async () => {
            if (this.isPaused) return;
            await this.sendOrUpdatePlayerMessage();
        }, config.music.playerUpdateIntervalMs);
    }

    stopUpdateLoop(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // --- Idle Timeout ---

    startIdleTimeout(onIdle: () => void): void {
        this.clearIdleTimeout();
        this.idleTimeout = setTimeout(onIdle, config.music.idleTimeoutMs);
    }

    clearIdleTimeout(): void {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = null;
        }
    }

    async cleanup(): Promise<void> {
        this.stopUpdateLoop();
        this.clearIdleTimeout();

        // Delete player message
        if (this.playerMessageId && this.textChannelId) {
            try {
                const channel = await this.client.channels.fetch(this.textChannelId) as TextChannel | null;
                if (channel?.isTextBased()) {
                    const msg = await channel.messages.fetch(this.playerMessageId);
                    await msg.delete();
                }
            } catch {
                // Ignore
            }
        }

        this.playerMessageId = null;
    }
}

function toTrackInfo(track: KazagumoTrack): TrackInfo {
    return {
        title: track.title,
        author: track.author,
        length: track.length,
        uri: track.uri,
        thumbnail: track.thumbnail,
        isStream: track.isStream,
        requester: (track.requester as { userId?: string } | undefined)?.userId,
    };
}
