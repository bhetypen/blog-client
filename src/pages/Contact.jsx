import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ContactPage() {
    const companyName = "Your Name – Portfolio (Sample Project)";
    const year = new Date().getFullYear();

    return (
        <div className="bg-white text-dark min-vh-100 d-flex flex-column">
            <div className="container py-5 flex-grow-1">
                <header className="mb-5 text-center">
                    <h1 className="fw-bold">Contact</h1>
                    <p className="text-muted">
                        Reach out directly using the information below.
                    </p>
                </header>

                <div className="row g-4 text-center">
                    {/* Email */}
                    <div className="col-md-6 col-lg-3">
                        <div className="p-4 border rounded h-100">
                            <i className="bi bi-envelope-fill fs-2 text-primary"></i>
                            <h5 className="mt-3">Email</h5>
                            <a
                                href="mailto:bhety.pen@gmail.com"
                                className="text-decoration-none text-dark"
                            >
                                bhety.pen@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="col-md-6 col-lg-3">
                        <div className="p-4 border rounded h-100">
                            <i className="bi bi-linkedin fs-2 text-primary"></i>
                            <h5 className="mt-3">LinkedIn</h5>
                            <a
                                href="https://www.linkedin.com/in/bhety-penetzdorfer/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none text-dark"
                            >
                                linkedin.com/in/bhety-penetzdorfer
                            </a>
                        </div>
                    </div>

                    {/* GitHub */}
                    <div className="col-md-6 col-lg-3">
                        <div className="p-4 border rounded h-100">
                            <i className="bi bi-github fs-2"></i>
                            <h5 className="mt-3">GitHub</h5>
                            <a
                                href="https://github.com/bhetypen"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none text-dark"
                            >
                                github.com/bhetypen
                            </a>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="col-md-6 col-lg-3">
                        <div className="p-4 border rounded h-100">
                            <i className="bi bi-geo-alt-fill fs-2 text-danger"></i>
                            <h5 className="mt-3">Location</h5>
                            <p className="mb-0">Linz, Austria (or Remote)</p>
                        </div>
                    </div>
                </div>

                {/* Info Note */}
                <div className="alert alert-light border mt-5 text-center" role="alert">
                    <strong>Note:</strong> This is a demo portfolio project and does not
                    include an interactive form.
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-muted py-4 border-top">
                © {year} {companyName}. All rights reserved.
            </footer>
        </div>
    );
}
