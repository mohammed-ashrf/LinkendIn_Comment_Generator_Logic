interface Props {
    comment: string;
    onInsert: () => void;
}


export function GeneratedComment({ comment, onInsert }: Props) {
    return (
        <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>Generated Comment:</h2>
            <p style={{ fontSize: "16px", whiteSpace: "pre-wrap" }}>{comment}</p>
            <button
                style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    backgroundColor: "#0073b1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
                onClick={onInsert}
            >
                Insert Comment
            </button>
        </div>
    );
}