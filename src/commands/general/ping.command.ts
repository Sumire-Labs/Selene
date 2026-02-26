import {type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {registerCommand} from '../registry.js';
import {buildPingView} from '../../ui/builders/ping.builder.js';

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.deferReply({flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral});
    const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = Math.round(interaction.client.ws.ping);

    const container = buildPingView(wsLatency, apiLatency);

    await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });
}

registerCommand({
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botのレイテンシを表示')
        .toJSON(),
    execute: execute as (interaction: never) => Promise<void>,
});
