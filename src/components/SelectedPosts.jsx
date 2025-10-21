// src/components/SelectedPosts.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { pickImage, excerptFrom } from "../utils/posts";

// Shuffle helper
const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

// Date helper
const fmtDate = (p) =>
    new Date(p?.createdAt || p?.updatedAt || Date.now()).toLocaleDateString(
        undefined,
        { year: "numeric", month: "short", day: "numeric" }
    );

function OverlayCard({ post, large = false }) {
    const img = pickImage(post);
    const author = post?.author?.username || post?.author?.email || "Unknown";

    return (
        <Link
            to={`/posts/${post.id}`}
            className="text-decoration-none text-reset d-block h-100"
        >
            <div
                className="position-relative rounded overflow-hidden h-100 shadow-sm"
                style={{
                    minHeight: large ? "420px" : "200px", // main taller; sides smaller
                    backgroundColor: "#f1f3f5",
                }}
            >
                {/* Background image */}
                {img && (
                    <img
                        src={img}
                        alt={post.title || "Post image"}
                        className="w-100 h-100 object-fit-cover"
                    />
                )}

                {/* Dark gradient overlay at bottom for readability */}
                <div
                    className="position-absolute bottom-0 start-0 end-0 p-3 p-md-4 text-white"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.52), rgba(0,0,0,0.18), rgba(0,0,0,0))",
                    }}
                >
                    <small className="d-block text-light mb-1">{fmtDate(post)}</small>

                    <h3 className={`mb-2 fw-bold ${large ? "fs-2" : "fs-6"}`}>
                        {post.title || "Untitled"}
                    </h3>

                    {large && (
                        <p className="mb-2 text-light small">
                            {excerptFrom(post?.content, 110)}
                        </p>
                    )}

                    <div className="small text-light">
                        By <span className="fw-semibold">{author}</span>
                    </div>
                </div>

                {/* Subtle hover zoom */}
                <div
                    className="position-absolute top-0 start-0 end-0 bottom-0"
                    style={{ transition: "transform 220ms ease" }}
                />
            </div>
        </Link>
    );
}

/**
 * SelectedPosts
 * Pass full posts array. Component picks 1 main + up to 2 side posts randomly.
 */
export default function SelectedPosts({ posts }) {
    const { main, sides } = useMemo(() => {
        if (!posts || posts.length === 0) return { main: null, sides: [] };
        const shuffled = shuffle(posts);
        return {
            main: shuffled[0],
            sides: shuffled.slice(1, 3), // up to 2
        };
    }, [posts]);

    if (!main) {
        return (
            <section className="py-5 bg-light">
                <div className="container text-center text-muted">No posts yet.</div>
            </section>
        );
    }

    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h4 fw-bold mb-0">Selected Posts</h2>
                    <Link to="/blogpost" className="text-decoration-none small fw-semibold">
                        See More
                    </Link>
                </div>

                <div className="row g-4">
                    {/* Main big card (left) */}
                    <div className="col-lg-8">
                        <OverlayCard post={main} large />
                    </div>

                    {/* Right column (stacked smaller overlay cards) */}
                    <div className="col-lg-4 d-flex flex-column gap-4">
                        {sides.map((p) => (
                            <OverlayCard key={p.id} post={p} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
