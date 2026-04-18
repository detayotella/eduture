import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, SurfaceCard } from '../components/ui/Cards';

export default function LandingPage() {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    return (
        <div className="landing-shell">
            <header className="landing-topbar glass-header">
                <div className="landing-brand">
                    <span className="material-symbols-outlined top-icon">auto_awesome</span>
                    <div className="landing-brand-text">EDUTURE 2.0</div>
                </div>
                <nav className="landing-links">
                    <button type="button" onClick={() => navigate('/preview/dashboard')}>Dashboard</button>
                    <button type="button" onClick={() => navigate('/preview/learning')}>Modules</button>
                    <button type="button" onClick={() => navigate('/preview/progress')}>Community</button>
                    <button type="button" onClick={() => navigate('/preview/admin')}>Resources</button>
                </nav>
                <div className="landing-top-actions">
                    <div className="landing-search-wrap">
                        <span className="material-symbols-outlined">search</span>
                        <input placeholder="Search..." />
                    </div>
                    <button className="btn btn-primary" type="button" onClick={() => navigate('/register')}>Start Learning</button>
                </div>
            </header>

            <main className="landing-main">
                <section className="landing-hero">
                    <div className="landing-hero-copy">
                        <Pill tone="brand">Editorial Intelligence Applied</Pill>
                        <h1 className="hero-title">Learn Smarter,<br />Not Harder</h1>
                        <p className="hero-subtitle">
                            An adaptive learning experience that adjusts to your unique style. We curate your path to mastery.
                        </p>
                        <div className="hero-actions">
                            <button className="btn btn-primary btn-large" type="button" onClick={() => navigate('/register')}>Get Started - It's Free</button>
                            <button className="btn btn-soft btn-large" type="button" onClick={() => navigate('/preview/dashboard')}>View Demo</button>
                        </div>
                    </div>

                    <SurfaceCard className="landing-hero-visual">
                        <img
                            alt="Adaptive learning abstract"
                            className="hero-image"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoVRAbeJ1uDvQXsunEbqw2fg3HclF9LZaxKumIg3P6XdkpkSc4nvY4rSQsdxwzktFBgMPORYdzyIOpZhIYh7wL3GESHnQlIKDc3RhtO-i6aqsq4yv8v26o1niyH3XFbIlnyeE8DOjne4hPz5Fy24awbfyV2AavBNiTBEkWg-ZcCjaYmPcXKcvLjmcRxUgUo38gvOJcoxXn2vlCelDd-ZjodoKeICLfURxrzRSfBzIFTgWPAmHUYpDuX1f23OmksWQlAU4EDUAuUSPF"
                        />
                        <div className="hero-visual-card">
                            <div className="hero-visual-left">
                                <div className="hero-visual-chip">
                                    <span className="hero-visual-dot"><span className="material-symbols-outlined">psychology</span></span>
                                    <span>Cognitive Style Identified</span>
                                </div>
                                <div className="hero-visual-title">Reflector / Deep Processing</div>
                            </div>
                            <div className="hero-visual-right">
                                <div className="hero-visual-subtitle">Adaptation</div>
                                <div className="progress-track"><span style={{ width: '85%' }} /></div>
                            </div>
                        </div>
                    </SurfaceCard>
                </section>

                <div className="hero-blob hero-blob-right" />
                <div className="hero-blob hero-blob-left" />

                <section className="trust-row">
                    <p className="trust-row-label">Trusted by forward-thinking institutions</p>
                    <div className="trust-grid">
                        <div className="trust-item"><span className="material-symbols-outlined">account_balance</span><span>University A</span></div>
                        <div className="trust-item"><span className="material-symbols-outlined">school</span><span>Institute B</span></div>
                        <div className="trust-item"><span className="material-symbols-outlined">science</span><span>Lab C</span></div>
                        <div className="trust-item mobile-hide"><span className="material-symbols-outlined">biotech</span><span>Tech D</span></div>
                    </div>
                </section>

                <section className="bento-section">
                    <div className="bento-intro">
                        <h2 className="bento-title">The Methodology</h2>
                        <p className="bento-copy">We move beyond rigid structures. Our platform adapts to your pace, providing a sanctuary for focused mastery.</p>
                    </div>
                    <div className="bento-grid">
                        <SurfaceCard className="bento-card bento-card-lift-1">
                            <div className="card-icon primary"><span className="material-symbols-outlined">radar</span></div>
                            <div className="card-title">Assess</div>
                            <div className="card-copy">Initial diagnostics map your current knowledge topology and cognitive preferences.</div>
                            <div className="mini-progress"><span className="mini-progress-fill primary" style={{ width: '35%' }} /></div>
                        </SurfaceCard>
                        <SurfaceCard className="bento-card bento-card-lift-2">
                            <div className="card-icon tertiary"><span className="material-symbols-outlined">tune</span></div>
                            <div className="card-title">Adapt</div>
                            <div className="card-copy">Content is dynamically restructured. Visual learners get diagrams; theorists get deep-dives.</div>
                            <div className="mini-progress"><span className="mini-progress-fill tertiary" style={{ width: '58%' }} /></div>
                        </SurfaceCard>
                        <SurfaceCard className="bento-card bento-card-lift-3">
                            <div className="card-icon secondary"><span className="material-symbols-outlined">workspace_premium</span></div>
                            <div className="card-title">Achieve</div>
                            <div className="card-copy">Reach mastery faster. Retain knowledge longer. Prove your skills with verifiable achievements.</div>
                            <div className="mini-progress"><span className="mini-progress-fill secondary" style={{ width: '74%' }} /></div>
                        </SurfaceCard>
                    </div>
                </section>

                <section className="social-proof-section">
                    <div className="social-proof-card">
                        <span className="material-symbols-outlined social-quote-mark">format_quote</span>
                        <div className="social-proof-grid">
                            <div>
                                <p className="social-proof-text">
                                    "The interface doesn't just display courses; it curates an atmosphere of focus. It recognized my tendency to skim and adapted by presenting information in digestible, high-impact nodes. Truly an intellectual atelier."
                                </p>
                                <div className="social-person">
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWqRyZu8voVKYpJ9V7-jaQJ3ohGDrckBf_PBzopO6SHW9ue9oKAdY_lj-pp5yZr4TSZ-TfR6qik795oGlt6bfH85-XvgbLqYsi_4YdwdDN61GXSBLFjm_G4WH6MZcdBRQclEeAC9ZuFBihS0iQKh045Vw3mekE-xcZOT8hy-BRInc48IBzs1v4zylrGF1qEKTYvUc0dDnXCsAUr4c9jx1GS8HgfhNu1M-njkf2QEEbOOt_kFz-idKdbBGjtIrzLtuxES6F4FhCku6J" alt="Dr Elena Rostova" />
                                    <div>
                                        <div className="social-person-name">Dr. Elena Rostova</div>
                                        <div className="social-person-role">Lead Researcher, Cognitive Sciences</div>
                                    </div>
                                </div>
                            </div>
                            <div className="social-stat-card">
                                <div className="social-stat-label">Retention Increase</div>
                                <div className="social-stat-value">+42%</div>
                                <div className="social-stat-track"><span /></div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="landing-footer-news">
                        <div className="landing-footer-brand"><span className="material-symbols-outlined">auto_awesome</span>EDUTURE 2.0</div>
                        <p>Join the atelier for updates.</p>
                        <div className="landing-news-input">
                            <input placeholder="Email address" />
                            <button type="button"><span className="material-symbols-outlined">arrow_forward</span></button>
                        </div>
                    </div>
                    <div className="landing-footer-links-wrap">
                        <div className="landing-footer-links">
                            <button type="button">Privacy Policy</button>
                            <button type="button">Terms of Service</button>
                            <button type="button">Help Center</button>
                        </div>
                        <div className="landing-footer-links">
                            <button type="button">API</button>
                            <button type="button">Careers</button>
                        </div>
                    </div>
                </div>
                <div className="landing-footer-bottom">
                    <div>© {currentYear} Eduture 2.0. Editorial Intelligence Applied.</div>
                    <div className="landing-footer-social">
                        <span className="material-symbols-outlined">share</span>
                        <span className="material-symbols-outlined">mail</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
