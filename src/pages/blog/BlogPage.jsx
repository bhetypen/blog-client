// src/pages/BlogPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { usePostStore } from "../../store/postStore";
import PostCard from "../../components/posts/PostCard";
import BlogSidebar from "./BlogSideBar";

function Pager({ page, totalPages, onPage }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxButtons = 7;
    let start = Math.max(1, page - 3);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, Math.min(start, end - maxButtons + 1));
    for (let p = start; p <= end; p++) pages.push(p);

    return (
        <nav aria-label="Blog pagination" className="mt-4">
            <ul className="pagination">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => onPage(page - 1)}>‹</button>
                </li>
                {pages.map((p) => (
                    <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                        <button className="page-link" onClick={() => onPage(p)}>{p}</button>
                    </li>
                ))}
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => onPage(page + 1)}>›</button>
                </li>
            </ul>
        </nav>
    );
}

export default function BlogPage() {
    const { posts, listLoading, fetchPosts } = usePostStore();
    const [page, setPage] = useState(1);
    const pageSize = 4;

    useEffect(() => {
        if (!posts || posts.length === 0) {
            fetchPosts().catch(() => {});
        }
    }, [posts?.length, fetchPosts]);

    const sorted = useMemo(() => {
        const copy = [...(posts || [])];
        copy.sort((a, b) => {
            const da = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
            const db = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
            return db - da;
        });
        return copy;
    }, [posts]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const slice = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

    return (
        <div className="container py-5">
            <div className="row">
                {/* Main column */}
                <div className="col-lg-8">
                    <h1 className="display-6 mb-4">Blog Page</h1>

                    {listLoading && <div className="py-5 text-center text-muted">Loading posts…</div>}
                    {!listLoading && slice.length === 0 && (
                        <div className="py-5 text-center text-muted">No posts yet.</div>
                    )}

                    {!listLoading && slice.map((post) => <PostCard key={post.id} post={post} />)}

                    <Pager page={safePage} totalPages={totalPages} onPage={setPage} />
                </div>

                {/* Sidebar */}
                <BlogSidebar posts={posts} />
            </div>
        </div>
    );
}
