// src/components/SiteNavbar.jsx
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function isAdminUser(user) {
    if (!user) return false;
    if (typeof user.isAdmin === "boolean") return user.isAdmin;
    if (typeof user.role === "string") return user.role.toLowerCase() === "admin";
    return false;
}

export default function SiteNavbar() {
    const navigate = useNavigate();
    const { user, token, logout } = useAuthStore();
    const isLoggedIn = !!token;
    const isAdmin = isAdminUser(user);

    const dashboardPath = isAdmin ? "/admin-dashboard" : "/user-dashboard";

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate("/"); // send to homepage after logout
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
            <div className="container">
                {/* Brand */}
                <Link className="navbar-brand fw-semibold" to="/">
                    Our Space
                </Link>

                {/* Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNav"
                    aria-controls="mainNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>

                {/* Links */}
                <div className="collapse navbar-collapse" id="mainNav">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        {/* Public, always visible */}
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/" end>
                                Home
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            {/* Use your blog listing route; earlier you used `/blog` */}
                            <NavLink className="nav-link" to="/blogpost" end>
                                Blogs
                            </NavLink>
                        </li>

                        {/* Auth-dependent area */}
                        {!isLoggedIn ? (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/login">
                                        Log in
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-black rounded-0 ms-lg-3" to="/register">
                                        Create account
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to={dashboardPath}>
                                        Dashboard
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-outline-dark rounded-0 ms-lg-3"
                                        type="button"
                                    >
                                        Log out
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
