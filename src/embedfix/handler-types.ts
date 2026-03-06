import type {Message} from 'discord.js';

export interface UrlMatch {
    originalUrl: string;
    groups: Record<string, string>;
}

export interface PlatformHandler {
    name: string;
    match(content: string): UrlMatch | null;
    handle(message: Message, match: UrlMatch): Promise<void>;
}
