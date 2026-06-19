import type { Tone } from "../../types";

interface Props {
    value: Tone;
    onChange: (value: Tone) => void;
}


export function ToneSelector({ value, onChange }: Props) {
    return (
        <div style={{ marginBottom: "16px" }}>
            <label htmlFor="tone" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Select Comment Tone:</label>
            <select
                id="tone"
                value={value}
                onChange={(e) => onChange(e.target.value as Tone)}
                style={{ width: "100%", padding: "8px", fontSize: "16px" }}
            >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="insightful">Insightful</option>
                <option value="agree">Agree</option>
                <option value="challenge">Challenge</option>
                <option value="question">Question</option>
                <option value="humorous">Humorous</option>
            </select>
        </div>
    );
}