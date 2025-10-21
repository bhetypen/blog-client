// src/store/postStore.js
import { create } from "zustand";
import { api } from "../lib/api";
import {useAuthStore} from "./authStore.js";

export const usePostStore = create((set, get) => ({
    posts: [],
    myPosts: [],
    currentPost: null,

    listLoading: false,
    myListLoading: false,
    itemLoading: false,
    createLoading: false,
    updatingIds: new Set(),
    deletingIds: new Set(),

    fetchPosts: async () => {
        set({ listLoading: true });
        try {
            const { data } = await api.get("/posts/getPosts");
            set({ posts: data?.posts ?? [], listLoading: false });
            return data?.posts ?? [];
        } catch (err) {
            set({ listLoading: false });
            throw err;
        }
    },

    fetchPostById: async (id) => {
        set({ itemLoading: true });
        try {
            const { data } = await api.get(`/posts/getPost/${id}`);
            const post = data?.post ?? null;
            set({ currentPost: post, itemLoading: false });
            return post;
        } catch (err) {
            set({ itemLoading: false });
            throw err;
        }
    },

    fetchMyPosts: async () => {
        set({ myListLoading: true });
        try {
            const { data } = await api.get("/posts/myPosts");
            set({ myPosts: data?.posts ?? [], myListLoading: false });
            return data?.posts ?? [];
        } catch (err) {
            set({ myListLoading: false });
            throw err;
        }
    },



    createPost: async ({ title, content }) => {
        set({ createLoading: true });
        try {
            const { data } = await api.post("/posts/createPost", {
                title: String(title).trim(),
                content: String(content).trim(),
            });
            const created = data?.post;
            if (created) {
                const posts = get().posts;
                set({ posts: [created, ...posts], createLoading: false, currentPost: created });
            } else {
                set({ createLoading: false });
            }
            return created;
        } catch (err) {
            set({ createLoading: false });
            throw err;
        }
    },

    updatePost: async (id, { title, content }) => {
        const updating = new Set(get().updatingIds);
        updating.add(id);
        set({ updatingIds: updating });
        const prevPosts = get().posts;
        const prev = prevPosts.find((p) => p.id === id);

        if (prev) {
            const optimistic = {
                ...prev,
                ...(title != null ? { title: String(title).trim() } : {}),
                ...(content != null ? { content: String(content).trim() } : {}),
            };
            set({ posts: prevPosts.map((p) => (p.id === id ? optimistic : p)) });
            if (get().currentPost?.id === id) set({ currentPost: optimistic });
        }

        try {
            const { data } = await api.patch(`/posts/updatePost/${id}`, {
                ...(title != null ? { title: String(title).trim() } : {}),
                ...(content != null ? { content: String(content).trim() } : {}),
            });
            const updated = data?.post ?? prev;
            set({
                posts: get().posts.map((p) => (p.id === id ? updated : p)),
                currentPost: get().currentPost?.id === id ? updated : get().currentPost,
            });
            return updated;
        } catch (err) {
            set({ posts: prevPosts }); // revert
            throw err;
        } finally {
            const done = new Set(get().updatingIds);
            done.delete(id);
            set({ updatingIds: done });
        }
    },

    deletePost: async (id) => {
        const deleting = new Set(get().deletingIds);
        deleting.add(id);

        const prevPosts = get().posts;
        const prevMyPosts = get().myPosts;

        // Optimistic update: remove from both posts and myPosts
        set({
            deletingIds: deleting,
            posts: prevPosts.filter((p) => p.id !== id),
            myPosts: prevMyPosts.filter((p) => p.id !== id),
        });

        if (get().currentPost?.id === id) set({ currentPost: null });


        try {
            await api.delete(`/posts/deletePost/${id}`);
            return true;
        } catch (err) {
            // revert if failed
            set({ posts: prevPosts, myPosts: prevMyPosts, currentPost: get().currentPost ?? null });
            throw err;
        } finally {
            const done = new Set(get().deletingIds);
            done.delete(id);
            set({ deletingIds: done });
        }
    },
}));
