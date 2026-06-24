import type { ReplyTo } from "../types";
  
export function parseContext(data: Record<string, unknown>): { author: string; content: string; replyTo: ReplyTo | null } | null {
  const html = (data.containerHtml as string) ?? "";
  const text = (data.containerText as string) ?? "";
  const editorHtml = (data.editorHtml as string) ?? "";

  if (!html && !text) return null;

  const textContent = text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const postText =
    textContent.split(/\n?Most relevant\n?/i)[0]
      ?.replace(/Follow/g, "")
      .replace(/\n?… more\n?/gi, "")
      ?.trim() ?? null;

  const allLabels = html.match(/aria-label\s*=\s*"([^"]*?)"/gi) ?? [];
  let author: string | null = null;
  for (const attr of allLabels) {
    const val = attr.replace(/^aria-label\s*=\s*"/i, "").replace(/"\s*$/i, "");
    if (/\s+Profile\s+/i.test(val)) {
      author = val.replace(/ , Open to work/, "").split(/\s+Profile\s+/i)[0].replace(/ (Verified|Premium)$/, "").trim();
      break;
    }
  }

  let replyTo: ReplyTo | null = null;
  const mentionMatch = editorHtml.match(/<span[^>]*data-type\s*=\s*"mention"[^>]*>[\s\S]*?<strong>([^<]+)<\/strong>/i);

  if (mentionMatch) {
    replyTo = {
      name: mentionMatch[1].trim(),
      comment: ""
    };
    const lines = textContent.split('\n').map(l => l.trim()).filter(Boolean);
    const replyIndex = lines.findIndex(l => l.includes(replyTo!.name));
    if (replyIndex >= 0) {
      replyTo.comment = lines.slice(Math.max(0, replyIndex - 1), replyIndex + 2).join(' ').slice(0, 500);
    }
  }
  return {
    author: author ?? "Unknown",
    content: postText ?? "Could not detect post content",
    replyTo
  };
}
