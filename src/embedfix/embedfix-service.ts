import {logger} from '../utils/logger.js';

const VIDEO_SIZE_LIMIT = 25 * 1024 * 1024; // 25 MB (Discord upload limit)

export async function downloadVideo(videoUrl: string): Promise<Buffer | null> {
    try {
        const res = await fetch(videoUrl);
        if (!res.ok) return null;

        const contentLength = res.headers.get('content-length');
        if (contentLength && Number(contentLength) > VIDEO_SIZE_LIMIT) {
            logger.warn('Video too large to attach', {size: contentLength, videoUrl});
            return null;
        }

        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.byteLength > VIDEO_SIZE_LIMIT) {
            logger.warn('Video too large to attach', {size: buf.byteLength, videoUrl});
            return null;
        }
        return buf;
    } catch (err) {
        logger.error('Failed to download video', err, {videoUrl});
        return null;
    }
}
