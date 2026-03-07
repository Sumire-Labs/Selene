import {
    ActionRowBuilder,
    type ButtonInteraction,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import {getTicketConfig, updatePanelMessageId} from '../../ticket/ticket-service.js';
import {buildTicketOverview} from '../../ui/builders/settings/ticket-overview.builder.js';
import {buildTicketSetupView} from '../../ui/builders/settings/ticket-setup.builder.js';
import {buildTicketAdvancedView} from '../../ui/builders/settings/ticket-advanced.builder.js';
import {buildTicketPanelView} from '../../ui/builders/ticket/panel.builder.js';
import {TICKET_DEFAULT_TITLE, TICKET_DEFAULT_DESCRIPTION} from '../../config/constants.js';
import {logger} from '../../utils/logger.js';

export async function handleTicketButton(
    interaction: ButtonInteraction, action: string, guildId: string,
): Promise<void> {
    switch (action) {
        case 'ticket-edit': {
            const config = await getTicketConfig(guildId);
            const modal = new ModalBuilder()
                .setCustomId(`settings-tedit:${guildId}`)
                .setTitle('パネル編集')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('title')
                            .setLabel('タイトル')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(100)
                            .setValue(config?.panelTitle || TICKET_DEFAULT_TITLE)
                            .setRequired(true),
                    ),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('description')
                            .setLabel('説明文')
                            .setStyle(TextInputStyle.Paragraph)
                            .setMaxLength(500)
                            .setValue(config?.panelDescription || TICKET_DEFAULT_DESCRIPTION)
                            .setRequired(true),
                    ),
                );
            await interaction.showModal(modal);
            return;
        }

        case 'ticket-setup': {
            const config = await getTicketConfig(guildId);
            if (!config) return;
            const view = buildTicketSetupView(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'ticket-adv': {
            const config = await getTicketConfig(guildId);
            if (!config) return;
            const view = buildTicketAdvancedView(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'ticket-deploy': {
            const config = await getTicketConfig(guildId);
            if (!config || !config.panelChannelId || !config.categoryId || !config.supportRoleId) {
                await interaction.editReply({content: 'チケットの基本設定が完了していません。'});
                return;
            }

            // Delete old panel message if exists
            if (config.panelMessageId) {
                try {
                    const oldChannel = await interaction.guild!.channels.fetch(config.panelChannelId);
                    if (oldChannel?.isTextBased()) {
                        const oldMessage = await oldChannel.messages.fetch(config.panelMessageId);
                        await oldMessage.delete();
                    }
                } catch {
                    // Old message may already be deleted
                }
            }

            // Send new panel
            const panelChannel = await interaction.guild!.channels.fetch(config.panelChannelId);
            if (!panelChannel?.isTextBased()) {
                await interaction.editReply({content: 'パネルチャンネルにメッセージを送信できません。'});
                return;
            }

            const panelView = buildTicketPanelView(config.panelTitle ?? undefined, config.panelDescription ?? undefined);
            const panelMessage = await panelChannel.send({
                components: [panelView],
                flags: MessageFlags.IsComponentsV2,
            });

            await updatePanelMessageId(guildId, panelMessage.id);

            // Re-render overview
            const updatedConfig = await getTicketConfig(guildId);
            if (!updatedConfig) return;
            const view = buildTicketOverview(guildId, updatedConfig);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});

            logger.info('Ticket panel deployed', {guildId, panelChannelId: config.panelChannelId});
            break;
        }

        case 'ticket-back': {
            const config = await getTicketConfig(guildId);
            if (!config) return;
            const view = buildTicketOverview(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }
    }
}
