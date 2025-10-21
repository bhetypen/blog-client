import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { pickImage, excerptFrom } from "../utils/posts";

// format a short date from createdAt/updatedAt
const fmtDate = (p) =>
    new Date(p?.createdAt || p?.updatedAt || Date.now()).toLocaleDateString(
        undefined,
        { year: "numeric", month: "short", day: "numeric" }
    );

// pick N random posts from array (Fisher–Yates)
const pickRandom = (items = [], n = 3) => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, n);
};

function TrendingCard({ post }) {
    const img = pickImage(post);
    const author = post?.author?.username || post?.author?.email || "Unknown";

    return (
        <Link to={`/posts/${post.id}`} className="text-decoration-none text-reset">
            <div className="card border-0 shadow-sm h-100">
                {img && (
                    <div className="ratio ratio-4x3 bg-light rounded-top overflow-hidden">
                        <img
                            src={img}
                            alt={post.title || "Post image"}
                            className="w-100 h-100 object-fit-cover"
                        />
                    </div>
                )}
                <div className="card-body">
                    <div className="mb-2">
                        <small className="text-muted">{fmtDate(post)}</small>
                    </div>
                    <h5 className="card-title">{post.title || "Untitled"}</h5>
                    <p className="card-text text-muted small">
                        {excerptFrom(post?.content, 140)}
                    </p>
                    <div className="small text-muted">
                        By <span className="fw-semibold">{author}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}



export default function TrendingNews({ posts }) {
    // Always show up to 3 random posts from the list provided
    const randomPosts = useMemo(() => pickRandom(posts || [], 3), [posts]);

    return (
        <section className="py-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h4 fw-bold mb-0">Trending News</h2>
                    <Link to="/blogpost" className="text-decoration-none small fw-semibold">
                        Discover All
                    </Link>
                </div>

                <div className="row g-4">
                    {randomPosts.length === 0 && (
                        <div className="col-12 text-center text-muted">No trending posts yet.</div>
                    )}
                    {randomPosts.map((p) => (
                        <div className="col-md-4" key={p.id}>
                            <TrendingCard post={p} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
