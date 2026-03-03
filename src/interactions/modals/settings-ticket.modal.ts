import {MessageFlags, type ModalSubmitInteraction} from 'discord.js';
import {registerModalHandler} from '../handler.js';
import {getTicketConfig, updatePanelCustomization} from '../../ticket/ticket-service.js';
import {buildTicketOverview} from '../../ui/builders/settings/ticket-overview.builder.js';
import {logger} from '../../utils/logger.js';

async function handleSettingsTicketEditModal(interaction: ModalSubmitInteraction): Promise<void> {
    const guildId = interaction.customId.split(':')[1];
    if (!guildId) return;

    const title = interaction.fields.getTextInputValue('title').trim();
    const description = interaction.fields.getTextInputValue('description').trim();

    await interaction.deferUpdate();

    const result = await updatePanelCustomization(guildId, title || undefined, description || undefined);
    if (!result.ok) {
        await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
        return;
    }

    const config = await getTicketConfig(guildId);
    if (!config) return;

    const view = buildTicketOverview(guildId, config);
    await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});

    logger.info('Ticket panel customization updated', {guildId});
}

registerModalHandler('settings-tedit', handleSettingsTicketEditModal as (interaction: never) => Promise<void>);
