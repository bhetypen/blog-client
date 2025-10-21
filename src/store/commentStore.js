import { create } from "zustand";
import { api } from "../lib/api";
import { usePostStore } from "./postStore";

/**
 * Comment shape (from your controller):
 * {
 *   id, user, text, createdAt, updatedAt,
 *   replies?: [{ id, user, text, createdAt, updatedAt }]
 * }
 *
 * We store comments per-post:
 * byPost[postId] = { items: Comment[], loading, error }
 */

export const useCommentStore = create((set, get) => ({
    byPost: {},                          // { [postId]: { items, loading, error } }
    addingForPost: new Set(),            // postIds being commented on
    updatingCommentIds: new Set(),       // commentIds being updated
    deletingCommentIds: new Set(),       // commentIds being deleted
    replyingCommentIds: new Set(),       // commentIds receiving a new reply
    updatingReplyIds: new Set(),         // replyIds being updated
    deletingReplyIds: new Set(),         // replyIds being deleted

    /** Initialize comments for a post using an already-fetched post (if it contains comments) */
    initFromPost: (post) => {
        if (!post?.id) return;
        // If your /posts/getPost/:id returns post.comments, prefer that
        const items = Array.isArray(post.comments) ? post.comments : [];
        set((state) => ({
            byPost: {
                ...state.byPost,
                [post.id]: { items, loading: false, error: null },
            },
        }));
    },

    /** Safely read comments for a post */
    getComments: (postId) => get().byPost[postId]?.items || [],

    /** Fetch (or refresh) comments for a post by reloading the post payload */
    fetchComments: async (postId) => {
        set((state) => ({
            byPost: {
                ...state.byPost,
                [postId]: { ...(state.byPost[postId] || {}), loading: true, error: null },
            },
        }));

        try {
            const { data } = await api.get(`/posts/getPost/${postId}`);
            const post = data?.post || null;
            const items = Array.isArray(post?.comments) ? post.comments : [];
            set((state) => ({
                byPost: {
                    ...state.byPost,
                    [postId]: { items, loading: false, error: null },
                },
            }));
            // Also keep postStore.currentPost in sync if it’s the same one
            const { currentPost } = usePostStore.getState();
            if (currentPost?.id === postId && post) {
                usePostStore.setState({ currentPost: { ...post } });
            }
            return items;
        } catch (err) {
            set((state) => ({
                byPost: {
                    ...state.byPost,
                    [postId]: { ...(state.byPost[postId] || {}), loading: false, error: err.message || "Failed to load comments" },
                },
            }));
            throw err;
        }
    },

    /** Add comment (admins forbidden server-side) */
    addComment: async (postId, text) => {
        const trimmed = String(text || "").trim();
        if (!trimmed) throw new Error("Comment text is required");

        // optimistic: add a temp comment
        const tempId = `temp-${Date.now()}`;
        const optimistic = {
            id: tempId,
            user: "me",        // optional placeholder; UI can swap to current user if needed
            text: trimmed,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            replies: [],
            __optimistic: true,
        };

        // mark adding for post
        const adding = new Set(get().addingForPost);
        adding.add(postId);

        // push optimistic item
        set((state) => {
            const prev = state.byPost[postId]?.items || [];
            return {
                addingForPost: adding,
                byPost: {
                    ...state.byPost,
                    [postId]: { items: [optimistic, ...prev], loading: false, error: null },
                },
            };
        });

        // bump commentsCount in postStore (optimistic)
        const ps = usePostStore.getState();
        const prevPosts = ps.posts;
        const prevMyPosts = ps.myPosts;
        const incCount = (post) =>
            post && typeof post.commentsCount === "number"
                ? { ...post, commentsCount: Math.max(0, post.commentsCount + 1) }
                : post;

        usePostStore.setState({
            posts: prevPosts.map((p) => (p.id === postId ? incCount(p) : p)),
            myPosts: prevMyPosts.map((p) => (p.id === postId ? incCount(p) : p)),
            currentPost:
                ps.currentPost?.id === postId ? incCount(ps.currentPost) : ps.currentPost,
        });

        try {
            const { data } = await api.post(`/comments/addComment/${postId}`, { text: trimmed });
            const saved = data?.comment;

            // replace optimistic with saved
            set((state) => {
                const list = state.byPost[postId]?.items || [];
                const next = list.map((c) => (c.id === tempId ? saved : c));
                return {
                    byPost: { ...state.byPost, [postId]: { items: next, loading: false, error: null } },
                };
            });

            return saved;
        } catch (err) {
            // revert optimistic insert + revert count
            set((state) => {
                const list = state.byPost[postId]?.items || [];
                const next = list.filter((c) => c.id !== tempId);
                return {
                    byPost: { ...state.byPost, [postId]: { items: next, loading: false, error: err.message || "Failed to add comment" } },
                };
            });

            // revert commentsCount
            const ps2 = usePostStore.getState();
            const decCount = (post) =>
                post && typeof post.commentsCount === "number"
                    ? { ...post, commentsCount: Math.max(0, post.commentsCount - 1) }
                    : post;

            usePostStore.setState({
                posts: ps2.posts.map((p) => (p.id === postId ? decCount(p) : p)),
                myPosts: ps2.myPosts.map((p) => (p.id === postId ? decCount(p) : p)),
                currentPost:
                    ps2.currentPost?.id === postId ? decCount(ps2.currentPost) : ps2.currentPost,
            });

            throw err;
        } finally {
            const done = new Set(get().addingForPost);
            done.delete(postId);
            set({ addingForPost: done });
        }
    },

    /** Update comment (owner only; admins forbidden server-side) */
    updateComment: async (postId, commentId, text) => {
        const trimmed = String(text || "").trim();
        if (!trimmed) throw new Error("Comment text is required");

        // optimistic update
        const updating = new Set(get().updatingCommentIds);
        updating.add(commentId);

        set((state) => {
            const list = state.byPost[postId]?.items || [];
            const next = list.map((c) => (c.id === commentId ? { ...c, text: trimmed } : c));
            return {
                updatingCommentIds: updating,
                byPost: { ...state.byPost, [postId]: { items: next, loading: false, error: null } },
            };
        });

        try {
            const { data } = await api.patch(`/comments/updateComment/${postId}/${commentId}`, { text: trimmed });
            const updated = data?.comment || null;

            // ensure we use server copy
            if (updated) {
                set((state) => {
                    const list = state.byPost[postId]?.items || [];
                    const next = list.map((c) => (c.id === commentId ? updated : c));
                    return { byPost: { ...state.byPost, [postId]: { items: next, loading: false, error: null } } };
                });
            }
            return updated;
        } catch (err) {
            // refetch to restore correct state (simple approach)
            await get().fetchComments(postId).catch(() => {});
            throw err;
        } finally {
            const done = new Set(get().updatingCommentIds);
            done.delete(commentId);
            set({ updatingCommentIds: done });
        }
    },

    /** Delete comment (owner or admin) */
    deleteComment: async (postId, commentId) => {
        const deleting = new Set(get().deletingCommentIds);
        deleting.add(commentId);

        // optimistic remove
        const prev = get().byPost[postId]?.items || [];
        set((state) => ({
            deletingCommentIds: deleting,
            byPost: {
                ...state.byPost,
                [postId]: { items: prev.filter((c) => c.id !== commentId), loading: false, error: null },
            },
        }));

        // decrement count optimistically
        const ps = usePostStore.getState();
        const decCount = (post) =>
            post && typeof post.commentsCount === "number"
                ? { ...post, commentsCount: Math.max(0, post.commentsCount - 1) }
                : post;

        usePostStore.setState({
            posts: ps.posts.map((p) => (p.id === postId ? decCount(p) : p)),
            myPosts: ps.myPosts.map((p) => (p.id === postId ? decCount(p) : p)),
            currentPost:
                ps.currentPost?.id === postId ? decCount(ps.currentPost) : ps.currentPost,
        });

        try {
            await api.delete(`/comments/deleteComment/${postId}/${commentId}`);
            return true;
        } catch (err) {
            // revert list + count
            set((state) => ({
                byPost: {
                    ...state.byPost,
                    [postId]: { items: prev, loading: false, error: err.message || "Failed to delete comment" },
                },
            }));

            const ps2 = usePostStore.getState();
            const incCount = (post) =>
                post && typeof post.commentsCount === "number"
                    ? { ...post, commentsCount: Math.max(0, post.commentsCount + 1) }
                    : post;

            usePostStore.setState({
                posts: ps2.posts.map((p) => (p.id === postId ? incCount(p) : p)),
                myPosts: ps2.myPosts.map((p) => (p.id === postId ? incCount(p) : p)),
                currentPost:
                    ps2.currentPost?.id === postId ? incCount(ps2.currentPost) : ps2.currentPost,
            });

            throw err;
        } finally {
            const done = new Set(get().deletingCommentIds);
            done.delete(commentId);
            set({ deletingCommentIds: done });
        }
    },

    /** Post author replies to a comment */
    replyToComment: async (postId, commentId, text) => {
        const trimmed = String(text || "").trim();
        if (!trimmed) throw new Error("Reply text is required");

        const replying = new Set(get().replyingCommentIds);
        replying.add(commentId);

        // optimistic reply
        const tempId = `temp-reply-${Date.now()}`;
        set((state) => {
            const list = state.byPost[postId]?.items || [];
            const next = list.map((c) =>
                c.id === commentId
                    ? {
                        ...c,
                        replies: [{ id: tempId, user: "me", text: trimmed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), __optimistic: true }, ...(c.replies || [])],
                    }
                    : c
            );
            return {
                replyingCommentIds: replying,
                byPost: { ...state.byPost, [postId]: { items: next, loading: false, error: null } },
            };
        });

        try {
            const { data } = await api.post(`/comments/replyComment/${postId}/${commentId}`, { text: trimmed });
            const saved = data?.reply;

            // swap optimistic reply with saved
            set((state) => {
                const list = state.byPost[postId]?.items || [];
                const next = list.map((c) => {
                    if (c.id !== commentId) return c;
                    const repl = (c.replies || []).map((r) => (r.id === tempId ? saved : r));
                    return { ...c, replies: repl };
                });
                return { byPost: { ...state.byPost, [postId]: { items: next, loading: false, error: null } } };
            });

            return saved;
        } catch (err) {
            // remove optimistic reply
            set((state) => {
                const list = state.byPost[postId]?.items || [];
                const next = list.map((c) =>
                    c.id === commentId ? { ...c, replies: (c.replies || []).filter((r) => r.id !== tempId) } : c
                );
                return { byPost: { ...state.byPost, [postId]: { items: next, loading: false, error: err.message || "Failed to add reply" } } };
            });
            throw err;
        } finally {
            const done = new Set(get().replyingCommentIds);
            done.delete(commentId);
            set({ replyingCommentIds: done });
        }
    },

    /** Update a reply (only post author; their own reply) */
    updateReply: async (postId, commentId, replyId, text) => {
        const trimmed = String(text || "").trim();
        if (!trimmed) throw new Error("Reply text is required");

        const updating = new Set(get().updatingReplyIds);
        updating.add(replyId);

        // optimistic change
        set((state) => {
            const list = state.byPost[postId]?.items || [];
            const next = list.map((c) =>
                c.id === commentId
                    ? {
                        ...c,
                        replies: (c.replies || []).map((r) => (r.id === replyId ? { ...r, text: trimmed } : r)),
                    }
                    : c
            );
            return {
                updatingReplyIds: updating,
                byPost: { ...state.byPost, [postId]: { items: next, loading: false, error: null } },
            };
        });

        try {
            const { data } = await api.patch(`/comments/updateReply/${postId}/${commentId}/${replyId}`, { text: trimmed });
            const updated = data?.reply || null;

            if (updated) {
                set((state) => {
                    const list = state.byPost[postId]?.items || [];
                    const next = list.map((c) =>
                        c.id === commentId
                            ? {
                                ...c,
                                replies: (c.replies || []).map((r) => (r.id === replyId ? updated : r)),
                            }
                            : c
                    );
                    return { byPost: { ...state.byPost, [postId]: { items: next, loading: false, error: null } } };
                });
            }
            return updated;
        } catch (err) {
            await get().fetchComments(postId).catch(() => {});
            throw err;
        } finally {
            const done = new Set(get().updatingReplyIds);
            done.delete(replyId);
            set({ updatingReplyIds: done });
        }
    },

    /** Delete a reply (post author who wrote it OR admin) */
    deleteReply: async (postId, commentId, replyId) => {
        const deleting = new Set(get().deletingReplyIds);
        deleting.add(replyId);

        // optimistic remove
        const prev = get().byPost[postId]?.items || [];
        const prevAfter = prev.map((c) =>
            c.id === commentId ? { ...c, replies: (c.replies || []).filter((r) => r.id !== replyId) } : c
        );

        set({
            deletingReplyIds: deleting,
            byPost: { ...get().byPost, [postId]: { items: prevAfter, loading: false, error: null } },
        });

        try {
            await api.delete(`/comments/deleteReply/${postId}/${commentId}/${replyId}`);
            return true;
        } catch (err) {
            // revert
            set((state) => ({
                byPost: { ...state.byPost, [postId]: { items: prev, loading: false, error: err.message || "Failed to delete reply" } },
            }));
            throw err;
        } finally {
            const done = new Set(get().deletingReplyIds);
            done.delete(replyId);
            set({ deletingReplyIds: done });
        }
    },
}));
