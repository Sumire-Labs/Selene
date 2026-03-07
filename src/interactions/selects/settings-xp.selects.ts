import type {
    AnySelectMenuInteraction,
    ChannelSelectMenuInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
} from 'discord.js';
import {MessageFlags} from 'discord.js';
import {
    getXpConfig,
    getRoleRewards,
    updateMultiplier,
    updateMessageXp,
    updateVoiceXp,
    updateCooldown,
    updateNotificationMode,
    updateNotificationChannel,
    removeRoleReward,
    addRoleReward,
    getUserXp,
    getUserRank,
} from '../../xp/xp-service.js';
import type {NotificationMode} from '../../xp/types.js';
import {buildXpBasicView} from '../../ui/builders/settings/xp-basic.builder.js';
import {buildXpNotificationView} from '../../ui/builders/settings/xp-notification.builder.js';
import {buildXpRewardsView} from '../../ui/builders/settings/xp-rewards.builder.js';
import {buildXpUsersView} from '../../ui/builders/settings/xp-users.builder.js';

export async function handleXpSelect(
    interaction: AnySelectMenuInteraction, action: string, guildId: string, param?: string,
): Promise<void> {
    switch (action) {
        case 'xp-mult': {
            const value = (interaction as StringSelectMenuInteraction).values[0];
            if (value === undefined) return;
            const result = await updateMultiplier(guildId, Number(value));
            if (!result.ok) return;
            const xpConfig = await getXpConfig(guildId);
            if (!xpConfig) return;
            const view = buildXpBasicView(guildId, xpConfig);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-msgxp': {
            const value = (interaction as StringSelectMenuInteraction).values[0];
            if (value === undefined) return;
            const result = await updateMessageXp(guildId, Number(value));
            if (!result.ok) return;
            const xpConfig = await getXpConfig(guildId);
            if (!xpConfig) return;
            const view = buildXpBasicView(guildId, xpConfig);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-vcxp': {
            const value = (interaction as StringSelectMenuInteraction).values[0];
            if (value === undefined) return;
            const result = await updateVoiceXp(guildId, Number(value));
            if (!result.ok) return;
            const xpConfig = await getXpConfig(guildId);
            if (!xpConfig) return;
            const view = buildXpBasicView(guildId, xpConfig);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-cd': {
            const value = (interaction as StringSelectMenuInteraction).values[0];
            if (value === undefined) return;
            const result = await updateCooldown(guildId, Number(value));
            if (!result.ok) return;
            const xpConfig = await getXpConfig(guildId);
            if (!xpConfig) return;
            const view = buildXpBasicView(guildId, xpConfig);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-nmode': {
            const value = (interaction as StringSelectMenuInteraction).values[0] as NotificationMode;
            if (!value) return;
            const result = await updateNotificationMode(guildId, value);
            if (!result.ok) return;
            const xpConfig = await getXpConfig(guildId);
            if (!xpConfig) return;
            const view = buildXpNotificationView(guildId, xpConfig);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-nch': {
            const channelId = (interaction as ChannelSelectMenuInteraction).values[0];
            if (!channelId) return;
            const result = await updateNotificationChannel(guildId, channelId);
            if (!result.ok) return;
            const xpConfig = await getXpConfig(guildId);
            if (!xpConfig) return;
            const view = buildXpNotificationView(guildId, xpConfig);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-rwdel': {
            const rewardId = (interaction as StringSelectMenuInteraction).values[0];
            if (!rewardId) return;
            const result = await removeRoleReward(guildId, Number(rewardId));
            if (!result.ok) return;
            const rewards = await getRoleRewards(guildId);
            const view = buildXpRewardsView(guildId, rewards);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-rwrole': {
            if (!param) return;
            const level = Number(param);
            const roleId = (interaction as RoleSelectMenuInteraction).values[0];
            if (!roleId) return;
            const result = await addRoleReward(guildId, level, roleId);
            if (!result.ok) return;
            const rewards = await getRoleRewards(guildId);
            const view = buildXpRewardsView(guildId, rewards);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-usel': {
            const userId = (interaction as UserSelectMenuInteraction).values[0];
            if (!userId) return;
            const data = await getUserXp(guildId, userId);
            const member = await interaction.guild!.members.fetch(userId).catch(() => null);
            const displayName = member?.displayName ?? userId;

            if (data) {
                const rank = await getUserRank(guildId, userId);
                const view = buildXpUsersView(guildId, {displayName, data, rank});
                await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            } else {
                const view = buildXpUsersView(guildId);
                await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            }
            break;
        }
    }
}
