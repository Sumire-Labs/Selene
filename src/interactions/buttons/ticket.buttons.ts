import {
    ActionRowBuilder,
    type ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import {registerButtonHandler} from '../handler.js';
import {logger} from '../../utils/logger.js';

async function handleTicketButton(interaction: ButtonInteraction): Promise<void> {
    const action = interaction.customId.split(':')[1];

    if (action === 'create') {
        const guildId = interaction.guildId;
        if (!guildId) return;

        const modal = new ModalBuilder()
            .setCustomId(`ticket-create:${guildId}`)
            .setTitle('チケット作成')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('title')
                        .setLabel('タイトル')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('問い合わせ内容を簡潔に')
                        .setRequired(true)
                        .setMaxLength(100),
                ),
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('description')
                        .setLabel('説明')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('詳細を記入してください')
                        .setRequired(true)
                        .setMaxLength(1000),
                ),
            );

        await interaction.showModal(modal);
        return;
    }

    if (action === 'close') {
        await interaction.deferUpdate();
        try {
            await interaction.channel?.delete();
        } catch (error) {
            logger.error('Failed to delete ticket channel', error, {
                channelId: interaction.channelId,
            });
        }
        return;
    }

    logger.warn(`Unknown ticket button action: ${action}`);
}

registerButtonHandler('ticket', handleTicketButton as (interaction: never) => Promise<void>);
