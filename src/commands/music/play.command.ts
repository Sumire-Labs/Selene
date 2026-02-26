import {type ChatInputCommandInteraction, type GuildMember, MessageFlags, SlashCommandBuilder,} from 'discord.js';
import {registerCommand} from '../registry.js';
import {getKazagumo} from '../../client.js';
import {musicManager} from '../../music/music-manager.js';
import {config} from '../../config/index.js';
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

    // Get or create GuildPlayer
    let guildPlayer = musicManager.get(interaction.guildId!);
    if (!guildPlayer) {
        guildPlayer = musicManager.create(interaction.guildId!, player, interaction.client);
    }
    guildPlayer.textChannelId = interaction.channelId;

    await guildPlayer.sendOrUpdatePlayerMessage(interaction.channelId, true);

    await interaction.editReply({content: 'プレイヤーを起動しました。'});
}

registerCommand({
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('音楽プレイヤーを起動')
        .toJSON(),
    execute: execute as (interaction: never) => Promise<void>,
});
