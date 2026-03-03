import {
    ActionRowBuilder,
    type ButtonInteraction,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import {registerButtonHandler} from '../handler.js';
import {ensureLoggerConfig, getLoggerConfig, setCategoryChannel, toggleLogger} from '../../settings/logger-service.js';
import {ensureTicketConfig, getTicketConfig, updatePanelMessageId} from '../../ticket/ticket-service.js';
import {buildSettingsDashboard} from '../../ui/builders/settings/dashboard.builder.js';
import {buildLoggerOverview} from '../../ui/builders/settings/logger-overview.builder.js';
import {buildLoggerEventsView} from '../../ui/builders/settings/logger-events.builder.js';
import {buildLoggerChannelsView} from '../../ui/builders/settings/logger-channels.builder.js';
import {buildTicketOverview} from '../../ui/builders/settings/ticket-overview.builder.js';
import {buildTicketSetupView} from '../../ui/builders/settings/ticket-setup.builder.js';
import {buildTicketAdvancedView} from '../../ui/builders/settings/ticket-advanced.builder.js';
import {buildTicketPanelView} from '../../ui/builders/ticket/panel.builder.js';
import {LogEventCategory, type LogEventCategoryType} from '../../settings/types.js';
import {TICKET_DEFAULT_TITLE, TICKET_DEFAULT_DESCRIPTION} from '../../config/constants.js';
import {logger} from '../../utils/logger.js';

async function handleSettingsButton(interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const action = parts[1];
    const guildId = parts[2];
    const param = parts[3] as string | undefined;

    if (!guildId) {
        logger.warn('Settings button missing guildId', {customId: interaction.customId});
        return;
    }

    // ticket-edit shows a modal, so do NOT deferUpdate
    if (action === 'ticket-edit') {
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

    await interaction.deferUpdate();

    switch (action) {
        // Dashboard → category detail
        case 'cat': {
            if (param === 'logger') {
                const result = await ensureLoggerConfig(guildId);
                if (!result.ok) {
                    await interaction.editReply({content: result.reason});
                    return;
                }
                const view = buildLoggerOverview(guildId, result.config);
                await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            } else if (param === 'ticket') {
                const result = await ensureTicketConfig(guildId);
                if (!result.ok) {
                    await interaction.editReply({content: result.reason});
                    return;
                }
                const view = buildTicketOverview(guildId, result.config);
                await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            }
            break;
        }

        // Back to dashboard
        case 'back': {
            const dashboard = buildSettingsDashboard(guildId);
            await interaction.editReply({components: [dashboard], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // --- Logger actions ---

        case 'log-toggle': {
            const toggleResult = await toggleLogger(guildId);
            if (!toggleResult.ok) {
                await interaction.editReply({content: toggleResult.reason});
                return;
            }
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerOverview(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-events': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerEventsView(guildId, config, LogEventCategory.MESSAGE);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-evcat': {
            if (!param) return;
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerEventsView(guildId, config, param as LogEventCategoryType);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-evback': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerOverview(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-channels': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, LogEventCategory.MESSAGE);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-chtab': {
            if (!param) return;
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, param as LogEventCategoryType);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-chrst': {
            if (!param) return;
            await setCategoryChannel(guildId, param as LogEventCategoryType, null);
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerChannelsView(guildId, config, param as LogEventCategoryType);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'log-chback': {
            const config = await getLoggerConfig(guildId);
            if (!config) return;
            const view = buildLoggerOverview(guildId, config);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        // --- Ticket actions ---

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

        default:
            logger.warn(`Unknown settings button action: ${action}`);
    }
}

registerButtonHandler('settings', handleSettingsButton as (interaction: never) => Promise<void>);
