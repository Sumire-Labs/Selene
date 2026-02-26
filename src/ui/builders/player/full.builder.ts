import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {buildProgressBar} from './progress.js';
import {formatDuration, truncateText} from '../../../utils/formatters.js';
import type {PlayerDisplayState} from '../../../music/types.js';
import {QUEUE_PAGE_SIZE} from '../../../config/constants.js';

export function buildFullPlayerView(state: PlayerDisplayState): ContainerBuilder {
    const {track, position, isPaused, loopMode, volume, queue, guildId} = state;

    const title = truncateText(track.title, 50);
    const author = track.author ?? 'Unknown';
    const length = track.length ?? 0;

    const progressBar = buildProgressBar(position, length);
    const posStr = formatDuration(position);
    const lenStr = track.isStream ? 'LIVE' : formatDuration(length);

    const loopLabel = loopMode === 'track' ? '1曲' : loopMode === 'queue' ? 'キュー' : 'オフ';

    const container = createContainer(SeleneTheme.colors.purple)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.player))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(`**再生中**\n**${title}**\n${author}`))
        .addTextDisplayComponents(createText(`\`${posStr}\` ${progressBar} \`${lenStr}\``))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(`🔊 **音量**: ${volume}% | 🔄 **ループ**: ${loopLabel}`),
        );

    // Queue section
    if (queue.length > 0) {
        const displayed = queue.slice(0, QUEUE_PAGE_SIZE);
        const lines = displayed.map(
            (t, i) => `\`${i + 1}.\` ${truncateText(t.title, 40)} — ${t.author ?? 'Unknown'}`,
        );
        const queueText = lines.join('\n');
        const remaining = queue.length - QUEUE_PAGE_SIZE;
        const footer = remaining > 0 ? `\n... 他${remaining}曲` : '';

        container
            .addSeparatorComponents(createDivider())
            .addTextDisplayComponents(createText(`**キュー** (${queue.length}曲)\n${queueText}${footer}`));
    }

    const loopEmoji = loopMode === 'track' ? '🔂' : loopMode === 'queue' ? '🔁' : '➡️';

    // Row 1: transport controls
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
                .setLabel(loopEmoji)
                .setStyle(loopMode === 'none' ? ButtonStyle.Secondary : ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`player:shuffle:${guildId}`)
                .setLabel('🔀')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    // Row 2: volume, view & add
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`player:voldown:${guildId}`)
                .setLabel('🔉')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`player:volup:${guildId}`)
                .setLabel('🔊')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`player:view:${guildId}`)
                .setLabel('📋 コンパクト')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`player:add:${guildId}`)
                .setLabel('➕ 曲を追加')
                .setStyle(ButtonStyle.Success),
        ),
    );

    return container;
}
