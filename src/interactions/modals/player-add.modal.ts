import {type GuildMember, MessageFlags, type ModalSubmitInteraction} from 'discord.js';
import {registerModalHandler} from '../handler.js';
import {getKazagumo} from '../../client.js';
import {musicManager} from '../../music/music-manager.js';
import {MAX_QUEUE_SIZE} from '../../config/constants.js';
import {truncateText} from '../../utils/formatters.js';
import {logger} from '../../utils/logger.js';

async function handlePlayerAddModal(interaction: ModalSubmitInteraction): Promise<void> {
    const guildId = interaction.customId.split(':')[1];
    if (!guildId) return;

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

    if (guildPlayer.player.voiceId !== voiceChannel.id) {
        await interaction.reply({
            content: 'Botと同じボイスチャンネルに参加してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const query = interaction.fields.getTextInputValue('query');
    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    const kazagumo = getKazagumo();
    const result = await kazagumo.search(query, {requester: {userId: interaction.user.id}});

    if (!result.tracks.length) {
        await interaction.editReply({content: '曲が見つかりませんでした。'});
        return;
    }

    const player = guildPlayer.player;

    if (result.type === 'PLAYLIST') {
        const tracks = result.tracks.slice(0, MAX_QUEUE_SIZE - player.queue.length);
        for (const track of tracks) {
            player.queue.add(track);
        }
        await interaction.editReply({
            content: `🎵 プレイリスト **${truncateText(result.playlistName ?? 'Unknown', 50)}** から ${tracks.length} 曲を追加しました。`,
        });
    } else {
        const track = result.tracks[0];
        player.queue.add(track);
        await interaction.editReply({
            content: `🎵 **${truncateText(track.title, 50)}** をキューに追加しました。`,
        });
    }

    if (!player.playing && !player.paused) {
        await player.play();
    }

    await guildPlayer.sendOrUpdatePlayerMessage();

    logger.info('Track added via modal', {guildId, query});
}

registerModalHandler('player-add', handlePlayerAddModal as (interaction: never) => Promise<void>);
