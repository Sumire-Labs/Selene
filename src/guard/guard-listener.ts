import type {Message, MessageReaction, PartialMessageReaction, PartialUser, User, VoiceState} from 'discord.js';
import {getCachedGuardConfig} from './guard-cache.js';
import {updateMemberActivity} from './guard-service.js';
import {GUARD_ACTIVITY_THROTTLE_MS} from '../config/constants.js';

const throttle = new Map<string, number>();

function shouldUpdate(key: string): boolean {
    const last = throttle.get(key);
    if (last && Date.now() - last < GUARD_ACTIVITY_THROTTLE_MS) return false;
    throttle.set(key, Date.now());
    return true;
}

export async function handleGuardMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guildId) return;

    const config = await getCachedGuardConfig(message.guildId);
    if (!config?.enabled || !config.trackMessages) return;

    const key = `${message.guildId}:${message.author.id}:messages`;
    if (!shouldUpdate(key)) return;

    await updateMemberActivity(message.guildId, message.author.id, 'lastMessageAt');
}

export async function handleGuardReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
): Promise<void> {
    if (user.bot) return;
    const guildId = reaction.message.guildId;
    if (!guildId) return;

    const config = await getCachedGuardConfig(guildId);
    if (!config?.enabled || !config.trackReactions) return;

    const key = `${guildId}:${user.id}:reactions`;
    if (!shouldUpdate(key)) return;

    await updateMemberActivity(guildId, user.id, 'lastReactionAt');
}

export async function handleGuardVoiceState(_oldState: VoiceState, newState: VoiceState): Promise<void> {
    // Only track when a user joins a voice channel (not leave)
    if (!newState.channelId) return;
    const member = newState.member;
    if (!member || member.user.bot) return;
    const guildId = newState.guild.id;

    const config = await getCachedGuardConfig(guildId);
    if (!config?.enabled || !config.trackVoice) return;

    const key = `${guildId}:${member.id}:voice`;
    if (!shouldUpdate(key)) return;

    await updateMemberActivity(guildId, member.id, 'lastVoiceAt');
}
