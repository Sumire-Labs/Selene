import {
    type AnySelectMenuInteraction,
    type ChannelSelectMenuInteraction,
    MessageFlags,
    type RoleSelectMenuInteraction,
    type StringSelectMenuInteraction,
    type UserSelectMenuInteraction,
} from 'discord.js';
import {registerSelectMenuHandler} from '../handler.js';
import {
    ensureLoggerConfig,
    getLoggerConfig,
    setCategoryChannel,
    setDefaultChannel,
    updateEnabledEvents,
} from '../../settings/logger-service.js';
import {
    ensureTicketConfig,
    getTicketConfig,
    updateAutoCloseHours,
    updateCategory,
    updateMaxTicketsPerUser,
    updatePanelChannel,
    updateSupportRole,
} from '../../ticket/ticket-service.js';
import {ensureEmbedFixConfig} from '../../settings/embedfix-service.js';
import {
    ensureXpConfig,
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
import {buildLoggerOverview} from '../../ui/builders/settings/logger-overview.builder.js';
import {buildLoggerEventsView} from '../../ui/builders/settings/logger-events.builder.js';
import {buildLoggerChannelsView} from '../../ui/builders/settings/logger-channels.builder.js';
import {buildTicketOverview} from '../../ui/builders/settings/ticket-overview.builder.js';
import {buildTicketSetupView} from '../../ui/builders/settings/ticket-setup.builder.js';
import {buildTicketAdvancedView} from '../../ui/builders/settings/ticket-advanced.builder.js';
import {buildXpOverview} from '../../ui/builders/settings/xp-overview.builder.js';
import {buildXpBasicView} from '../../ui/builders/settings/xp-basic.builder.js';
import {buildXpNotificationView} from '../../ui/builders/settings/xp-notification.builder.js';
import {buildXpRewardsView} from '../../ui/builders/settings/xp-rewards.builder.js';
import {buildXpUsersView} from '../../ui/builders/settings/xp-users.builder.js';
import {buildEmbedFixOverview} from '../../ui/builders/settings/embedfix-overview.builder.js';
import {CATEGORY_EVENTS, type LogEventCategoryType} from '../../settings/types.js';
import {logger} from '../../utils/logger.js';

async function handleSettingsSelect(interaction: AnySelectMenuInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const action = parts[1];
    const guildId = parts[2];
    const param = parts[3] as string | undefined;

    if (!guildId) {
        logger.warn('Settings select missing guildId', {customId: interaction.customId});
        return;
    }

    await interaction.deferUpdate();

    switch (action) {
        // Dashboard category select
        case 'cat': {
            const selected = (interaction as StringSelectMenuInteraction).values[0];
            if (selected === 'logger') {
                const result = await ensureLoggerConfig(guildId);
                if (!result.ok) {
                    await interaction.editReply({content: result.reason});
                    return;
                }
                const view = buildLoggerOverview(guildId, result.config);
                await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            } else if (selected === 'ticket') {
                const result = await ensureTicketConfig(guildId);
                if (!result.ok) {
                    await interaction.editReply({content: result.reason});
                    return;
                }
                const view = buildTicketOverview(guildId, result.config);
                await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            } else if (selected === 'xp') {
                const result = await ensureXpConfig(guildId);
                if (!result.ok) {
                    await interaction.editReply({content: result.reason});
                    return;
                }
                const rewards = await getRoleRewards(guildId);
                const view = buildXpOverview(guildId, result.config, rewards.length);
                await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            } else if (selected === 'embedfix') {
                const result = await ensureEmbedFixConfig(guildId);
                if (!result.ok) {
                    await interaction.editReply({content: result.reason});
                    return;
                }
                const view = buildEmbedFixOverview(guildId, result.config);
                await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            }
            break;
        }

        // --- Logger selects ---

        case 'log-evsel': {
            if (!param) return;
            const category = param as LogEventCategoryType;
            const selectedEvents = (interaction as StringSelectMenuInteraction).values;

            const config = await getLoggerConfig(guildId);
            if (!config) return;

            const thisCategoryEvents = CATEGORY_EVENTS[category];
            const otherEvents = config.enabledEvents.filter(e => !thisCategoryEvents.includes(e as never));
            const merged = [...otherEvents, ...selectedEvents];

            const result = await updateEnabledEvents(guildId, merged);
            if (!result.ok) return;

            const updatedConfig = await getLoggerConfig(guildId);
            if (!updatedConfig) return;
            const view = buildLoggerEventsView(guildId, updatedConfig, category);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-chdef': {
            const channelId = (interaction as ChannelSelectMenuInteraction).values[0];
            if (!channelId) return;

            const result = await setDefaultChannel(guildId, channelId);
            if (!result.ok) return;

            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, param as LogEventCategoryType ?? 'MESSAGE');
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-chcat': {
            if (!param) return;
            const category = param as LogEventCategoryType;
            const channelId = (interaction as ChannelSelectMenuInteraction).values[0];
            if (!channelId) return;

            const result = await setCategoryChannel(guildId, category, channelId);
            if (!result.ok) return;

            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, category);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // --- Ticket selects ---

        case 'ticket-ch': {
            const channelId = (interaction as ChannelSelectMenuInteraction).values[0];
            if (!channelId) return;

            const result = await updatePanelChannel(guildId, channelId);
            if (!result.ok) return;

            const config = await getTicketConfig(guildId);
            if (!config) return;
            const view = buildTicketSetupView(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'ticket-cat': {
            const channelId = (interaction as ChannelSelectMenuInteraction).values[0];
            if (!channelId) return;

            const result = await updateCategory(guildId, channelId);
            if (!result.ok) return;

            const config = await getTicketConfig(guildId);
            if (!config) return;
            const view = buildTicketSetupView(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'ticket-role': {
            const roleId = (interaction as RoleSelectMenuInteraction).values[0];
            if (!roleId) return;

            const result = await updateSupportRole(guildId, roleId);
            if (!result.ok) return;

            const config = await getTicketConfig(guildId);
            if (!config) return;
            const view = buildTicketSetupView(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'ticket-max': {
            const value = (interaction as StringSelectMenuInteraction).values[0];
            if (value === undefined) return;

            const result = await updateMaxTicketsPerUser(guildId, Number(value));
            if (!result.ok) return;

            const config = await getTicketConfig(guildId);
            if (!config) return;
            const view = buildTicketAdvancedView(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'ticket-aclose': {
            const value = (interaction as StringSelectMenuInteraction).values[0];
            if (value === undefined) return;

            const hours = Number(value) || null; // 0 → null (disabled)
            const result = await updateAutoCloseHours(guildId, hours);
            if (!result.ok) return;

            const config = await getTicketConfig(guildId);
            if (!config) return;
            const view = buildTicketAdvancedView(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // --- XP selects ---

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

        default:
            logger.warn(`Unknown settings select action: ${action}`);
    }
}

registerSelectMenuHandler('settings', handleSettingsSelect as (interaction: never) => Promise<void>);
