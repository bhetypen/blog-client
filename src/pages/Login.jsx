// src/pages/Login.jsx
import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function Login() {
    const { login, loading, error } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    async function onSubmit(e) {
        e.preventDefault();

        try {
            await login({ email: email.trim(), password });
            toast.success("Welcome back!");

            const { user } = useAuthStore.getState(); // get current user from store

            // if you want "go back to where user came from"
            const from = location.state?.from?.pathname;

            if (from) {
                navigate(from, { replace: true });
            } else {
                // role-based redirect
                if (user?.isAdmin) {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/user-dashboard");
                }
            }
        } catch (err) {
            toast.error(err?.message || "Login failed. Check your credentials.");
            console.error("Login failed:", err);
        }
    }

    return (
        <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
            <main className="border container p-4" style={{ maxWidth: 520 }}>
                <h1 className="h3 mb-4 text-center">Log in to Our Space</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <form className="row g-3" onSubmit={onSubmit}>
                    <div className="col-12">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <div className="col-12 d-grid">
                        <button className="btn btn-black" disabled={loading}>
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </div>
                    <div className="col-12 text-center">
            <span className="text-muted small">
              New here? <Link to="/register">Create an account</Link>
            </span>
                    </div>
                </form>
            </main>
        </div>
    );
}
