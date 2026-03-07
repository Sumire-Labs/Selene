export const ACTIVITY_CRITERIA = {
    messages: 'messages',
    reactions: 'reactions',
    voice: 'voice',
} as const;

export type ActivityCriterion = typeof ACTIVITY_CRITERIA[keyof typeof ACTIVITY_CRITERIA];

export const CRITERIA_LABELS: Record<ActivityCriterion, string> = {
    messages: 'メッセージ',
    reactions: 'リアクション',
    voice: 'ボイス',
};

export const CRITERIA_SHORT: Record<ActivityCriterion, string> = {
    messages: 'MSG',
    reactions: 'RCT',
    voice: 'VC',
};

export const INACTIVITY_OPTIONS = [
    {label: '30日', value: 30},
    {label: '60日', value: 60},
    {label: '90日', value: 90},
] as const;

export interface InactiveMember {
    userId: string;
    lastActivity: Date | null;
    joinedAt: Date | null;
}
