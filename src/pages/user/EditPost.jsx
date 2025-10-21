// src/pages/EditPostPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { usePostStore } from "../../store/postStore";
import { toast } from "react-toastify";

export default function EditPostPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchPostById, updatePost, currentPost, itemLoading } = usePostStore();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (id) {
            fetchPostById(id).catch(() => toast.error("Failed to load post"));
        }
    }, [id, fetchPostById]);

    useEffect(() => {
        if (currentPost) {
            setTitle(currentPost.title || "");
            setContent(currentPost.content || "");
        }
    }, [currentPost]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updatePost(id, { title, content });
            toast.success("Post updated!");
            navigate(`/posts/${id}`);
        } catch (err) {
            toast.error(err.message || "Failed to update post");
        }
    };

    if (itemLoading) return <div className="container py-5">Loading…</div>;

    return (
        <div className="container py-5">
            <h1 className="mb-4">Edit Post</h1>

            <form onSubmit={handleSubmit} className="mb-4">
                <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Content</label>
                    <SimpleMDE value={content} onChange={setContent} />
                </div>

                <button type="submit" className="btn btn-primary">
                    Save Changes
                </button>
            </form>
        </div>
    );
}
