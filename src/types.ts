export interface ReplyTo {
    name: string;
    comment: string;
}
export interface LinkedInPost {
    author: string;
    content: string;
    replyTo: ReplyTo | null;
}

export type Tone = "professional" | "friendly" | "insightful" | "question" | "challenge" | "humorous" | "agree";