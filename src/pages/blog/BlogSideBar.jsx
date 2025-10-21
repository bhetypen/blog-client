// src/components/blog/BlogSidebar.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

export default function BlogSidebar({ posts }) {
    const recent = useMemo(() => {
        return [...(posts || [])]
            .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
            .slice(0, 5);
    }, [posts]);

    const discussed = useMemo(() => {
        return [...(posts || [])]
            .sort((a, b) => (b.commentsCount ?? 0) - (a.commentsCount ?? 0))
            .slice(0, 5);
    }, [posts]);

    const topAuthors = useMemo(() => {
        const map = new Map();
        (posts || []).forEach((p) => {
            const key = p.author?.id || p.author?.username || "unknown";
            const label = p.author?.username || p.author?.email || "Unknown";
            const count = map.get(key)?.count || 0;
            map.set(key, { label, count: count + 1 });
        });
        return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5);
    }, [posts]);

    return (
        <aside className="col-lg-4 mt-5 mt-lg-0">
            <div className="sticky-top" style={{ top: "5rem" }}>
                {/* About / CTA */}
                <div className="border rounded p-3 mb-4">
                    <div className="fw-semibold mb-2">About this blog</div>
                    <p className="text-muted mb-0">
                        Stories, guides, and notes from our community. Explore what’s new and what people are discussing.
                    </p>
                </div>

                {/* Recent posts */}
                <div className="border rounded p-3 mb-4">
                    <div className="small fw-semibold text-uppercase text-muted mb-2">Recent posts</div>
                    <ul className="list-unstyled mb-0">
                        {recent.map((p) => (
                            <li key={p.id} className="mb-2">
                                <Link to={`/posts/${p.id}`} className="text-decoration-none">
                                    {p.title || "Untitled"}
                                </Link>
                                <div className="small text-muted">
                                    {new Date(p.createdAt || p.updatedAt).toLocaleDateString()}
                                </div>
                            </li>
                        ))}
                        {recent.length === 0 && <li className="text-muted">No posts yet.</li>}
                    </ul>
                </div>

                {/* Most discussed */}
                <div className="border rounded p-3 mb-4">
                    <div className="small fw-semibold text-uppercase text-muted mb-2">Most discussed</div>
                    <ul className="list-unstyled mb-0">
                        {discussed.map((p) => (
                            <li key={p.id} className="mb-2">
                                <Link to={`/posts/${p.id}`} className="text-decoration-none">
                                    {p.title || "Untitled"}
                                </Link>
                                <div className="small text-muted">
                                    {(p.commentsCount ?? 0)} comment{(p.commentsCount ?? 0) === 1 ? "" : "s"}
                                </div>
                            </li>
                        ))}
                        {discussed.length === 0 && <li className="text-muted">No comments yet.</li>}
                    </ul>
                </div>

                {/* Top authors */}
                <div className="border rounded p-3">
                    <div className="small fw-semibold text-uppercase text-muted mb-2">Top authors</div>
                    <ul className="list-unstyled mb-0">
                        {topAuthors.map((a, i) => (
                            <li key={i} className="d-flex justify-content-between mb-1">
                                <span>{a.label}</span>
                                <span className="text-muted">{a.count}</span>
                            </li>
                        ))}
                        {topAuthors.length === 0 && <li className="text-muted">No authors yet.</li>}
                    </ul>
                </div>
            </div>
        </aside>
    );
}
