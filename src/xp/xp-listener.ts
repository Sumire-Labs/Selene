import {type Message, MessageFlags} from 'discord.js';
import {getCachedXpConfig} from './xp-cache.js';
import {addMessageXp, getRewardsForLevel} from './xp-service.js';
import {isOnCooldown, setCooldown} from '../utils/cooldown.js';
import {buildLevelUpView} from '../ui/builders/xp/levelup.builder.js';
import {logger} from '../utils/logger.js';

export async function handleXpMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guildId) return;
    if (!message.content) return;

    const config = await getCachedXpConfig(message.guildId);
    if (!config?.enabled) return;

    // Cooldown check
    const cooldownKey = `xp:${message.guildId}:${message.author.id}`;
    if (isOnCooldown(cooldownKey)) return;

    const amount = Math.floor(config.messageXp * config.multiplier);
    if (amount <= 0) return;

    setCooldown(cooldownKey, config.cooldownSeconds * 1000);

    const result = await addMessageXp(message.guildId, message.author.id, amount);

    if (result.leveledUp) {
        // Send level-up notification
        await sendLevelUpNotification(message, config, result.newLevel);

        // Apply role rewards
        await applyRoleRewards(message, result.newLevel);
    }
}

async function sendLevelUpNotification(
    message: Message,
    config: {notificationMode: string; notificationChannelId: string | null},
    newLevel: number,
): Promise<void> {
    try {
        if (config.notificationMode === 'disabled') return;

        const view = buildLevelUpView(message.author.id, newLevel);

        if (config.notificationMode === 'same' && 'send' in message.channel) {
            await message.channel.send({
                components: [view],
                flags: MessageFlags.IsComponentsV2,
            });
        } else if (config.notificationMode === 'dedicated' && config.notificationChannelId) {
            const channel = await message.guild!.channels.fetch(config.notificationChannelId);
            if (channel?.isTextBased()) {
                await channel.send({
                    components: [view],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
        }
    } catch (error) {
        logger.error('Failed to send level-up notification', error, {
            guildId: message.guildId!,
            userId: message.author.id,
        });
    }
}

async function applyRoleRewards(message: Message, newLevel: number): Promise<void> {
    try {
        const rewards = await getRewardsForLevel(message.guildId!, newLevel);
        if (rewards.length === 0) return;

        const member = message.member ?? await message.guild!.members.fetch(message.author.id);

        for (const reward of rewards) {
            if (!member.roles.cache.has(reward.roleId)) {
                await member.roles.add(reward.roleId).catch(err => {
                    logger.warn('Failed to add role reward', {
                        guildId: message.guildId!,
                        roleId: reward.roleId,
                        error: err.message,
                    });
                });
            }
        }
    } catch (error) {
        logger.error('Failed to apply role rewards', error, {
            guildId: message.guildId!,
            userId: message.author.id,
        });
    }
}
