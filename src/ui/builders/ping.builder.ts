import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from './base.builder.js';

export function buildPingView(wsLatency: number, apiLatency: number): ContainerBuilder {
    return createContainer(SeleneTheme.colors.purple)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.ping))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(`**WebSocket遅延**: ${wsLatency}ms`))
        .addTextDisplayComponents(createText(`**API遅延**: ${apiLatency}ms`))
        .addSeparatorComponents(createDivider())
        .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('ping:refresh')
                    .setLabel('更新')
                    .setStyle(ButtonStyle.Secondary),
            ),
        );
}
