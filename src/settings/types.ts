import type {LoggerConfig} from '@prisma/client';

// --- Log Event Categories ---

export const LogEventCategory = {
    MESSAGE: 'MESSAGE',
    MEMBER: 'MEMBER',
    MODERATION: 'MODERATION',
    SERVER: 'SERVER',
} as const;

export type LogEventCategoryType = (typeof LogEventCategory)[keyof typeof LogEventCategory];

// --- Log Events ---

export const LogEvent = {
    MESSAGE_DELETE: 'MESSAGE_DELETE',
    MESSAGE_EDIT: 'MESSAGE_EDIT',
    MESSAGE_BULK_DELETE: 'MESSAGE_BULK_DELETE',
    MEMBER_JOIN: 'MEMBER_JOIN',
    MEMBER_LEAVE: 'MEMBER_LEAVE',
    MEMBER_ROLE_UPDATE: 'MEMBER_ROLE_UPDATE',
    MEMBER_NICKNAME_UPDATE: 'MEMBER_NICKNAME_UPDATE',
    MEMBER_BAN: 'MEMBER_BAN',
    MEMBER_UNBAN: 'MEMBER_UNBAN',
    MEMBER_TIMEOUT: 'MEMBER_TIMEOUT',
    ROLE_CREATE: 'ROLE_CREATE',
    ROLE_UPDATE: 'ROLE_UPDATE',
    ROLE_DELETE: 'ROLE_DELETE',
    CHANNEL_CREATE: 'CHANNEL_CREATE',
    CHANNEL_UPDATE: 'CHANNEL_UPDATE',
    CHANNEL_DELETE: 'CHANNEL_DELETE',
    WEBHOOK_CREATE: 'WEBHOOK_CREATE',
    WEBHOOK_UPDATE: 'WEBHOOK_UPDATE',
    WEBHOOK_DELETE: 'WEBHOOK_DELETE',
} as const;

export type LogEventType = (typeof LogEvent)[keyof typeof LogEvent];

// --- Category → Events mapping ---

export const CATEGORY_EVENTS: Record<LogEventCategoryType, LogEventType[]> = {
    [LogEventCategory.MESSAGE]: [
        LogEvent.MESSAGE_DELETE,
        LogEvent.MESSAGE_EDIT,
        LogEvent.MESSAGE_BULK_DELETE,
    ],
    [LogEventCategory.MEMBER]: [
        LogEvent.MEMBER_JOIN,
        LogEvent.MEMBER_LEAVE,
        LogEvent.MEMBER_ROLE_UPDATE,
        LogEvent.MEMBER_NICKNAME_UPDATE,
    ],
    [LogEventCategory.MODERATION]: [
        LogEvent.MEMBER_BAN,
        LogEvent.MEMBER_UNBAN,
        LogEvent.MEMBER_TIMEOUT,
    ],
    [LogEventCategory.SERVER]: [
        LogEvent.ROLE_CREATE,
        LogEvent.ROLE_UPDATE,
        LogEvent.ROLE_DELETE,
        LogEvent.CHANNEL_CREATE,
        LogEvent.CHANNEL_UPDATE,
        LogEvent.CHANNEL_DELETE,
        LogEvent.WEBHOOK_CREATE,
        LogEvent.WEBHOOK_UPDATE,
        LogEvent.WEBHOOK_DELETE,
    ],
};

// --- Japanese labels ---

export const EVENT_LABELS: Record<LogEventType, string> = {
    [LogEvent.MESSAGE_DELETE]: 'メッセージ削除',
    [LogEvent.MESSAGE_EDIT]: 'メッセージ編集',
    [LogEvent.MESSAGE_BULK_DELETE]: 'メッセージ一括削除',
    [LogEvent.MEMBER_JOIN]: 'メンバー参加',
    [LogEvent.MEMBER_LEAVE]: 'メンバー退出',
    [LogEvent.MEMBER_ROLE_UPDATE]: 'ロール変更',
    [LogEvent.MEMBER_NICKNAME_UPDATE]: 'ニックネーム変更',
    [LogEvent.MEMBER_BAN]: 'BAN',
    [LogEvent.MEMBER_UNBAN]: 'UNBAN',
    [LogEvent.MEMBER_TIMEOUT]: 'タイムアウト',
    [LogEvent.ROLE_CREATE]: 'ロール作成',
    [LogEvent.ROLE_UPDATE]: 'ロール編集',
    [LogEvent.ROLE_DELETE]: 'ロール削除',
    [LogEvent.CHANNEL_CREATE]: 'チャンネル作成',
    [LogEvent.CHANNEL_UPDATE]: 'チャンネル編集',
    [LogEvent.CHANNEL_DELETE]: 'チャンネル削除',
    [LogEvent.WEBHOOK_CREATE]: 'Webhook作成',
    [LogEvent.WEBHOOK_UPDATE]: 'Webhook更新',
    [LogEvent.WEBHOOK_DELETE]: 'Webhook削除',
};

export const CATEGORY_LABELS: Record<LogEventCategoryType, string> = {
    [LogEventCategory.MESSAGE]: '📨 メッセージ',
    [LogEventCategory.MEMBER]: '👤 メンバー',
    [LogEventCategory.MODERATION]: '🔨 モデレーション',
    [LogEventCategory.SERVER]: '🖥️ サーバー',
};

export const CATEGORY_EMOJI: Record<LogEventCategoryType, string> = {
    [LogEventCategory.MESSAGE]: '📨',
    [LogEventCategory.MEMBER]: '👤',
    [LogEventCategory.MODERATION]: '🔨',
    [LogEventCategory.SERVER]: '🖥️',
};

// --- Category → LoggerConfig channel field mapping ---

export const CATEGORY_CHANNEL_FIELD: Record<LogEventCategoryType, keyof LoggerConfig> = {
    [LogEventCategory.MESSAGE]: 'messageChannelId',
    [LogEventCategory.MEMBER]: 'memberChannelId',
    [LogEventCategory.MODERATION]: 'moderationChannelId',
    [LogEventCategory.SERVER]: 'serverChannelId',
};

// --- Settings top-level categories (extensible) ---

export interface SettingsCategory {
    id: string;
    label: string;
    emoji: string;
}

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
    {id: 'logger', label: 'ロガー', emoji: '📋'},
    {id: 'ticket', label: 'チケット', emoji: '🎫'},
];
