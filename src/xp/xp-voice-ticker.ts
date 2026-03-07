import type {Client} from 'discord.js';
import {MessageFlags} from 'discord.js';
import {getCachedXpConfig} from './xp-cache.js';
import {addVoiceXp, getRewardsForLevel} from './xp-service.js';
import {buildLevelUpView} from '../ui/builders/xp/levelup.builder.js';
import {XP_VOICE_TICK_INTERVAL_MS} from '../config/constants.js';
import {logger} from '../utils/logger.js';
import {getActiveSessions} from './xp-voice-session.js';

export function startVoiceXpTicker(client: Client): void {
    setInterval(async () => {
        const now = Date.now();
        const activeSessions = getActiveSessions();

        for (const [guildId, sessions] of activeSessions) {
            if (sessions.size === 0) continue;

            const config = await getCachedXpConfig(guildId);
            if (!config?.enabled) continue;

            const amount = Math.floor(config.voiceXpPerMinute * config.multiplier);
            if (amount <= 0) continue;

            for (const [userId, session] of sessions) {
                const elapsed = now - session.lastTick;
                if (elapsed < XP_VOICE_TICK_INTERVAL_MS) continue;

                session.lastTick = now;

                try {
                    const result = await addVoiceXp(guildId, userId, amount, 1);

                    if (result.leveledUp) {
                        await sendVoiceLevelUp(client, guildId, userId, config, result.newLevel);
                        await applyVoiceRoleRewards(client, guildId, userId, result.newLevel);
                    }
                } catch (error) {
                    logger.error('Failed to award voice XP', error, {guildId, userId});
                }
            }
        }
    }, XP_VOICE_TICK_INTERVAL_MS);
}

async function sendVoiceLevelUp(
    client: Client,
    guildId: string,
    userId: string,
    config: {notificationMode: string; notificationChannelId: string | null},
    newLevel: number,
): Promise<void> {
    try {
        // Voice level-ups only send to dedicated channel
        if (config.notificationMode !== 'dedicated' || !config.notificationChannelId) return;

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;

        const channel = await guild.channels.fetch(config.notificationChannelId);
        if (!channel?.isTextBased()) return;

        const view = buildLevelUpView(userId, newLevel);
        await channel.send({components: [view], flags: MessageFlags.IsComponentsV2});
    } catch (error) {
        logger.error('Failed to send voice level-up notification', error, {guildId, userId});
    }
}

async function applyVoiceRoleRewards(
    client: Client,
    guildId: string,
    userId: string,
    newLevel: number,
): Promise<void> {
    try {
        const rewards = await getRewardsForLevel(guildId, newLevel);
        if (rewards.length === 0) return;

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;

        const member = await guild.members.fetch(userId);

        for (const reward of rewards) {
            if (!member.roles.cache.has(reward.roleId)) {
                await member.roles.add(reward.roleId).catch(err => {
                    logger.warn('Failed to add voice role reward', {
                        guildId, roleId: reward.roleId, error: err.message,
                    });
                });
            }
        }
    } catch (error) {
        logger.error('Failed to apply voice role rewards', error, {guildId, userId});
    }
}
