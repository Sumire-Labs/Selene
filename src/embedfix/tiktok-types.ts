export interface TikWmResponse {
    code: number;
    msg: string;
    data?: TikWmData;
}

export interface TikWmData {
    title: string;
    play: string;
    cover: string;
    author: TikWmAuthor;
    play_count: number;
    digg_count: number;
    comment_count: number;
    share_count: number;
}

export interface TikWmAuthor {
    unique_id: string;
    nickname: string;
    avatar: string;
}
