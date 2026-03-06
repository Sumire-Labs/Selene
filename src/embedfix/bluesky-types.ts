export interface BskyResolveHandleResponse {
    did: string;
}

export interface BskyPostThreadResponse {
    thread: {
        post: BskyPost;
    };
}

export interface BskyPost {
    uri: string;
    author: BskyAuthor;
    record: BskyRecord;
    embed?: BskyEmbed;
    likeCount: number;
    repostCount: number;
    replyCount: number;
}

export interface BskyAuthor {
    handle: string;
    displayName?: string;
    avatar?: string;
}

export interface BskyRecord {
    text: string;
    createdAt: string;
}

export interface BskyEmbed {
    $type: string;
    images?: BskyImage[];
}

export interface BskyImage {
    thumb: string;
    fullsize: string;
    alt: string;
}
