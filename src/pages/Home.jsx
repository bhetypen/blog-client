// src/pages/Home.jsx
import React, { useEffect } from "react";
import HeroPost from "../components/HeroPost";
import SelectedPosts from "../components/SelectedPosts";
import TrendingNews from "../components/TrendingNews";
import { usePostStore } from "../store/postStore";

export default function Home() {
    const { posts, fetchPosts, listLoading } = usePostStore();

    useEffect(() => {
        if (!posts || posts.length === 0) {
            fetchPosts().catch(() => {});
        }
    }, [posts?.length, fetchPosts]);

    // Keep your demo hero as-is (optional)
    const hero = {
        image: "/images/couple.jpg",
        category: "Travel",
        views: "15488",
        readTime: 4,
        title:
            "The Game That Finally Lets You Live Your Fantasy of Being a Bickering Married Couple",
        author: "Kristin Watson",
        date: "October 5, 2022",
        excerpt:
            "We scoped out a handful of super cool destinations worth exploring in the Nordic island nation. With nearly every step, my microspikes slipped off the soles of my chukka boots.",
    };

    return (
        <div>
            <HeroPost post={hero} />

            {listLoading && (
                <p className="text-center text-muted py-5">Loading trending news…</p>
            )}
            {!listLoading && posts?.length > 0 && <TrendingNews posts={posts} />}

            {/* SelectedPosts now uses real posts and picks 1 main + 2 side randomly */}
            {listLoading && (
                <p className="text-center text-muted py-5">Loading selected posts…</p>
            )}
            {!listLoading && posts?.length > 0 && <SelectedPosts posts={posts} />}

            {/* Optionally show an empty state */}
            {!listLoading && (!posts || posts.length === 0) && (
                <p className="text-center text-muted py-5">No posts yet.</p>
            )}
        </div>
    );
}
