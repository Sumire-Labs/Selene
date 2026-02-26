import {type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {registerCommand} from '../registry.js';
import {listCounters} from '../../counter/counter-service.js';
import {buildSettingsView} from '../../ui/builders/counter/settings.builder.js';

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) return;

    await interaction.deferReply({flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral});

    const counters = await listCounters(guildId);
    const container = buildSettingsView(guildId, counters, 0);

    await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });
}

registerCommand({
    data: new SlashCommandBuilder()
        .setName('counter')
        .setDescription('メッセージカウンターの設定と統計')
        .toJSON(),
    execute: execute as (interaction: never) => Promise<void>,
});
