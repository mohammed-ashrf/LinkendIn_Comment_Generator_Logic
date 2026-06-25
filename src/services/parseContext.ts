import type { ReplyTo } from "../types";

function extractAuthor(html: string): string | null {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const allEls = doc.querySelectorAll('*');
  let foundAnchor = false;
  let lastAuthorLabel = '';

  for (const el of allEls) {
    const t = el.textContent?.trim();
    if (!foundAnchor && (t === 'Most relevant' || t === 'Most recent')) {
      foundAnchor = true;
    }
    if (foundAnchor) continue;

    const label = el.getAttribute('aria-label') || '';
    if (/View\s+.+?(?:'|\u2019)s\s+profile/i.test(label)) {
      lastAuthorLabel = label;
    }
  }

  if (lastAuthorLabel) {
    const match = lastAuthorLabel.match(/View\s+(.+?)(?:'|\u2019)s\s+profile/i);
    if (match) {
      return match[1]
        .replace(/,?\s*Open to work/i, '')
        .replace(/\s+(Verified|Premium)$/i, '')
        .trim();
    }
  }
  return null;
}


function extractPostContent(html: string): string | null {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, svg, button').forEach(el => el.remove());

  const allEls = doc.querySelectorAll('*');
  let lastSortAnchor: Element | null = null;
  for (const el of allEls) {
    const t = el.textContent?.trim();
    if (t === 'Most relevant' || t === 'Most recent') {
      lastSortAnchor = el;
    }
  }

  let target: Element | null = null;
  const textBoxes = doc.querySelectorAll('[data-testid="expandable-text-box"]');
  for (const box of textBoxes) {
    if (lastSortAnchor) {
      if (box.compareDocumentPosition(lastSortAnchor) & Node.DOCUMENT_POSITION_FOLLOWING) {
        target = box;
      }
    } else {
      target = box;
    }
  }

  if (target) return (target.textContent || '').replace(/… more/gi, '').trim();

  // Fallback: text-based extraction
  const text = doc.body.textContent || '';
  const idx = text.search(/\n?(?:Most relevant|Most recent)\b.*/i);
  if (idx >= 0) return text.slice(0, idx).replace(/Follow/g, '').replace(/\n?… more\b.*/gi, '').trim();
  return null;
}


function extractReplyTo(editorHtml: string, containerText: string): ReplyTo | null {
  const doc = new DOMParser().parseFromString(editorHtml, "text/html");
  const strong = doc.querySelector('span[data-type="mention"] strong');
  if (!strong) return null;
  const name = strong.textContent?.trim() || '';
  if (!name) return null;
  const lines = containerText.split('\n').map(l => l.trim()).filter(Boolean);
  const replyIndex = lines.findIndex(l => l.includes(name));
  let comment = '';
  if (replyIndex >= 0) {
    comment = lines.slice(Math.max(0, replyIndex - 1), replyIndex + 2).join(' ').slice(0, 500);
  }
  return {
    name,
    comment
  };
}

export function parseContext(data: Record<string, unknown>): { author: string; content: string; replyTo: ReplyTo | null } | null {
  const html = (data.containerHtml as string) ?? "";
  const text = (data.containerText as string) ?? "";
  const editorHtml = (data.editorHtml as string) ?? "";

  if (!html && !text) return null;

  const author = extractAuthor(html) || "Unknown";
  let content = extractPostContent(html);
  if (!content && text) {
    const idx = text.search(/\n?Most relevant\b.*/i);
    const raw = idx >= 0 ? text.slice(0, idx) : text;
    content = raw.replace(/Follow/g, '').replace(/\n?… more\b.*/gi, '').trim() || null;
  }

  const replyTo = extractReplyTo(editorHtml, text);

  return {
    author: author ?? "Unknown",
    content: content ?? "Could not detect post content",
    replyTo
  };
}
