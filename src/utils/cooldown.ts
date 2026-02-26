const cooldowns = new Map<string, number>();

export function isOnCooldown(key: string): boolean {
    const expiresAt = cooldowns.get(key);
    if (!expiresAt) return false;
    if (Date.now() >= expiresAt) {
        cooldowns.delete(key);
        return false;
    }
    return true;
}

export function getRemainingCooldown(key: string): number {
    const expiresAt = cooldowns.get(key);
    if (!expiresAt) return 0;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
        cooldowns.delete(key);
        return 0;
    }
    return remaining;
}

export function setCooldown(key: string, durationMs: number): void {
    cooldowns.set(key, Date.now() + durationMs);
}

export function buildCooldownKey(userId: string, command: string): string {
    return `${userId}:${command}`;
}

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

export function startCooldownCleanup(): void {
    setInterval(() => {
        const now = Date.now();
        for (const [key, expiresAt] of cooldowns) {
            if (expiresAt <= now) {
                cooldowns.delete(key);
            }
        }
    }, CLEANUP_INTERVAL_MS);
}
