interface Props {
    loading: boolean;
    onClick: () => void;
}

export function GenerateButton({ loading, onClick }: Props) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                backgroundColor: loading ? "#ccc" : "#0073b1",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer"
            }}
        >
            {loading ? "Generating..." : "Generate Comment"}
        </button>
    );
}