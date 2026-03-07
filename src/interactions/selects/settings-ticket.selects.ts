import type {
    AnySelectMenuInteraction,
    ChannelSelectMenuInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';
import {MessageFlags} from 'discord.js';
import {
    getTicketConfig,
    updateAutoCloseHours,
    updateCategory,
    updateMaxTicketsPerUser,
    updatePanelChannel,
    updateSupportRole,
} from '../../ticket/ticket-service.js';
import {buildTicketSetupView} from '../../ui/builders/settings/ticket-setup.builder.js';
import {buildTicketAdvancedView} from '../../ui/builders/settings/ticket-advanced.builder.js';

export async function handleTicketSelect(
    interaction: AnySelectMenuInteraction, action: string, guildId: string,
): Promise<void> {
    switch (action) {
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
    }
}
