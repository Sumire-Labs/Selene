import {
    ActionRowBuilder,
    type ButtonInteraction,
    type GuildMember,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import {registerButtonHandler} from '../handler.js';
import {musicManager} from '../../music/music-manager.js';
import {logger} from '../../utils/logger.js';

async function handlePlayerButton(interaction: ButtonInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const action = parts[1];
    const guildId = parts[2];

    if (!guildId) {
        logger.warn('Player button missing guildId', {customId: interaction.customId});
        return;
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
        await interaction.reply({
            content: 'ボイスチャンネルに参加してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const guildPlayer = musicManager.get(guildId);
    if (!guildPlayer) {
        await interaction.reply({
            content: 'プレイヤーが見つかりません。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    // Verify user is in the same VC as the bot
    if (guildPlayer.player.voiceId !== voiceChannel.id) {
        await interaction.reply({
            content: 'Botと同じボイスチャンネルに参加してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    // "add" opens a modal instead of deferring
    if (action === 'add') {
        const modal = new ModalBuilder()
            .setCustomId(`player-add:${guildId}`)
            .setTitle('キューに曲を追加')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('query')
                        .setLabel('検索キーワードまたはURL')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('https://youtu.be/... または曲名')
                        .setRequired(true)
                        .setMaxLength(200),
                ),
            );
        await interaction.showModal(modal);
        return;
    }

    await interaction.deferUpdate();

    switch (action) {
        case 'pause':
            guildPlayer.togglePause();
            break;
        case 'skip':
            guildPlayer.skip();
            break;
        case 'stop':
            await guildPlayer.stop();
            break;
        case 'loop':
            guildPlayer.cycleLoopMode();
            break;
        case 'shuffle':
            guildPlayer.shuffleQueue();
            break;
        case 'volup':
            await guildPlayer.adjustVolume('up');
            break;
        case 'voldown':
            await guildPlayer.adjustVolume('down');
            break;
        case 'view':
            guildPlayer.toggleViewMode();
            break;
        default:
            logger.warn(`Unknown player action: ${action}`);
            return;
    }

    await guildPlayer.sendOrUpdatePlayerMessage();
}

registerButtonHandler('player', handlePlayerButton as (interaction: never) => Promise<void>);
