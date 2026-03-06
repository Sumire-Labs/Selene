export interface RedditListingResponse {
    data: {
        children: RedditListingChild[];
    };
}

export interface RedditListingChild {
    data: RedditPostData;
}

export interface RedditPostData {
    subreddit: string;
    title: string;
    selftext: string;
    author: string;
    score: number;
    upvote_ratio: number;
    num_comments: number;
    over_18: boolean;
    url: string;
    permalink: string;
    is_video: boolean;
    preview?: {
        images: RedditPreviewImage[];
    };
}

export interface RedditPreviewImage {
    source: {
        url: string;
        width: number;
        height: number;
    };
}
