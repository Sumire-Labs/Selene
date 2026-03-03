import type {
    GuildBan,
    GuildChannel,
    GuildMember,
    Message,
    PartialGuildMember,
    PartialMessage,
    Role,
} from 'discord.js';
import {AuditLogEvent, type ContainerBuilder, type ReadonlyCollection, type Snowflake} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {truncateText} from '../../../utils/formatters.js';
import {MAX_LOG_CONTENT_LENGTH} from '../../../config/constants.js';

function timestamp(): string {
    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `-# ${y}-${mo}-${d} ${h}:${mi}:${s}`;
}

// --- Message Events ---

export function buildMessageDeleteLog(message: Message | PartialMessage): ContainerBuilder {
    const content = message.content
        ? truncateText(message.content, MAX_LOG_CONTENT_LENGTH)
        : '*（内容を取得できません）*';

    return createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader('🗑️ メッセージ削除'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**送信者:** <@${message.author?.id ?? 'unknown'}>\n` +
                `**チャンネル:** <#${message.channelId}>\n` +
                `**内容:**\n${content}`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildMessageEditLog(
    oldMessage: Message | PartialMessage,
    newMessage: Message | PartialMessage,
): ContainerBuilder {
    const oldContent = oldMessage.content
        ? truncateText(oldMessage.content, MAX_LOG_CONTENT_LENGTH)
        : '*（取得不可）*';
    const newContent = newMessage.content
        ? truncateText(newMessage.content, MAX_LOG_CONTENT_LENGTH)
        : '*（取得不可）*';

    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('✏️ メッセージ編集'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**送信者:** <@${newMessage.author?.id ?? 'unknown'}>\n` +
                `**チャンネル:** <#${newMessage.channelId}>\n` +
                `**編集前:**\n${oldContent}\n` +
                `**編集後:**\n${newContent}`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildMessageBulkDeleteLog(
    messages: ReadonlyCollection<Snowflake, Message | PartialMessage>,
    channelId: string,
): ContainerBuilder {
    return createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader('🗑️ メッセージ一括削除'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**チャンネル:** <#${channelId}>\n` +
                `**削除数:** ${messages.size}件`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

// --- Member Events ---

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

// --- Moderation Events ---

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

// --- Role Events ---

export function buildRoleCreateLog(role: Role): ContainerBuilder {
    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('🏷️ ロール作成'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**ロール:** <@&${role.id}> (${role.name})\n` +
                `**色:** #${role.color.toString(16).padStart(6, '0')}`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildRoleUpdateLog(oldRole: Role, newRole: Role): ContainerBuilder {
    const changes: string[] = [`**ロール:** <@&${newRole.id}>`];
    if (oldRole.name !== newRole.name) {
        changes.push(`**名前:** ${oldRole.name} → ${newRole.name}`);
    }
    if (oldRole.color !== newRole.color) {
        changes.push(
            `**色:** #${oldRole.color.toString(16).padStart(6, '0')} → #${newRole.color.toString(16).padStart(6, '0')}`,
        );
    }
    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        changes.push('**権限:** 変更あり');
    }

    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('🏷️ ロール編集'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(changes.join('\n')))
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildRoleDeleteLog(role: Role): ContainerBuilder {
    return createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader('🏷️ ロール削除'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(`**ロール:** ${role.name}`),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

// --- Channel Events ---

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

// --- Webhook Events ---

export function buildWebhookLog(
    channelId: string,
    auditAction: AuditLogEvent,
): ContainerBuilder {
    let title: string;
    let color: number;

    switch (auditAction) {
        case AuditLogEvent.WebhookCreate:
            title = '🔗 Webhook作成';
            color = SeleneTheme.colors.blue;
            break;
        case AuditLogEvent.WebhookUpdate:
            title = '🔗 Webhook更新';
            color = SeleneTheme.colors.blue;
            break;
        case AuditLogEvent.WebhookDelete:
            title = '🔗 Webhook削除';
            color = SeleneTheme.colors.red;
            break;
        default:
            title = '🔗 Webhook変更';
            color = SeleneTheme.colors.blue;
    }

    return createContainer(color)
        .addTextDisplayComponents(createHeader(title))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(`**チャンネル:** <#${channelId}>`),
        )
        .addTextDisplayComponents(createText(timestamp()));
}
