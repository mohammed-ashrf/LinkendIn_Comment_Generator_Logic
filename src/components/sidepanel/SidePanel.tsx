import { useEffect, useRef, useState } from "react";
import { generateComment } from "../../services/openrouter";
import type { Tone } from "../../types";
import { ToneSelector } from "./ToneSelector";
import { GenerateButton } from "./GenerateButton";
import { GeneratedComment } from "./GeneratedComment";

interface SidePanelPost {
    commentBoxId: string;
    authorName: string | null;
    postText: string | null;
}

export function SidePanel() {
    const [selectedPost, setSelectedPost] = useState<SidePanelPost | null>(null);
    const [comment, setComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [tone, setTone] = useState<Tone>("professional");
    const prevBoxIdRef = useRef<string | null>(null);

    useEffect(() => {
        const listener = (message: { type: string; payload: SidePanelPost }) => {
            if (message.type === "POST_SELECTED") {
                setSelectedPost(message.payload);
                if (message.payload.commentBoxId !== prevBoxIdRef.current) {
                    setComment("");
                }
                prevBoxIdRef.current = message.payload.commentBoxId;
            }
            return undefined;
        };

        chrome.runtime.onMessage.addListener(listener);

        return () => {
            chrome.runtime.onMessage.removeListener(listener);
        };
    }, []);

    async function handleGenerate() {
        if (!selectedPost) return;
        setLoading(true);
        setComment("");
        const result = await generateComment(
            { author: selectedPost.authorName ?? "Unknown", content: selectedPost.postText ?? "" },
            tone
        );
        setComment(result);
        setLoading(false);
    }

    function handleInsert() {
        if (!selectedPost) return;
        chrome.runtime.sendMessage({
            type: "INSERT_COMMENT",
            commentBoxId: selectedPost.commentBoxId,
            comment
        }).catch(() => {});
    }

    return (
        <div style={{padding: "16px", fontFamily: "Arial, sans-serif"}}>
            <h1 style={{fontSize: "24px", marginBottom: "16px"}}>LinkedIn AI Assistant</h1>
            {selectedPost ? (
                <>
                    <p style={{fontSize: "14px", marginBottom: "4px"}}><strong>Post by:</strong> {selectedPost.authorName ?? "Unknown"}</p>
                    <p style={{fontSize: "14px", marginBottom: "16px", color: "#555"}}>{selectedPost.postText?.slice(0, 200)}</p>
                    <ToneSelector value={tone} onChange={setTone} />
                    <p style={{fontSize: "12px", marginBottom: "12px", color: "#777"}}>Selected tone: <strong>{tone}</strong></p>
                    <GenerateButton loading={loading} onClick={handleGenerate} />
                    {comment && <GeneratedComment comment={comment} onInsert={handleInsert} />}
                </>
            ) : (
                <p style={{fontSize: "16px", marginBottom: "8px"}}>Click on a LinkedIn comment box to get started.</p>
            )}
        </div>
    )
}