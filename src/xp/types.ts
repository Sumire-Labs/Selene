export type NotificationMode = 'disabled' | 'same' | 'dedicated';

export const NOTIFICATION_MODE_LABELS: Record<NotificationMode, string> = {
    disabled: '無効',
    same: '同じチャンネル',
    dedicated: '指定チャンネル',
};

export const MULTIPLIER_OPTIONS = [
    {label: '0.5x', value: '0.5'},
    {label: '1x', value: '1'},
    {label: '1.5x', value: '1.5'},
    {label: '2x', value: '2'},
    {label: '3x', value: '3'},
];

export const MESSAGE_XP_OPTIONS = [
    {label: '5 XP', value: '5'},
    {label: '10 XP', value: '10'},
    {label: '15 XP', value: '15'},
    {label: '20 XP', value: '20'},
    {label: '30 XP', value: '30'},
    {label: '40 XP', value: '40'},
    {label: '50 XP', value: '50'},
];

export const VOICE_XP_OPTIONS = [
    {label: '2 XP/分', value: '2'},
    {label: '4 XP/分', value: '4'},
    {label: '6 XP/分', value: '6'},
    {label: '8 XP/分', value: '8'},
    {label: '10 XP/分', value: '10'},
    {label: '15 XP/分', value: '15'},
];

export const COOLDOWN_OPTIONS = [
    {label: '30秒', value: '30'},
    {label: '45秒', value: '45'},
    {label: '60秒', value: '60'},
    {label: '90秒', value: '90'},
    {label: '120秒', value: '120'},
];

export const NOTIFICATION_MODE_OPTIONS = [
    {label: '無効', value: 'disabled'},
    {label: '同じチャンネル', value: 'same'},
    {label: '指定チャンネル', value: 'dedicated'},
];

export interface AddXpResult {
    ok: true;
    xp: number;
    level: number;
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
}
