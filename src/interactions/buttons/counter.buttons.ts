import {
    ActionRowBuilder,
    type ButtonInteraction,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import {registerButtonHandler} from '../handler.js';
import {
    deleteCounter,
    getUserCounts,
    getWordCounts,
    listCounters,
    type PeriodFilter
} from '../../counter/counter-service.js';
import {buildSettingsView} from '../../ui/builders/counter/settings.builder.js';
import {buildStatsView} from '../../ui/builders/counter/stats.builder.js';
import {logger} from '../../utils/logger.js';

async function handleCounterButton(interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const action = parts[1];
    const guildId = parts[2];
    const param = parts[3];

    if (!guildId) {
        logger.warn('Counter button missing guildId', {customId: interaction.customId});
        return;
    }

    // "add" opens a modal
    if (action === 'add') {
        const modal = new ModalBuilder()
            .setCustomId(`counter-add:${guildId}`)
            .setTitle('カウンター追加')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('word')
                        .setLabel('カウントする単語')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('おはよう')
                        .setRequired(true)
                        .setMaxLength(50),
                ),
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('match_type')
                        .setLabel('一致タイプ (1=部分一致, 2=完全一致, 3=単語一致)')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('1')
                        .setRequired(true)
                        .setMaxLength(1),
                ),
            );
        await interaction.showModal(modal);
        return;
    }

    await interaction.deferUpdate();

    if (action === 'sta') {
        // Stats tab
        const period = (param === 'd' || param === 'w' ? param : 'a') as PeriodFilter;
        const [wordCounts, userCounts] = await Promise.all([
            getWordCounts(guildId, period),
            getUserCounts(guildId, period),
        ]);
        const container = buildStatsView(guildId, period, wordCounts, userCounts);
        await interaction.editReply({components: [container], flags: MessageFlags.IsComponentsV2});
        return;
    }

    // Settings-related actions
    const counters = await listCounters(guildId);
    let idx = parseInt(param ?? '0', 10) || 0;

    switch (action) {
        case 'up':
            idx = Math.max(0, idx - 1);
            break;
        case 'dn':
            idx = Math.min(counters.length - 1, idx + 1);
            break;
        case 'del':
            if (counters[idx]) {
                await deleteCounter(guildId, counters[idx].id);
                const updated = await listCounters(guildId);
                idx = Math.min(idx, Math.max(0, updated.length - 1));
                const container = buildSettingsView(guildId, updated, idx);
                await interaction.editReply({components: [container], flags: MessageFlags.IsComponentsV2});
                return;
            }
            break;
        case 'set':
            // Just show settings tab with given idx
            break;
        default:
            logger.warn(`Unknown counter action: ${action}`);
            return;
    }

    const container = buildSettingsView(guildId, counters, idx);
    await interaction.editReply({components: [container], flags: MessageFlags.IsComponentsV2});
}

registerButtonHandler('counter', handleCounterButton as (interaction: never) => Promise<void>);
