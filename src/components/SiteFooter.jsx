// src/components/SiteFooter.jsx
import React from "react";

export default function SiteFooter() {
    return (
        <footer className="border-top py-4 bg-light">
            <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
                <div className="small text-muted">© {new Date().getFullYear()} Our Space</div>
                <ul className="nav small">
                    <li className="nav-item"><a className="nav-link" href="/privacy">Privacy</a></li>
                    <li className="nav-item"><a className="nav-link" href="/contact">Contact</a></li>
                </ul>
            </div>
        </footer>
    );
}
