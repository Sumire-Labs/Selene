export type LoopMode = 'none' | 'track' | 'queue';

export type PlayerViewMode = 'compact' | 'full';

export interface TrackInfo {
    title: string;
    author: string | undefined;
    length: number | undefined;
    uri: string | undefined;
    thumbnail: string | undefined;
    isStream: boolean;
    requester: string | undefined; // userId extracted from requester object
}

export interface PlayerDisplayState {
    track: TrackInfo;
    position: number;
    isPaused: boolean;
    loopMode: LoopMode;
    volume: number;
    queue: TrackInfo[];
    guildId: string;
}
