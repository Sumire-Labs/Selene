export interface FxTweetResponse {
    code: number;
    message: string;
    tweet?: FxTweet;
}

export interface FxTweet {
    url: string;
    id: string;
    text: string;
    author: FxTweetAuthor;
    replies: number;
    retweets: number;
    likes: number;
    views: number;
    media?: FxTweetMedia;
}

export interface FxTweetAuthor {
    name: string;
    screen_name: string;
    avatar_url: string;
}

export interface FxTweetMedia {
    all: FxTweetMediaItem[];
    videos?: FxTweetMediaItem[];
}

export interface FxTweetMediaItem {
    type: 'video' | 'photo';
    url: string;
    thumbnail_url?: string;
    width: number;
    height: number;
}
