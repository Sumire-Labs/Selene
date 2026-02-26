import {type ChatInputCommandInteraction, type GuildMember, MessageFlags, SlashCommandBuilder,} from 'discord.js';
import {registerCommand} from '../registry.js';
import {getKazagumo} from '../../client.js';
import {musicManager} from '../../music/music-manager.js';
import {config} from '../../config/index.js';
import {MAX_QUEUE_SIZE} from '../../config/constants.js';
import {truncateText} from '../../utils/formatters.js';
import {PlayerState} from 'kazagumo';

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
        await interaction.reply({
            content: 'ボイスチャンネルに参加してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const query = interaction.options.getString('query', true);

    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    const kazagumo = getKazagumo();

    // Get or create Kazagumo player; destroy stale players
    let player = kazagumo.getPlayer(interaction.guildId!);
    if (player && (player.state === PlayerState.DISCONNECTED || player.state === PlayerState.DESTROYED)) {
        await player.destroy();
        await musicManager.destroy(interaction.guildId!);
        player = undefined;
    }

    if (!player) {
        player = await kazagumo.createPlayer({
            guildId: interaction.guildId!,
            voiceId: voiceChannel.id,
            textId: interaction.channelId,
            deaf: true,
            volume: config.music.defaultVolume,
        });
    }

    // Search for tracks
    const result = await kazagumo.search(query, {requester: {userId: interaction.user.id}});

    if (!result.tracks.length) {
        await interaction.editReply({content: '曲が見つかりませんでした。'});
        return;
    }

    // Get or create GuildPlayer
    let guildPlayer = musicManager.get(interaction.guildId!);
    if (!guildPlayer) {
        guildPlayer = musicManager.create(interaction.guildId!, player, interaction.client);
    }
    guildPlayer.textChannelId = interaction.channelId;

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

    await guildPlayer.sendOrUpdatePlayerMessage(interaction.channelId);
}

registerCommand({
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('曲を再生またはキューに追加')
        .addStringOption(option =>
            option.setName('query').setDescription('検索キーワードまたはURL').setRequired(true),
        )
        .toJSON(),
    execute: execute as (interaction: never) => Promise<void>,
});
