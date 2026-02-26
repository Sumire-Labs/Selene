const BAR_LENGTH = 16;
const FILLED = '━';
const EMPTY = '─';
const THUMB = '●';

export function buildProgressBar(position: number, total: number): string {
    if (total <= 0) return EMPTY.repeat(BAR_LENGTH);
    const ratio = Math.min(position / total, 1);
    const filled = Math.round(ratio * (BAR_LENGTH - 1));
    return FILLED.repeat(filled) + THUMB + EMPTY.repeat(BAR_LENGTH - 1 - filled);
}
