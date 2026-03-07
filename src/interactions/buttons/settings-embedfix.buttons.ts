import type {ButtonInteraction} from 'discord.js';
import {MessageFlags} from 'discord.js';
import {getEmbedFixConfig, toggleEmbedFix} from '../../settings/embedfix-service.js';
import {buildEmbedFixOverview} from '../../ui/builders/settings/embedfix-overview.builder.js';

export async function handleEmbedFixButton(
    interaction: ButtonInteraction, action: string, guildId: string,
): Promise<void> {
    switch (action) {
        case 'ef-toggle': {
            const toggleResult = await toggleEmbedFix(guildId);
            if (!toggleResult.ok) {
                await interaction.editReply({content: toggleResult.reason});
                return;
            }
            const efConfig = await getEmbedFixConfig(guildId);
            if (!efConfig) return;
            const view = buildEmbedFixOverview(guildId, efConfig);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }
    }
}
