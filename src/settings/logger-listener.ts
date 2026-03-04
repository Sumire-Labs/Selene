import {
    AuditLogEvent,
    type Client,
    Events,
    type GuildChannel,
    MessageFlags,
} from 'discord.js';
import {getCachedLoggerConfig} from './logger-cache.js';
import {CATEGORY_CHANNEL_FIELD, LogEvent, LogEventCategory, type LogEventType} from './types.js';
import {
    buildBanLog,
    buildChannelCreateLog,
    buildChannelDeleteLog,
    buildChannelUpdateLog,
    buildMemberJoinLog,
    buildMemberLeaveLog,
    buildMemberNicknameUpdateLog,
    buildMemberRoleUpdateLog,
    buildMemberTimeoutLog,
    buildMessageBulkDeleteLog,
    buildMessageDeleteLog,
    buildMessageEditLog,
    buildRoleCreateLog,
    buildRoleDeleteLog,
    buildRoleUpdateLog,
    buildUnbanLog,
    buildWebhookLog,
} from '../ui/builders/settings/logger-log.builder.js';
import {logger} from '../utils/logger.js';
import type {ContainerBuilder} from 'discord.js';

type LogEventCategoryType = (typeof LogEventCategory)[keyof typeof LogEventCategory];

async function sendLog(
    client: Client,
    guildId: string,
    event: LogEventType,
    category: LogEventCategoryType,
    buildFn: () => ContainerBuilder,
): Promise<void> {
    try {
        const config = await getCachedLoggerConfig(guildId);
        if (!config?.enabled) return;
        if (!config.enabledEvents.includes(event)) return;

        const channelField = CATEGORY_CHANNEL_FIELD[category];
        const channelId = (config[channelField] as string | null) ?? config.defaultChannelId;
        if (!channelId) return;

        const channel = await client.channels.fetch(channelId);
        if (!channel?.isTextBased() || !('send' in channel)) return;

        await channel.send({
            components: [buildFn()],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {parse: []},
        });
    } catch (error) {
        logger.error('Failed to send log', error, {guildId, event});
    }
}

export function wireLoggerEvents(client: Client): void {
    // --- Message Events ---

    client.on(Events.MessageDelete, (message) => {
        if (!message.guildId) return;
        if (message.author?.bot) return;

        sendLog(client, message.guildId, LogEvent.MESSAGE_DELETE, LogEventCategory.MESSAGE, () =>
            buildMessageDeleteLog(message),
        );
    });

    client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
        if (!newMessage.guildId) return;
        if (newMessage.author?.bot) return;
        // Only log content changes
        if (oldMessage.content === newMessage.content) return;

        sendLog(client, newMessage.guildId, LogEvent.MESSAGE_EDIT, LogEventCategory.MESSAGE, () =>
            buildMessageEditLog(oldMessage, newMessage),
        );
    });

    client.on(Events.MessageBulkDelete, (messages, channel) => {
        const guildId = channel.guildId;
        if (!guildId) return;

        sendLog(client, guildId, LogEvent.MESSAGE_BULK_DELETE, LogEventCategory.MESSAGE, () =>
            buildMessageBulkDeleteLog(messages, channel.id),
        );
    });

    // --- Member Events ---

    client.on(Events.GuildMemberAdd, (member) => {
        sendLog(client, member.guild.id, LogEvent.MEMBER_JOIN, LogEventCategory.MEMBER, () =>
            buildMemberJoinLog(member),
        );
    });

    client.on(Events.GuildMemberRemove, (member) => {
        sendLog(client, member.guild.id, LogEvent.MEMBER_LEAVE, LogEventCategory.MEMBER, () =>
            buildMemberLeaveLog(member),
        );
    });

    client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
        const guildId = newMember.guild.id;

        // Role changes
        if (oldMember.roles.cache.size !== newMember.roles.cache.size ||
            !oldMember.roles.cache.every((_, key) => newMember.roles.cache.has(key))) {
            sendLog(client, guildId, LogEvent.MEMBER_ROLE_UPDATE, LogEventCategory.MEMBER, () =>
                buildMemberRoleUpdateLog(oldMember, newMember),
            );
        }

        // Nickname changes
        if (oldMember.nickname !== newMember.nickname) {
            sendLog(client, guildId, LogEvent.MEMBER_NICKNAME_UPDATE, LogEventCategory.MEMBER, () =>
                buildMemberNicknameUpdateLog(oldMember, newMember),
            );
        }

        // Timeout changes
        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
            sendLog(client, guildId, LogEvent.MEMBER_TIMEOUT, LogEventCategory.MODERATION, () =>
                buildMemberTimeoutLog(oldMember, newMember),
            );
        }
    });

    // --- Moderation Events ---

    client.on(Events.GuildBanAdd, (ban) => {
        sendLog(client, ban.guild.id, LogEvent.MEMBER_BAN, LogEventCategory.MODERATION, () =>
            buildBanLog(ban),
        );
    });

    client.on(Events.GuildBanRemove, (ban) => {
        sendLog(client, ban.guild.id, LogEvent.MEMBER_UNBAN, LogEventCategory.MODERATION, () =>
            buildUnbanLog(ban),
        );
    });

    // --- Server Events (Roles) ---

    client.on(Events.GuildRoleCreate, (role) => {
        sendLog(client, role.guild.id, LogEvent.ROLE_CREATE, LogEventCategory.SERVER, () =>
            buildRoleCreateLog(role),
        );
    });

    client.on(Events.GuildRoleUpdate, (oldRole, newRole) => {
        sendLog(client, newRole.guild.id, LogEvent.ROLE_UPDATE, LogEventCategory.SERVER, () =>
            buildRoleUpdateLog(oldRole, newRole),
        );
    });

    client.on(Events.GuildRoleDelete, (role) => {
        sendLog(client, role.guild.id, LogEvent.ROLE_DELETE, LogEventCategory.SERVER, () =>
            buildRoleDeleteLog(role),
        );
    });

    // --- Server Events (Channels) ---

    client.on(Events.ChannelCreate, (channel) => {
        if (!channel.guild) return;
        sendLog(client, channel.guild.id, LogEvent.CHANNEL_CREATE, LogEventCategory.SERVER, () =>
            buildChannelCreateLog(channel),
        );
    });

    client.on(Events.ChannelUpdate, (oldChannel, newChannel) => {
        const gc = newChannel as GuildChannel;
        if (!gc.guild) return;
        sendLog(client, gc.guild.id, LogEvent.CHANNEL_UPDATE, LogEventCategory.SERVER, () =>
            buildChannelUpdateLog(oldChannel as GuildChannel, gc),
        );
    });

    client.on(Events.ChannelDelete, (channel) => {
        const gc = channel as GuildChannel;
        if (!gc.guild) return;
        sendLog(client, gc.guild.id, LogEvent.CHANNEL_DELETE, LogEventCategory.SERVER, () =>
            buildChannelDeleteLog(gc),
        );
    });

    // --- Server Events (Webhooks) ---

    client.on(Events.WebhooksUpdate, async (channel) => {
        const gc = channel as GuildChannel;
        if (!gc.guild) return;
        const guildId = gc.guild.id;

        try {
            const auditLogs = await gc.guild.fetchAuditLogs({limit: 1});
            const entry = auditLogs.entries.first();
            if (!entry) return;

            // Only process if within 5 seconds
            const age = Date.now() - entry.createdTimestamp;
            if (age > 5000) return;

            let event: LogEventType | null = null;
            switch (entry.action) {
                case AuditLogEvent.WebhookCreate:
                    event = LogEvent.WEBHOOK_CREATE;
                    break;
                case AuditLogEvent.WebhookUpdate:
                    event = LogEvent.WEBHOOK_UPDATE;
                    break;
                case AuditLogEvent.WebhookDelete:
                    event = LogEvent.WEBHOOK_DELETE;
                    break;
            }

            if (!event) return;
            const auditAction = entry.action;

            sendLog(client, guildId, event, LogEventCategory.SERVER, () =>
                buildWebhookLog(channel.id, auditAction),
            );
        } catch {
            // Missing VIEW_AUDIT_LOG permission — silently skip
        }
    });

    logger.info('Logger events wired');
}
