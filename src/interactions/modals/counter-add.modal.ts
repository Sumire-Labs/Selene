import {MessageFlags, type ModalSubmitInteraction} from 'discord.js';
import {registerModalHandler} from '../handler.js';
import {addCounter, listCounters} from '../../counter/counter-service.js';
import {buildSettingsView} from '../../ui/builders/counter/settings.builder.js';
import {MATCH_TYPE_EXACT, MATCH_TYPE_PARTIAL, MATCH_TYPE_WORD} from '../../config/constants.js';
import {logger} from '../../utils/logger.js';

async function handleCounterAddModal(interaction: ModalSubmitInteraction): Promise<void> {
    const guildId = interaction.customId.split(':')[1];
    if (!guildId) return;

    const word = interaction.fields.getTextInputValue('word').trim();
    const matchTypeRaw = interaction.fields.getTextInputValue('match_type').trim();
    const matchType = parseInt(matchTypeRaw, 10);

    if (![MATCH_TYPE_PARTIAL, MATCH_TYPE_EXACT, MATCH_TYPE_WORD].includes(matchType)) {
        await interaction.reply({
            content: '一致タイプは 1, 2, 3 のいずれかを入力してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (!word) {
        await interaction.reply({
            content: '単語を入力してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    await interaction.deferUpdate();

    const result = await addCounter(guildId, word, matchType);
    if (!result.ok) {
        await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
        // Still refresh settings view
    }

    const counters = await listCounters(guildId);
    const newIdx = counters.findIndex(c => c.word === word);
    const container = buildSettingsView(guildId, counters, Math.max(0, newIdx));

    await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });

    logger.info('Counter added via modal', {guildId, word, matchType});
}

registerModalHandler('counter-add', handleCounterAddModal as (interaction: never) => Promise<void>);
