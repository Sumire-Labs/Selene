import {type Client, Events} from 'discord.js';
import {musicManager} from './music-manager.js';
import {logger} from '../utils/logger.js';

export function wireVoiceIdleDetector(client: Client): void {
    client.on(Events.VoiceStateUpdate, (oldState, _newState) => {
        const guildId = oldState.guild.id;
        const guildPlayer = musicManager.get(guildId);
        if (!guildPlayer) return;

        const botVoiceChannelId = guildPlayer.player.voiceId;
        if (!botVoiceChannelId) return;

        const voiceChannel = oldState.guild.channels.cache.get(botVoiceChannelId);
        if (!voiceChannel?.isVoiceBased()) return;

        // Check if only the bot remains in the channel
        const members = voiceChannel.members.filter(m => !m.user.bot);
        if (members.size === 0) {
            logger.info('VC empty, starting disconnect timer', {guildId});
            guildPlayer.startIdleTimeout(async () => {
                logger.info('VC empty timeout, destroying player', {guildId});
                await guildPlayer.player.destroy();
                await musicManager.destroy(guildId);
            });
        } else {
            guildPlayer.clearIdleTimeout();
        }
    });
}
