// src/pages/BlogPostPage.jsx
import React, {useEffect, useMemo, useState} from "react";
import {useParams, Link} from "react-router-dom";
import {usePostStore} from "../../store/postStore";
import {useAuthStore} from "../../store/authStore";
import {pickImage} from "../../utils/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CommentsSection from "../../components/comments/CommentsSection"; // ⬅️ NEW

function isAdminUser(user) {
    if (!user) return false;
    if (typeof user.isAdmin === "boolean") return user.isAdmin;
    if (typeof user.role === "string") return user.role.toLowerCase() === "admin";
    return false;
}

const getAuthorName = (post) => post?.author?.username ?? null;

export default function BlogPostPage() {
    const {id} = useParams();
    const {currentPost, itemLoading, fetchPostById} = usePostStore();
    const {user, token} = useAuthStore();
    const [error, setError] = useState(null);

    const isLoggedIn = !!token;
    const isAdmin = isAdminUser(user);
    const backLink = isLoggedIn ? (isAdmin ? "/admin-dashboard" +
        "" : "/user-dashboard") : "/blogpost";

    useEffect(() => {
        if (!id) return;
        setError(null);
        fetchPostById(id).catch((err) => setError(err?.message ?? "Failed to load post"));
    }, [id, fetchPostById]);

    const markdownHasImage = useMemo(() => {
        const md = currentPost?.content || "";
        const mdImage = /\!\[[^\]]*?\]\((.+?)\)/.test(md);
        const htmlImage = /<img\s+[^>]*src=["'][^"']+["'][^>]*>/i.test(md);
        return mdImage || htmlImage;
    }, [currentPost?.content]);

    const img = !markdownHasImage ? pickImage(currentPost) : null;

    const date = currentPost?.createdAt
        ? new Date(currentPost.createdAt)
        : currentPost?.updatedAt
            ? new Date(currentPost.updatedAt)
            : null;

    const authorName = getAuthorName(currentPost);

    if (itemLoading) {
        return <div className="container py-5 text-center text-muted">Loading post…</div>;
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <p className="text-danger">{error}</p>
                <Link to={backLink} className="btn btn-sm btn-outline-secondary mt-3">← Back</Link>
            </div>
        );
    }

    if (!currentPost) {
        return (
            <div className="container py-5 text-center">
                <p className="text-muted">Post not found.</p>
                <Link to={backLink} className="btn btn-sm btn-outline-secondary mt-3">← Back</Link>
            </div>
        );
    }

    return (
        <div className="container py-5 ">
            <div className="mx-auto col-12 col-lg-10 col-xl-10 mx-auto">
                <Link to={backLink} className="btn btn-sm btn-outline-secondary mb-4">← Back</Link>

                <article className="blog-post">
                    <h1 className="display-5 mb-3">{currentPost.title}</h1>

                    {(authorName || date) && (
                        <div className="text-muted mb-3">
                            {authorName && <span>By {authorName}</span>}
                            {authorName && date && <span className="mx-2">•</span>}
                            {date && (
                                <span>
                  {date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </span>
                            )}
                        </div>
                    )}

                    {img && (
                        <div className="ratio ratio-16x9 mb-4 bg-light rounded overflow-hidden">
                            <img src={img} alt={currentPost.title} className="w-100 h-100 object-fit-cover" />
                        </div>
                    )}

                    <div className="post-content fs-5 mb-5">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                img: ({node, ...props}) => (
                                    <img
                                        {...props}
                                        className="img-fluid rounded my-3"
                                        style={{ maxWidth: "100%", height: "auto", display: "flex", alignSelf: "center" }}
                                        alt={props.alt || "Blog image"}
                                    />
                                ),
                                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                                h1: ({node, ...props}) => <h1 className="mt-4 mb-3" {...props} />,
                                h2: ({node, ...props}) => <h2 className="mt-4 mb-3" {...props} />,
                                h3: ({node, ...props}) => <h3 className="mt-3 mb-2" {...props} />,
                            }}
                        >
                            {currentPost.content || ""}
                        </ReactMarkdown>
                    </div>

                    {/* Comments */}
                    <CommentsSection post={currentPost} />
                </article>
            </div>
        </div>
    );
}
