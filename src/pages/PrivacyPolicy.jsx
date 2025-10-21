import React from "react";

export default function PrivacyPolicy() {
    const companyName = "Your Name – Portfolio (Sample Project)"; // replace with your name if you like
    const year = new Date().getFullYear();

    return (
        <div className="container py-5">
            <header className="mb-4">
                <h1 className="fw-bold">Privacy Policy (EU/GDPR)</h1>
                <span className="badge bg-light text-dark">Effective date: October 22, 2025</span>
                <div className="card mt-3">
                    <div className="card-body">
                        This website is a <strong>non‑commercial sample project for a personal portfolio</strong>. It is provided for demonstration only and is not intended to collect personal data.
                    </div>
                </div>
            </header>

            <section className="mb-4">
                <h2 className="h5">Controller</h2>
                <p>
                    {companyName}. Contact: <a href="bhetypenz@gmail.com">bhetypenz@gmail.com</a>
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h5">Purpose & scope</h2>
                <p>
                    The site showcases portfolio work. It is not an online shop or service. We designed it to avoid collecting personal data wherever possible.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h5">No cookies or tracking</h2>
                <p>
                    We <strong>do not use cookies</strong>, tracking pixels, fingerprinting, analytics, advertising technologies, or social media trackers.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h5">Technical logs (minimal, transient)</h2>
                <p>
                    Our hosting provider may record standard request information (e.g., IP address, user agent, requested URL, timestamp) to deliver the site and prevent abuse. These logs are used solely for security and operational purposes and are not combined to identify you. We do not build profiles or perform analytics.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h5">Legal basis</h2>
                <p>
                    To the extent any technical processing occurs, it is strictly necessary to provide the website (<em>Art. 6(1)(b) GDPR</em>) and to ensure security and integrity (<em>Art. 6(1)(f) GDPR – legitimate interests</em>).
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h5">Data sharing & processors</h2>
                <p>
                    We do not sell or trade personal data. Trusted service providers (e.g., hosting) may act as processors under contractual terms consistent with GDPR.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h5">International transfers</h2>
                <p>
                    We aim to host in the EEA. If a transfer outside the EEA occurs (e.g., by a sub‑processor), it will rely on appropriate safeguards such as Standard Contractual Clauses.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h5">Retention</h2>
                <p>
                    Any technical logs are retained only as long as necessary for security and operations and then deleted or anonymised.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h5">Your rights (GDPR)</h2>
                <ul className="mb-2">
                    <li>Access your data and obtain a copy</li>
                    <li>Rectification and erasure</li>
                    <li>Restriction and objection to processing</li>
                    <li>Data portability (where applicable)</li>
                    <li>Complain to a supervisory authority in the EU/EEA</li>
                </ul>
                <p>
                    To exercise your rights, contact us at <a href="mailto:bhety.spie@gmail.com">bhetypenz@gmail.com</a>. Because this is a demo that does not intentionally collect personal data, we may only hold minimal technical information.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h5">Contact</h2>
                <p>
                    Email: <a href="mailto:bhety.spie@gmail.com">bhetypenz@gmail.com</a>
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h5">Changes to this notice</h2>
                <p>
                    Material changes will be reflected on this page with an updated effective date.
                </p>
            </section>

        </div>
    );
}
