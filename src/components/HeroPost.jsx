import React from "react";
import { Link } from "react-router-dom";

export default function HeroPost() {
    return (
        <section className="hero-editorial bg-dark text-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-9 col-lg-10 text-center">

                        {/* Eyebrow */}
                        <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4 bg-opacity-10 bg-light">
                            <span className="small text-light opacity-75">Our Space</span>
                            <span className="vr opacity-25" />
                            <span className="small text-light opacity-75">Create • Share • Connect</span>
                        </div>

                        {/* Title */}
                        <h1 className="display-2 fw-700 mb-3">
                            Discover voices worth
                            <span className="d-block gradient-ink">reading.</span>
                        </h1>

                        {/* Subhead */}
                        <p className="lead text-white-70 mx-auto mb-5" style={{ maxWidth: 820 }}>
                            A calm place for thoughtful writing and curious readers.
                            Publish beautifully. Grow your audience. Make space for your ideas.
                        </p>

                        {/* CTAs */}
                        <div className="d-flex justify-content-center gap-2 mb-5">
                            <Link to="/register" className="btn btn-light btn-lg px-4 text-dark">
                                Start writing
                            </Link>
                            <Link to="/blogpost" className="btn btn-outline-light btn-lg px-4">
                                Explore stories
                            </Link>
                        </div>

                        {/* Meta line */}
                        <div className="text-white-50 small">
                            12,000+ posts • 3,000+ creators • 1M+ monthly reads
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
