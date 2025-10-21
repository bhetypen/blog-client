// src/pages/AddPostPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { usePostStore } from "../../store/postStore";
import { toast } from "react-toastify";

export default function AddPost() {
    const navigate = useNavigate();
    const { createPost } = usePostStore(); // ⬅️ assumes your store exposes createPost({title, content}) → returns created post

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        setSubmitting(true);
        try {
            const created = await createPost({ title: title.trim(), content });
            toast.success("Post created!");
            // Navigate to the new post's page
            navigate(`/posts/${created.id}`);
        } catch (err) {
            toast.error(err?.message || "Failed to create post");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container py-5">
            <h1 className="mb-4">Add Post</h1>

            <form onSubmit={handleSubmit} className="mb-4">
                <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a title…"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Content</label>
                    <SimpleMDE value={content} onChange={setContent} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Creating…" : "Create Post"}
                </button>
            </form>
        </div>
    );
}
