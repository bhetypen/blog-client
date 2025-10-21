import React, { useState } from "react";
import ReplyItem from "./ReplyItem";

export default function CommentItem({
                                        postId,
                                        comment,
                                        user,
                                        isAdmin,
                                        isPostAuthor,
                                        updateComment,
                                        deleteComment,
                                        replyToComment,
                                        updateReply,
                                        deleteReply,
                                        updatingCommentIds,
                                        deletingCommentIds,
                                        replyingCommentIds,
                                        updatingReplyIds,
                                        deletingReplyIds,
                                    }) {
    const isLoggedIn = !!user;
    const isOwner = user && String(comment.user) === user.id;

    // Backend rules:
    // - Edit comment: owner only, admins forbidden
    // - Delete comment: owner or admin
    // - Reply: only post author can reply
    const canEdit = isLoggedIn && !isAdmin && isOwner;
    const canDelete = (isLoggedIn && isOwner) || (isLoggedIn && isAdmin);
    const canReply = isLoggedIn && isPostAuthor;

    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState("");

    const updating = updatingCommentIds?.has(comment.id);
    const deleting = deletingCommentIds?.has(comment.id);
    const replying = replyingCommentIds?.has(comment.id);

    const onSave = async () => {
        const t = String(editText || "").trim();
        if (!t) return;
        await updateComment(postId, comment.id, t);
        setEditing(false);
    };

    const onReply = async () => {
        const t = String(replyText || "").trim();
        if (!t) return;
        await replyToComment(postId, comment.id, t);
        setReplyText("");
        setReplyOpen(false);
    };

    return (
        <div className="border rounded p-3">
            {/* Content / editor */}
            {!editing ? (
                <p className="mb-2">{comment.text}</p>
            ) : (
                <div className="mb-2">
          <textarea
              className="form-control mb-2"
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              disabled={updating}
          />
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-black"
                            onClick={onSave}
                            disabled={updating || !String(editText).trim()}
                        >
                            {updating ? "Saving…" : "Save"}
                        </button>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                                setEditing(false);
                                setEditText(comment.text);
                            }}
                            disabled={updating}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="small text-muted mb-2">
                {(comment.user && (comment.user.username || comment.user.email)) || "Anonymous"} •{" "}
                {new Date(comment.createdAt).toLocaleString()}
            </div>

            {/* Actions */}
            <div className="d-flex flex-wrap gap-2">
                {canReply && !editing && (
                    <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => setReplyOpen((v) => !v)}
                        disabled={replying}
                    >
                        Reply
                    </button>
                )}
                {canEdit && !editing && (
                    <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => setEditing(true)}
                        disabled={updating}
                    >
                        Edit
                    </button>
                )}
                {canDelete && (
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteComment(postId, comment.id)}
                        disabled={deleting}
                    >
                        {deleting ? "Deleting…" : "Delete"}
                    </button>
                )}
            </div>

            {/* Reply editor (post author only) */}
            {isPostAuthor && replyOpen && (
                <div className="mt-3">
          <textarea
              className="form-control mb-2"
              rows={2}
              placeholder="Write a reply…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={replying}
          />
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-black"
                            onClick={onReply}
                            disabled={replying || !String(replyText).trim()}
                        >
                            {replying ? "Replying…" : "Reply"}
                        </button>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                                setReplyText("");
                                setReplyOpen(false);
                            }}
                            disabled={replying}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Replies */}
            {(comment.replies || []).length > 0 && (
                <div className="mt-3 ps-3 border-start">
                    {(comment.replies || []).map((r) => (
                        <ReplyItem
                            key={r.id}
                            postId={postId}
                            commentId={comment.id}
                            reply={r}
                            user={user}
                            isAdmin={isAdmin}
                            isPostAuthor={isPostAuthor}
                            updateReply={updateReply}
                            deleteReply={deleteReply}
                            updatingReplyIds={updatingReplyIds}
                            deletingReplyIds={deletingReplyIds}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
