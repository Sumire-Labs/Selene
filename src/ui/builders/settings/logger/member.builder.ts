import type {GuildMember, PartialGuildMember} from 'discord.js';
import type {ContainerBuilder} from 'discord.js';
import {SeleneTheme, createContainer, createDivider, createHeader, createText, timestamp} from './shared.js';

export function buildMemberJoinLog(member: GuildMember): ContainerBuilder {
    const createdAt = Math.floor(member.user.createdTimestamp / 1000);

    return createContainer(SeleneTheme.colors.green)
        .addTextDisplayComponents(createHeader('📥 メンバー参加'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**ユーザー:** <@${member.id}> (${member.user.tag})\n` +
                `**アカウント作成日:** <t:${createdAt}:R>`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildMemberLeaveLog(member: GuildMember | PartialGuildMember): ContainerBuilder {
    const joinedAt = member.joinedTimestamp
        ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
        : '不明';

    return createContainer(SeleneTheme.colors.grey)
        .addTextDisplayComponents(createHeader('📤 メンバー退出'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**ユーザー:** <@${member.id}> (${member.user?.tag ?? 'Unknown'})\n` +
                `**参加日:** ${joinedAt}`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildMemberRoleUpdateLog(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
): ContainerBuilder {
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const added = newRoles.filter(r => !oldRoles.has(r.id) && r.id !== newMember.guild.id);
    const removed = oldRoles.filter(r => !newRoles.has(r.id) && r.id !== newMember.guild.id);

    const lines: string[] = [`**ユーザー:** <@${newMember.id}>`];
    if (added.size > 0) {
        lines.push(`**追加:** ${added.map(r => `<@&${r.id}>`).join(', ')}`);
    }
    if (removed.size > 0) {
        lines.push(`**削除:** ${removed.map(r => `<@&${r.id}>`).join(', ')}`);
    }

    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('🏷️ ロール変更'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(lines.join('\n')))
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildMemberNicknameUpdateLog(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
): ContainerBuilder {
    const oldNick = oldMember.nickname ?? '*なし*';
    const newNick = newMember.nickname ?? '*なし*';

    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('📝 ニックネーム変更'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**ユーザー:** <@${newMember.id}>\n` +
                `**変更前:** ${oldNick}\n` +
                `**変更後:** ${newNick}`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildMemberTimeoutLog(
    _oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
): ContainerBuilder {
    const timeout = newMember.communicationDisabledUntilTimestamp;
    const status = timeout && timeout > Date.now()
        ? `<t:${Math.floor(timeout / 1000)}:R> まで`
        : '解除';

    return createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader('⏰ タイムアウト'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**ユーザー:** <@${newMember.id}>\n` +
                `**タイムアウト:** ${status}`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}
