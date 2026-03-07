import type {VoiceState} from 'discord.js';

export interface VoiceSession {
    channelId: string;
    joinedAt: number;
    lastTick: number;
}

// guildId → (userId → VoiceSession)
const activeSessions = new Map<string, Map<string, VoiceSession>>();

export function getGuildSessions(guildId: string): Map<string, VoiceSession> {
    let sessions = activeSessions.get(guildId);
    if (!sessions) {
        sessions = new Map();
        activeSessions.set(guildId, sessions);
    }
    return sessions;
}

export function getActiveSessions(): Map<string, Map<string, VoiceSession>> {
    return activeSessions;
}

export function handleVoiceStateForXp(oldState: VoiceState, newState: VoiceState): void {
    const guildId = newState.guild.id;
    const userId = newState.id;

    // Ignore bots
    if (newState.member?.user.bot) return;

    const sessions = getGuildSessions(guildId);

    const oldChannelId = oldState.channelId;
    const newChannelId = newState.channelId;

    // Left voice entirely
    if (oldChannelId && !newChannelId) {
        sessions.delete(userId);
        return;
    }

    // Joined or switched channel
    if (newChannelId) {
        // Skip AFK channel
        const afkChannelId = newState.guild.afkChannelId;
        if (newChannelId === afkChannelId) {
            sessions.delete(userId);
            return;
        }

        if (!sessions.has(userId)) {
            sessions.set(userId, {
                channelId: newChannelId,
                joinedAt: Date.now(),
                lastTick: Date.now(),
            });
        } else {
            const session = sessions.get(userId)!;
            session.channelId = newChannelId;
        }
    }
}
