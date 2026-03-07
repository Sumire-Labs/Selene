import type {GuildChannel} from 'discord.js';
import type {ContainerBuilder} from 'discord.js';
import {SeleneTheme, createContainer, createDivider, createHeader, createText, timestamp} from './shared.js';

export function buildChannelCreateLog(channel: GuildChannel): ContainerBuilder {
    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('📁 チャンネル作成'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(`**チャンネル:** <#${channel.id}> (${channel.name})`),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildChannelUpdateLog(
    oldChannel: GuildChannel,
    newChannel: GuildChannel,
): ContainerBuilder {
    const changes: string[] = [`**チャンネル:** <#${newChannel.id}>`];
    if (oldChannel.name !== newChannel.name) {
        changes.push(`**名前:** ${oldChannel.name} → ${newChannel.name}`);
    }

    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('📁 チャンネル編集'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(changes.join('\n')))
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildChannelDeleteLog(channel: GuildChannel): ContainerBuilder {
    return createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader('📁 チャンネル削除'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(`**チャンネル:** ${channel.name}`),
        )
        .addTextDisplayComponents(createText(timestamp()));
}
