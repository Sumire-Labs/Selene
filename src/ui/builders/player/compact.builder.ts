import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {buildProgressBar} from './progress.js';
import {formatDuration, truncateText} from '../../../utils/formatters.js';
import type {PlayerDisplayState} from '../../../music/types.js';

export function buildCompactPlayerView(state: PlayerDisplayState): ContainerBuilder {
    const {track, position, isPaused, loopMode, guildId} = state;

    const title = truncateText(track.title, 50);
    const author = track.author ?? 'Unknown';
    const length = track.length ?? 0;

    const progressBar = buildProgressBar(position, length);
    const posStr = formatDuration(position);
    const lenStr = track.isStream ? 'LIVE' : formatDuration(length);

    const container = createContainer(SeleneTheme.colors.purple)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.player))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(`**${title}**\n${author}`))
        .addTextDisplayComponents(createText(`\`${posStr}\` ${progressBar} \`${lenStr}\``));

    const loopLabel = loopMode === 'track' ? '🔂' : loopMode === 'queue' ? '🔁' : '➡️';

    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`player:pause:${guildId}`)
                .setLabel(isPaused ? '▶' : '⏸')
                .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`player:skip:${guildId}`)
                .setLabel('⏭')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`player:stop:${guildId}`)
                .setLabel('⏹')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`player:loop:${guildId}`)
                .setLabel(loopLabel)
                .setStyle(loopMode === 'none' ? ButtonStyle.Secondary : ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`player:view:${guildId}`)
                .setLabel('📋')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`player:add:${guildId}`)
                .setLabel('➕ 曲を追加')
                .setStyle(ButtonStyle.Success),
        ),
    );

    return container;
}
