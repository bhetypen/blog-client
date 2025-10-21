import React from "react";

export default function ReplyItem({
                                      postId,
                                      commentId,
                                      reply,
                                      user,
                                      isAdmin,
                                      isPostAuthor,
                                      updateReply,
                                      deleteReply,
                                      updatingReplyIds,
                                      deletingReplyIds,
                                  }) {
    const isLoggedIn = !!user;
    const isReplyOwner = user && String(reply.user) === user.id;

    // Backend rules:
    // - Edit reply: only post author AND the reply must be theirs
    // - Delete reply: reply owner (post author) OR admin
    const canEditReply = isLoggedIn && isPostAuthor && isReplyOwner;
    const canDeleteReply = (isLoggedIn && isPostAuthor && isReplyOwner) || (isLoggedIn && isAdmin);

    const updatingR = updatingReplyIds?.has(reply.id);
    const deletingR = deletingReplyIds?.has(reply.id);

    const onEdit = async () => {
        const next = prompt("Edit reply:", reply.text);
        if (next == null) return;
        const t = String(next).trim();
        if (!t) return;
        await updateReply(postId, commentId, reply.id, t);
    };

    return (
        <div className="mb-3">
            <div className="d-flex justify-content-between">
                <div>
                    <div className="small text-muted">
                        {(reply.user && (reply.user.username || reply.user.email)) || "Anonymous"} •{" "}
                        {new Date(reply.createdAt).toLocaleString()}
                    </div>
                    <div>{reply.text}</div>
                </div>
                <div className="d-flex gap-2">
                    {canEditReply && (
                        <button
                            className="btn btn-sm btn-outline-dark"
                            onClick={onEdit}
                            disabled={updatingR}
                        >
                            {updatingR ? "Saving…" : "Edit"}
                        </button>
                    )}
                    {canDeleteReply && (
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteReply(postId, commentId, reply.id)}
                            disabled={deletingR}
                        >
                            {deletingR ? "Deleting…" : "Delete"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
