import React from "react";
import { Routes, Route } from "react-router-dom";
import SiteNavbar from "./components/SiteNavbar";
import SiteFooter from "./components/SiteFooter";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import BlogPage from "./pages/blog/BlogPage.jsx";
import BlogPostPage from "./pages/blog/BlogPostPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import EditPostPage from "./pages/user/EditPost";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import ContactPage from "./pages/Contact.jsx";


export default function App() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <SiteNavbar />

            <main className="flex-fill">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/blogpost" element={<BlogPage />} />
                    <Route path="/posts/:id" element={<BlogPostPage />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/contact" element={<ContactPage />} />





                    <Route element={<ProtectedRoute />}>
                        <Route path="/user-dashboard" element={<UserDashboard />} />
                        <Route path="/edit-post/:id" element={<EditPostPage />} />
                    </Route>

                    <Route element={<ProtectedRoute adminOnly />}>
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    </Route>

                    {/* fallback for any unknown route */}
                    <Route path="*" element={<div className="container py-5">Page not found</div>} />
                </Routes>
            </main>

            <SiteFooter />
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}
