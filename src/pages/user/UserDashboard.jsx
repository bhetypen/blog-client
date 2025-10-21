// src/pages/dashboard/UserDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { usePostStore } from "../../store/postStore";
import { useAuthStore } from "../../store/authStore";
import PostCard from "../../components/posts/PostCard";

export default function UserDashboard() {
    const { myPosts, myListLoading, fetchMyPosts } = usePostStore();
    const { user } = useAuthStore();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        if (user) fetchMyPosts().catch(() => {});
    }, [user, fetchMyPosts]);

    // Filtered posts for sidebar
    const filtered = useMemo(() => {
        if (!myPosts) return [];
        return myPosts.filter(
            (p) =>
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.content.toLowerCase().includes(search.toLowerCase())
        );
    }, [myPosts, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    return (
        <div className="container py-5">
            <div className="row">
                {/* Main column: full PostCards */}
                <div className="col-lg-8">
                    <h1 className="mb-4">My Posts</h1>

                    {myListLoading && (
                        <div className="text-center text-muted py-5">Loading…</div>
                    )}

                    {!myListLoading && myPosts?.length === 0 && (
                        <div className="text-center text-muted py-5">
                            You haven’t created any posts yet.
                        </div>
                    )}

                    {!myListLoading &&
                        myPosts?.map((post) => <PostCard key={post.id} post={post} />)}
                </div>

                {/* Sidebar: compact titles with search + pagination */}
                <aside className="col-lg-4 mt-5 mt-lg-0">
                    <div className="sticky-top" style={{ top: "5rem" }}>
                        <div className="border rounded p-3 mb-4">
                            <h5 className="mb-3">Search My Posts</h5>
                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="Search…"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1); // reset page on new search
                                }}
                            />

                            <ul className="list-unstyled">
                                {slice.map((p) => (
                                    <li key={p.id} className="mb-2">
                                        <a
                                            href={`/posts/${p.id}`}
                                            className="text-decoration-none d-block text-truncate"
                                            title={p.title}
                                        >
                                            {p.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>

                            {/* Pagination controls */}
                            {totalPages > 1 && (
                                <nav aria-label="Sidebar pagination">
                                    <ul className="pagination pagination-sm justify-content-center">
                                        <li className={`page-item ${safePage === 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setPage(safePage - 1)}
                                            >
                                                ‹
                                            </button>
                                        </li>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <li
                                                key={p}
                                                className={`page-item ${p === safePage ? "active" : ""}`}
                                            >
                                                <button className="page-link" onClick={() => setPage(p)}>
                                                    {p}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${safePage === totalPages ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setPage(safePage + 1)}
                                            >
                                                ›
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
