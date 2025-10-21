// src/store/authStore.js
import { create } from "zustand";
import { api, setAuthToken } from "../lib/api";

export const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem("auth_token") || null,
    loading: false,
    error: null,


    register: async ({ username, email, password }) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.post("/users/register", { username, email, password });
            const token = data.token || null;
            if (token) {
                localStorage.setItem("auth_token", token);
                setAuthToken(token);
            }
            set({ user: data.user || null, token, loading: false });
            return data;
        } catch (e) {
            set({ loading: false, error: e.message });
            throw e;
        }
    },

    login: async ({email, password}) => {
        set({loading: true, error: null});
        try {
            const { data } = await api.post("/users/login", {email, password});
            const token = data.access || null;

            if (!token) throw new Error("No token received");

            // Save token
            localStorage.setItem("auth_token", token);
            setAuthToken(token);

            // Fetch user details with token
            const res = await api.get("/users/details");
            const user = res.data.user || res.data;

            set({ user, token, loading: false });

            return { user, token };  // return both

        } catch (e) {
            set({loading: false, error: e.message});
            throw e;
        }
    },

    me: async () => {
        if (!get().token) return null;
        set({ loading: true });
        try {
            const { data } = await api.get("/users/details");
            set({ user: data?.user ?? data ?? null, loading: false });
            return data?.user ?? data ?? null;
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem("auth_token");
        setAuthToken(null);
        set({ user: null, token: null });
    },
}));
