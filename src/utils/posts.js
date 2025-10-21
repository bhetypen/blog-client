// src/utils/posts.js

/* ---------------- image helpers ---------------- */

// Extract first Markdown image: ![alt](url "title")
function firstMarkdownImage(md = "") {
    const re = /!\[[^\]]*]\((?<url>[^)\s]+)(?:\s+"[^"]*")?\)/i;
    const m = md.match(re);
    return m?.groups?.url || null;
}

// Extract first HTML <img src="...">
function firstHtmlImage(md = "") {
    const re = /<img\s+[^>]*src=(["'])(?<url>[^"'>\s]+)\1[^>]*>/i;
    const m = md.match(re);
    return m?.groups?.url || null;
}

// (Optional) basic normalization — keep simple to avoid SSR/window issues
function normalizeUrl(u) {
    if (!u || typeof u !== "string") return null;
    // If it's protocol-relative or relative path, just return as-is.
    // If it's http, you could upgrade to https if you want:
    // if (u.startsWith("http://")) return "https://" + u.slice(7);
    return u;
}

/**
 * Prefer an image embedded INSIDE the post content (Markdown or HTML).
 * If `post.image` exists, it wins. Otherwise try content. If none, use a
 * deterministic fallback from the pool.
 */
export function pickImage(post) {
    // 0) Explicit image field wins
    if (post?.image && typeof post.image === "string") {
        const normalized = normalizeUrl(post.image);
        if (normalized) return normalized;
    }

    // 1) Try Markdown image inside content
    if (typeof post?.content === "string") {
        const mdUrl = firstMarkdownImage(post.content);
        if (mdUrl) {
            const normalized = normalizeUrl(mdUrl);
            if (normalized) return normalized;
        }

        // 2) Try HTML <img> inside content
        const htmlUrl = firstHtmlImage(post.content);
        if (htmlUrl) {
            const normalized = normalizeUrl(htmlUrl);
            if (normalized) return normalized;
        }
    }

    // 3) Deterministic fallback
    const fallbacks = [
        "/images/ourspace1.png",
        "/images/ourspace2.png",
        "/images/ourspace3.png",
        "/images/ourspace4.png",
        "/images/ourspace5.png",
    ];
    const key = String(post?.id ?? post?.title ?? Math.random());
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return fallbacks[hash % fallbacks.length];
}

/* ---------------- text helpers ---------------- */

// Strip common Markdown tokens (before HTML stripping)
function stripMarkdown(md = "") {
    return String(md)
        // remove images ![alt](url)
        .replace(/!\[[^\]]*]\([^)]*\)/g, "")
        // remove links [text](url)
        .replace(/\[[^\]]*]\([^)]*\)/g, "$1")
        // inline code `code`
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        // bold/italic ***text***, **text**, *text*, _text_
        .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
        // headings #### title
        .replace(/^\s{0,3}#{1,6}\s+/gm, "")
        // blockquote >
        .replace(/^\s{0,3}>\s?/gm, "")
        // lists -, *, +
        .replace(/^\s*[-*+]\s+/gm, "")
        // numbered lists 1.
        .replace(/^\s*\d+\.\s+/gm, "")
        // horizontal rules
        .replace(/^\s*([-*_]){3,}\s*$/gm, "");
}

export function stripHtml(html = "") {
    const mdStripped = stripMarkdown(html);
    const noScripts = mdStripped.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
    const noStyles = noScripts.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
    const text = noStyles.replace(/<\/?[^>]+(>|$)/g, " ");
    return text.replace(/\s+/g, " ").trim();
}

export function excerptFrom(content = "", max = 160) {
    const text = stripHtml(content);
    return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…";
}
