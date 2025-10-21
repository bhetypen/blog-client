// src/components/posts/PostCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { pickImage, excerptFrom } from "../../utils/posts";
import { useAuthStore } from "../../store/authStore";
import { usePostStore } from "../../store/postStore";
import { toast } from "react-toastify";

// get the image first
function extractFirstImageUrl(content = "") {
    // Markdown: ![alt](url "title")
    const md = content.match(/\!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
    if (md?.[1]) return md[1];

    // HTML: <img src="...">
    const html = content.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
    if (html?.[1]) return html[1];

    return null;
}

export default function PostCard({ post }) {
    const date =
        post?.createdAt
            ? new Date(post.createdAt)
            : post?.updatedAt
                ? new Date(post.updatedAt)
                : null;

    const { user } = useAuthStore();
    const { deletePost, deletingIds } = usePostStore();
    const navigate = useNavigate();

    const isOwner = user && post?.author?.id === user.id;
    const isAdmin = user?.isAdmin;
    const isDeleting = deletingIds?.has(post.id);

    // ✅ Prefer image from content; fallback to random pickImage
    const contentImg = extractFirstImageUrl(post?.content || "");
    const img = contentImg || pickImage(post);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;
        try {
            await deletePost(post.id);
            toast.success("Blog deleted successfully.");
        } catch (err) {
            toast.error(err.message || "Failed to delete blog.");
        }
    };

    return (
        <article className="row g-4 py-4 border-bottom">
            {/* Image */}
            <div className="col-12 col-md-6">
                <Link to={`/posts/${post.id}`} className="text-decoration-none">
                    <div className="ratio ratio-16x9 bg-light rounded overflow-hidden">
                        <img
                            src={img}
                            alt={post.title || "Post image"}
                            className="w-100 h-100 object-fit-cover"
                            loading="lazy"
                        />
                    </div>
                </Link>
            </div>

            {/* Content */}
            <div className="col-12 col-md-6 d-flex flex-column">
                <div className="small text-uppercase fw-semibold text-secondary mb-2">
                    Insights
                    <span className="ms-2 text-muted">•</span>
                    <span className="ms-2 text-muted">
            {date ? date.toLocaleDateString() : "—"}
          </span>
                    {post?.author?.username && (
                        <>
                            <span className="ms-2 text-muted">•</span>
                            <span className="ms-2 text-muted">By {post.author.username}</span>
                        </>
                    )}
                </div>

                <h2 className="h3">
                    <Link to={`/posts/${post.id}`} className="text-dark text-decoration-none">
                        {post?.title ?? "Untitled"}
                    </Link>
                </h2>

                <p className="text-muted mb-4">{excerptFrom(post?.content)}</p>

                <div className="mt-auto d-flex gap-2">
                    <Link to={`/posts/${post.id}`} className="btn btn-black">
                        Read Article
                    </Link>

                    {/* Owner controls */}
                    {isOwner && (
                        <>
                            <button
                                className="btn btn-outline-dark"
                                onClick={() => navigate(`/edit-post/${post.id}`)}
                            >
                                Update Blog
                            </button>
                            <button
                                className="btn btn-outline-danger"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting…" : "Delete"}
                            </button>
                        </>
                    )}

                    {/* Admin controls (delete only) */}
                    {!isOwner && isAdmin && (
                        <button
                            className="btn btn-outline-danger"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
