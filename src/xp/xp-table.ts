/**
 * Noctaly-compatible XP/leveling formulas.
 *
 * XP required for level N: 5N² + 20N + 100
 * Cumulative XP to reach level L: 5L(L+1)(2L+1)/6 + 10L(L+1) + 100L
 */

export const MAX_LEVEL = 100;

/** XP needed to complete a single level (level N → N+1). */
export function xpForLevel(level: number): number {
    return 5 * level * level + 20 * level + 100;
}

/** Total XP required to reach exactly `level` from 0. */
export function cumulativeXp(level: number): number {
    if (level <= 0) return 0;
    // 5L(L+1)(2L+1)/6 + 10L(L+1) + 100L
    return (
        (5 * level * (level + 1) * (2 * level + 1)) / 6 +
        10 * level * (level + 1) +
        100 * level
    );
}

/** Derive the current level from total XP. */
export function levelFromXp(totalXp: number): number {
    let level = 0;
    while (level < MAX_LEVEL && totalXp >= cumulativeXp(level + 1)) {
        level++;
    }
    return level;
}

/** Progress within the current level: { current, required, level }. */
export function levelProgress(totalXp: number): {
    level: number;
    currentXp: number;
    requiredXp: number;
} {
    const level = levelFromXp(totalXp);
    const base = cumulativeXp(level);
    const required = xpForLevel(level);
    return {
        level,
        currentXp: totalXp - base,
        requiredXp: required,
    };
}
