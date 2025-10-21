// src/pages/Register.jsx
import React, { useState } from "react";
import SiteNavbar from "../components/SiteNavbar";
import SiteFooter from "../components/SiteFooter";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
    const { register, loading } = useAuthStore();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function onSubmit(e) {
        e.preventDefault();
        try {
            await register({ username: username.trim(), email: email.trim(), password });
            toast.success("Account created successfully!");
            navigate("/login");
        } catch (err) {
            console.error("Registration failed:", err);
            toast.error(err.message); // shows "Email already registered", etc.
        }
    }

    return (
        <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
            <main className="border container p-4" style={{ maxWidth: 520 }}>
                <h1 className="h3 mb-4 text-center">Create your account</h1>
                <form className="row g-3" onSubmit={onSubmit}>
                    <div className="col-12">
                        <label className="form-label">Username</label>
                        <input
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="name"
                            required
                        />
                    </div>
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
                            autoComplete="new-password"
                            required
                        />
                    </div>
                    <div className="col-12 d-grid">
                        <button className="btn btn-black" disabled={loading}>
                            {loading ? "Creating…" : "Create account"}
                        </button>
                    </div>
                    <div className="col-12 text-center">
                        <span className="text-muted small">
                            Already have an account? <a href="/login">Log in</a>
                        </span>
                    </div>
                </form>
            </main>
        </div>
    );
}
