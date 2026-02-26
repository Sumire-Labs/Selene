import {type ButtonInteraction, MessageFlags} from 'discord.js';
import {registerButtonHandler} from '../handler.js';
import {buildPingView} from '../../ui/builders/ping.builder.js';

async function handlePingButton(interaction: ButtonInteraction): Promise<void> {
    const wsLatency = Math.round(interaction.client.ws.ping);
    const now = Date.now();

    await interaction.deferUpdate();

    const apiLatency = Date.now() - now;
    const container = buildPingView(wsLatency, apiLatency);

    await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });
}

registerButtonHandler('ping', handlePingButton as (interaction: never) => Promise<void>);
