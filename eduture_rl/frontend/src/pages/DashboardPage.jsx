import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getCurrentLearnerId } from '../constants/learningData';

const avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMofZ6l-IiSVXFTbgUrrcOQHSGgfusYMOwHkWRvTCbPDP0nURcsFNKvMXdeGXn8noYnX0rEDMsKQdXbBLYHvnkvI_XC9VdytOuhxbt79ze7OWiDYvtkXJB2j3p_0b56Cll45ieSXd5z6wzUqbvWzOoz2cQpJAc2nw95dlEKqub1qcpITGxACjs8-WAaR5LsBvhaVvKq7cpXe9ka_KDBNZsYg_7mcO8Y6oL_fWixJPKPJUDL9aF1ERw6ZWlHp3_HPIDt9lBYxHDtS-n';
const curatedImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuChH6gOEEiAlGlr50N6Y-ibYlQWfq9hXjpDp5yZO0sZgaOozfVsAZwl-3bzXf7N7RG7VQIGFI_GNu4JbvEdocKkAhH2apMcIcXYd6K9VHhPkFdXSCm7esRxoPTGC-Jjirqo3dSN4ZxzUtJRSweOAB7FoBEfe0aGZMlOMaoFCcUB07LYmE-ysq9DkWWCCjRAUTKAIkY0bKO8EaSB8KBvsOrnHzTe7ApmZzQ9BQszuX9gYHaqX7dNzgpFBOjcRN-O_-7IabsknwR6lu5L';
const pathwayImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3GQClOvyiAcb4Sb27ZXasg3QqxhXUWkDRzP-yjEbmDEIxeudqbQr41CYHQJpsN8KXTzYCdEW-aMbfWk0OzPLM2BvwsA2MJQR95fUZz8ioOeTL0CWD3mMxtAiV2AXbI3MxKT7KsxoNSw8X7KBxY9oSXjWm5JpSfJzrXyLmIV-gS6h2Doqq47ns7ZQxN5mByLIKkTL0EeVkjIpYcTqaFIFXnvpz4Y7kI2Uj_W-xCjMSkF90XzuGvG3RxKnepTrV4xo067O9A6LBBlsg';

export default function DashboardPage() {
    const { user } = useAuth();
    const [recommendation, setRecommendation] = useState(null);
    const [summary, setSummary] = useState(null);

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = user?.full_name?.trim()?.split(' ')[0] || 'Learner';

    useEffect(() => {
        api
            .get('/content/recommend', {
                params: {
                    learner_id: getCurrentLearnerId(user),
                    time_on_task: 0.5,
                    error_rate: 0.2,
                    revisit_count: 0.1,
                    completion_rate: 0.2,
                    engagement_score: 0.7,
                    topic_difficulty: 0.4,
                },
            })
            .then((response) => setRecommendation(response.data.data))
            .catch(() => setRecommendation(null));

        api
            .get('/interaction/summary')
            .then((response) => setSummary(response.data.data))
            .catch(() => setSummary(null));
    }, [user]);

    const heatValues = summary?.activity_density?.length === 14
        ? summary.activity_density
        : ['20', '50', '100', '80', '30', '0', '10', '60', '100', '90', '40', '70', '100', 'today'];

    const formatCheckpointTime = (isoValue) => {
        if (!isoValue) {
            return 'Upcoming';
        }
        const date = new Date(isoValue);
        const nowDate = new Date();
        const tomorrow = new Date(nowDate);
        tomorrow.setDate(nowDate.getDate() + 1);

        const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow, ${timePart}`;
        }
        return `${date.toLocaleDateString([], { weekday: 'long' })}, ${timePart}`;
    };

    const checkpoints = summary?.checkpoints?.length
        ? summary.checkpoints
        : [
            { title: 'Architecture Quiz', scheduled_at: null },
            { title: 'Peer Code Review', scheduled_at: null },
        ];

    return (
        <div className="db-page">
            <div className="db-desktop-shell">
                <aside className="db-sidebar">
                    <div className="db-logo">EDUTURE 2.0</div>
                    <div className="db-profile">
                        <img src={avatarUrl} alt="Learner" />
                        <div>
                            <div className="db-level">Mastery Level 4</div>
                            <div className="db-style">Activist Learner</div>
                        </div>
                    </div>

                    <nav className="db-nav">
                        <NavLink to="/dashboard" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}><span className="material-symbols-outlined">home</span><span>Home</span></NavLink>
                        <NavLink to="/explore" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}><span className="material-symbols-outlined">explore</span><span>Explore</span></NavLink>
                        <NavLink to="/pathways" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}><span className="material-symbols-outlined">moving</span><span>Pathways</span></NavLink>
                        <NavLink to="/achievements" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}><span className="material-symbols-outlined">workspace_premium</span><span>Achievements</span></NavLink>
                        <NavLink to="/settings" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}><span className="material-symbols-outlined">settings</span><span>Settings</span></NavLink>
                    </nav>

                    <button className="db-roadmap" type="button">View Roadmap</button>
                </aside>

                <main className="db-main">
                    <div className="db-main-inner">
                        <header className="db-header">
                            <h1>{greeting}, {firstName}.</h1>
                            <p>
                                Your cognitive flow is optimal today. Based on your recent deep work in structural logic, we recommend transitioning to creative application to balance your mastery curve.
                            </p>
                        </header>

                        <section className="db-resume">
                            <div className="db-resume-copy">
                                <div className="db-resume-chip"><span className="material-symbols-outlined">play_circle</span><span>Resume Focus</span></div>
                                <h2>{recommendation?.content?.title || 'Systems Architecture: Module 4'}</h2>
                                <div className="db-progress-row">
                                    <div className="db-progress"><span style={{ width: '68%' }} /></div>
                                    <span>68%</span>
                                </div>
                            </div>
                            <NavLink className="db-primary-btn" to={`/learn/${recommendation?.content?.topic_id || 'computer-basics'}`}>Continue Learning</NavLink>
                        </section>

                        <div className="db-grid">
                            <section className="db-left-stack">
                                <div className="db-curated">
                                    <div className="db-curated-head">
                                        <h3>Curated for You</h3>
                                        <div className="db-style-chip"><span />Activist Style</div>
                                    </div>
                                    <div className="db-curated-body">
                                        <img src={curatedImage} alt="Curated" />
                                        <div>
                                            <h4>Design Thinking in Action</h4>
                                            <p>Hands-on exercises to apply your theoretical knowledge to real-world interface problems.</p>
                                            <NavLink to="/learn/computer-basics">Start Exercise <span className="material-symbols-outlined">arrow_forward</span></NavLink>
                                        </div>
                                    </div>
                                </div>

                                <div className="db-pathway">
                                    <img src={pathwayImage} alt="Pathway" />
                                    <div className="db-pathway-content">
                                        <div className="db-pathway-kicker">Upcoming Pathway</div>
                                        <h3>Data Structures &amp; Algorithms</h3>
                                        <p>Unlock the foundational logic required for advanced computational thinking.</p>
                                        <div className="db-pathway-footer">
                                            <div><span className="material-symbols-outlined">schedule</span><span>Est. {summary?.estimated_hours ?? 12} Hours</span></div>
                                            <button type="button">Preview Syllabus</button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="db-right-stack">
                                <div className="db-ring-card">
                                    <h4>Cognitive Mastery Base</h4>
                                    <div className="db-ring-wrap">
                                        <svg viewBox="0 0 100 100" aria-hidden="true">
                                            <circle cx="50" cy="50" r="45" />
                                            <circle cx="50" cy="50" r="45" className="db-ring-progress" />
                                        </svg>
                                        <div>78%</div>
                                    </div>
                                    <p>You are 12% ahead of your cohort's average progression.</p>
                                </div>

                                <div className="db-heatmap-card">
                                    <div className="db-heatmap-head"><h4>Activity Density</h4><span>{summary?.streak_days ?? 0} Day Streak</span></div>
                                    <div className="db-heatmap-grid">
                                        {heatValues.map((v, idx) => (
                                            <span key={idx} className={`db-heat db-heat-${v}`} />
                                        ))}
                                    </div>
                                </div>

                                <div className="db-checkpoints">
                                    <h4>Critical Checkpoints</h4>
                                    <div className="db-checkpoint-item">
                                        <div className="db-checkpoint-icon"><span className="material-symbols-outlined">quiz</span></div>
                                        <div><h5>{checkpoints[0]?.title || 'Architecture Quiz'}</h5><p>{formatCheckpointTime(checkpoints[0]?.scheduled_at)}</p></div>
                                    </div>
                                    <div className="db-checkpoint-item">
                                        <div className="db-checkpoint-icon"><span className="material-symbols-outlined">assignment</span></div>
                                        <div><h5>{checkpoints[1]?.title || 'Peer Code Review'}</h5><p>{formatCheckpointTime(checkpoints[1]?.scheduled_at)}</p></div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>

            <div className="db-mobile-shell">
                <header className="db-mobile-topbar">
                    <button type="button"><span className="material-symbols-outlined">menu</span></button>
                    <h1>EDUTURE 2.0</h1>
                    <img src={avatarUrl} alt="Learner" />
                </header>

                <main className="db-mobile-main">
                    <section className="db-mobile-welcome">
                        <p>Intellectual Atelier</p>
                        <h2>{greeting},<br /><span>{firstName}.</span></h2>
                    </section>

                    <section className="db-mobile-hero">
                        <div className="db-mobile-hero-badge"><span />In Progress</div>
                        <h3>Advanced Cognitive Architectures</h3>
                        <p>Module 4: Neural Mapping</p>
                        <div className="db-mobile-hero-footer">
                            <div>
                                <div><span>Completion</span><strong>68%</strong></div>
                                <div className="db-mobile-progress"><span /></div>
                            </div>
                            <NavLink to="/learn/computer-basics">Resume<span className="material-symbols-outlined">play_arrow</span></NavLink>
                        </div>
                    </section>

                    <section className="db-mobile-curated">
                        <div className="db-mobile-section-head">
                            <h3>Curated for You</h3>
                            <span><span className="material-symbols-outlined">tune</span>Theorist Model</span>
                        </div>
                        <div className="db-mobile-bento">
                            <article className="db-mobile-primary-card">
                                <div className="db-mobile-primary-inner">
                                    <img src={curatedImage} alt="Curated" />
                                    <div>
                                        <h4>Systems Thinking Fundamentals</h4>
                                        <p>Deep dive into structural logic.</p>
                                        <span>{summary?.recommended_read_minutes ?? recommendation?.content?.estimated_time_minutes ?? 45} MIN READ</span>
                                    </div>
                                </div>
                            </article>
                            <article className="db-mobile-mini-card">
                                <div><span className="material-symbols-outlined">account_tree</span></div>
                                <h4>Logic Maps</h4>
                                <p>Review recent nodes</p>
                            </article>
                            <article className="db-mobile-mini-card">
                                <div><span className="material-symbols-outlined">library_books</span></div>
                                <h4>Citations</h4>
                                <p>Expand your base</p>
                            </article>
                        </div>
                    </section>

                    <section className="db-mobile-trajectory">
                        <h3>Mastery Trajectory</h3>
                        <div className="db-mobile-timeline">
                            <div className="db-mobile-timeline-line" />
                            <div className="db-mobile-timeline-item done">
                                <div className="db-mobile-dot" />
                                <div>
                                    <h4>Algorithmic Efficiency</h4>
                                    <p>Assessment Pending</p>
                                </div>
                                <strong>92%</strong>
                            </div>
                            <div className="db-mobile-timeline-item">
                                <div className="db-mobile-dot" />
                                <div>
                                    <h4>Data Structures II</h4>
                                    <p>In queue</p>
                                </div>
                                <strong>--</strong>
                            </div>
                        </div>
                    </section>
                </main>

                <nav className="db-mobile-bottomnav">
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}><span className="material-symbols-outlined">auto_stories</span><span>Learn</span></NavLink>
                    <NavLink to="/explore" className={({ isActive }) => isActive ? 'active' : ''}><span className="material-symbols-outlined">analytics</span><span>Insights</span></NavLink>
                    <NavLink to="/achievements" className={({ isActive }) => isActive ? 'active' : ''}><span className="material-symbols-outlined">military_tech</span><span>Mastery</span></NavLink>
                    <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}><span className="material-symbols-outlined">person</span><span>Profile</span></NavLink>
                </nav>
            </div>
        </div>
    );
}
