import type {GuildBan} from 'discord.js';
import type {ContainerBuilder} from 'discord.js';
import {SeleneTheme, createContainer, createDivider, createHeader, createText, timestamp} from './shared.js';

export function buildBanLog(ban: GuildBan): ContainerBuilder {
    return createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader('🔨 BAN'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**ユーザー:** <@${ban.user.id}> (${ban.user.tag})\n` +
                `**理由:** ${ban.reason ?? '理由なし'}`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildUnbanLog(ban: GuildBan): ContainerBuilder {
    return createContainer(SeleneTheme.colors.green)
        .addTextDisplayComponents(createHeader('🔓 UNBAN'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**ユーザー:** <@${ban.user.id}> (${ban.user.tag})`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}
