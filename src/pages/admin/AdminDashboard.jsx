import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { usePostStore } from "../../store/postStore";
import { useCommentStore } from "../../store/commentStore";

// Small helpers
const isAdminUser = (user) =>
    !!user && (user.isAdmin === true || String(user.role || "").toLowerCase() === "admin");

const fmtDate = (v) =>
    v ? new Date(v).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

// ---------------- CommentsPanel ----------------
function CommentsPanel({ post }) {
    const {
        byPost,
        fetchComments,
        deleteComment,
        deletingCommentIds,
    } = useCommentStore();

    const commentsState = byPost[post.id] || { items: [], loading: false, error: null };
    const comments = commentsState.items || [];
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            // fetch (or refresh) when panel opens
            fetchComments(post.id).catch(() => {});
        }
    }, [open, post.id]);

    return (
        <div className="mt-2">
            <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setOpen((v) => !v)}
            >
                {open ? "Hide Comments" : `Manage Comments (${post.commentsCount ?? comments.length ?? 0})`}
            </button>

            {open && (
                <div className="mt-3 border rounded p-3">
                    {commentsState.loading && comments.length === 0 && (
                        <div className="text-muted">Loading comments…</div>
                    )}
                    {commentsState.error && (
                        <div className="alert alert-danger py-2 mb-3">{commentsState.error}</div>
                    )}
                    {comments.length === 0 && !commentsState.loading && (
                        <div className="text-muted">No comments for this post.</div>
                    )}

                    <div className="d-flex flex-column gap-3">
                        {comments.map((c) => {
                            const deleting = deletingCommentIds?.has(c.id);
                            return (
                                <div key={c.id} className="border rounded p-2">
                                    <div className="d-flex justify-content-between align-items-start gap-3">
                                        <div>
                                            <div className="fw-semibold">
                                                {c.user?.username || c.user?.email || "Unknown user"}
                                            </div>
                                            <div className="small text-muted mb-2">{fmtDate(c.createdAt)}</div>
                                            <div>{c.text}</div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => deleteComment(post.id, c.id)}
                                                disabled={deleting}
                                                title="Delete comment"
                                            >
                                                {deleting ? "Deleting…" : "Delete"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Replies preview (read-only here) */}
                                    {(c.replies || []).length > 0 && (
                                        <div className="mt-2 ps-3 border-start">
                                            {(c.replies || []).map((r) => (
                                                <div key={r.id} className="mb-2">
                                                    <div className="small text-muted">
                                                        {(r.user?.username || r.user?.email || "Unknown")} • {fmtDate(r.createdAt)}
                                                    </div>
                                                    <div>{r.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------------- PostRow ----------------
function PostRow({ post, onDelete, deleting }) {
    const createdAt = post?.createdAt || post?.updatedAt;
    const commentsCount = typeof post.commentsCount === "number" ? post.commentsCount : (post.comments || []).length;

    return (
        <div className="border rounded p-3 mb-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="me-auto">
                    <div className="fw-semibold">{post.title || "Untitled"}</div>
                    <div className="small text-muted">
                        By {post.author?.username || post.author?.email || "Unknown"} • {fmtDate(createdAt)} • {commentsCount} comments
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                    <Link to={`/posts/${post.id}`} className="btn btn-sm btn-outline-secondary">
                        View
                    </Link>
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={onDelete}
                        disabled={deleting}
                        title="Delete post"
                    >
                        {deleting ? "Deleting…" : "Delete Post"}
                    </button>
                </div>
            </div>

            {/* Comments management */}
            <CommentsPanel post={post} />
        </div>
    );
}

// ---------------- AdminDashboard (page) ----------------
export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, token } = useAuthStore();
    const isAdmin = isAdminUser(user);

    const {
        posts,
        listLoading,
        fetchPosts,
        deletePost,
        deletingIds,
    } = usePostStore();

    // Guard: only admins
    useEffect(() => {
        if (!token || !isAdmin) {
            navigate("/login", { replace: true });
        }
    }, [token, isAdmin, navigate]);

    // Load posts
    useEffect(() => {
        fetchPosts().catch(() => {});
    }, [fetchPosts]);

    const deletingSet = deletingIds || new Set();

    // simple search/filter (optional)
    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return posts || [];
        return (posts || []).filter(
            (p) =>
                (p.title || "").toLowerCase().includes(t) ||
                (p.author?.username || "").toLowerCase().includes(t) ||
                (p.author?.email || "").toLowerCase().includes(t)
        );
    }, [q, posts]);

    return (
        <div className="container py-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 m-0">Admin Dashboard</h1>
                <div className="d-flex gap-2">
                    <Link to="/" className="btn btn-light">Home</Link>
                    <Link to="/blogpost" className="btn btn-light">Public Blog</Link>
                </div>
            </div>

            <div className="row g-3 align-items-center mb-3">
                <div className="col-12 col-md-6">
                    <input
                        className="form-control"
                        placeholder="Search by title or author…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
                <div className="col-auto">
                    <button className="btn btn-outline-secondary" onClick={() => fetchPosts()}>
                        Refresh
                    </button>
                </div>
            </div>

            {listLoading && posts.length === 0 && (
                <div className="text-muted py-5 text-center">Loading posts…</div>
            )}

            {!listLoading && filtered.length === 0 && (
                <div className="text-muted py-5 text-center">No posts found.</div>
            )}

            <div>
                {filtered.map((post) => (
                    <PostRow
                        key={post.id}
                        post={post}
                        deleting={deletingSet.has(post.id)}
                        onDelete={async () => {
                            if (!window.confirm("Delete this post? This will remove it for everyone.")) return;
                            try {
                                await deletePost(post.id);
                            } catch (e) {
                                alert(e?.message || "Failed to delete post.");
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
