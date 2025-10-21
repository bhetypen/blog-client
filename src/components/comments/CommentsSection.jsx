import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCommentStore } from "../../store/commentStore";

function isAdminUser(user) {
    if (!user) return false;
    if (typeof user.isAdmin === "boolean") return user.isAdmin;
    if (typeof user.role === "string") return user.role.toLowerCase() === "admin";
    return false;
}

import CommentItem from "./CommentItem";

export default function CommentsSection({ post }) {
    const {
        byPost,
        initFromPost,
        fetchComments,
        getComments,
        addComment,
        updateComment,
        deleteComment,
        replyToComment,
        updateReply,
        deleteReply,
        addingForPost,
        updatingCommentIds,
        deletingCommentIds,
        replyingCommentIds,
        updatingReplyIds,
        deletingReplyIds,
    } = useCommentStore();

    const { user, token } = useAuthStore();
    const isLoggedIn = !!token;
    const isAdmin = isAdminUser(user);
    const isPostAuthor = user && post?.author?.id === user.id;

    const [newText, setNewText] = useState("");

    // hydrate from post, then refresh from API
    useEffect(() => {
        if (!post?.id) return;
        initFromPost(post);
        fetchComments(post.id).catch(() => {});
    }, [post?.id]);

    const comments = getComments(post.id);
    const stateForPost = byPost[post.id] || { loading: false, error: null };

    const handleAdd = async (e) => {
        e.preventDefault();
        const t = newText.trim();
        if (!t) return;
        await addComment(post.id, t);
        setNewText("");
    };

    return (
        <section className="mt-5">
            <h3 className="h5 mb-3">Comments</h3>

            {/* Add comment (only logged-in, non-admin users) */}
            {!isLoggedIn && (
                <div className="alert alert-light border">
                    Please <Link to="/login">log in</Link> to post a comment.
                </div>
            )}
            {isLoggedIn && isAdmin && (
                <div className="alert alert-warning">
                    Admins cannot post or edit comments.
                </div>
            )}

            {isLoggedIn && !isAdmin && (
                <form onSubmit={handleAdd} className="mb-4">
                    <div className="mb-2">
            <textarea
                className="form-control"
                rows={3}
                placeholder="Write a comment…"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                disabled={addingForPost?.has(post.id)}
            />
                    </div>
                    <button
                        className="btn btn-black"
                        type="submit"
                        disabled={addingForPost?.has(post.id) || !newText.trim()}
                    >
                        {addingForPost?.has(post.id) ? "Posting…" : "Post Comment"}
                    </button>
                </form>
            )}

            {/* Status */}
            {stateForPost.loading && comments.length === 0 && (
                <div className="text-muted">Loading comments…</div>
            )}
            {stateForPost.error && (
                <div className="alert alert-danger">{stateForPost.error}</div>
            )}
            {comments.length === 0 && !stateForPost.loading && (
                <div className="text-muted">No comments yet.</div>
            )}

            {/* List */}
            <div className="d-flex flex-column gap-4">
                {comments.map((c) => (
                    <CommentItem
                        key={c.id}
                        postId={post.id}
                        comment={c}
                        user={user}
                        isAdmin={isAdmin}
                        isPostAuthor={isPostAuthor}
                        updateComment={updateComment}
                        deleteComment={deleteComment}
                        replyToComment={replyToComment}
                        updateReply={updateReply}
                        deleteReply={deleteReply}
                        updatingCommentIds={updatingCommentIds}
                        deletingCommentIds={deletingCommentIds}
                        replyingCommentIds={replyingCommentIds}
                        updatingReplyIds={updatingReplyIds}
                        deletingReplyIds={deletingReplyIds}
                    />
                ))}
            </div>
        </section>
    );
}
