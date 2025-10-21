import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 12000,
    headers: { "Content-Type": "application/json" },
});

function getAuthToken() {
    try {
        return localStorage.getItem("auth_token");
    } catch {
        return null;
    }
}

api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) config.headers["Authorization"] = `Bearer ${token}`;
        config.headers["x-request-start"] = String(Date.now());
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const data = error?.response?.data;
        let msg =
            (typeof data?.error === "string" && data.error) ||
            (typeof data?.message === "string" && data.message) ||
            (Array.isArray(data?.errors) && (
                (typeof data.errors[0] === "string" && data.errors[0]) ||
                (typeof data.errors[0]?.msg === "string" && data.errors[0].msg)
            )) ||
            (data?.errors && typeof data.errors === "object" && Object.values(data.errors)[0]) ||
            (typeof data === "string" && data.trim()) ||
            `Request failed${status ? ` (HTTP ${status})` : ""}: ${error?.message || "Network error"}`;

        if (status === 401) {
            localStorage.removeItem("auth_token");
            delete api.defaults.headers.common["Authorization"];
            window.dispatchEvent(new Event("auth:unauthorized"));
        }

        const wrapped = new Error(msg);
        wrapped.name = error.name || "AxiosError";
        wrapped.config = error.config;
        wrapped.code = error.code;
        wrapped.response = error.response;
        wrapped.isAxiosError = true;

        return Promise.reject(wrapped);
    }
);

export function setAuthToken(token) {
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete api.defaults.headers.common["Authorization"];
}
