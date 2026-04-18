import React from 'react';
import { NavLink } from 'react-router-dom';
import DashboardShell from '../components/layout/DashboardShell';
import { Pill, SectionHeader } from '../components/ui/Cards';

export default function ExplorePage() {
    const tracks = [
        { title: 'Systems Thinking Fundamentals', summary: 'Deep-dive learning path with concept maps and guided practice.', to: '/learn/computer-basics' },
        { title: 'Hardware Essentials', summary: 'Hands-on pathway focused on practical component understanding.', to: '/learn/computer-basics' },
        { title: 'Productivity Foundations', summary: 'Applied productivity workflows and structured assessments.', to: '/assessment/pre-test' },
    ];

    return (
        <DashboardShell>
            <header className="db-header">
                <h1>Explore</h1>
                <p>Discovery hub</p>
            </header>

            <section className="fx-hero fx-hero-explore">
                <div>
                    <div className="fx-kicker">Explore</div>
                    <h2>Find your next learning focus</h2>
                    <p>Browse curated tracks and jump directly into modules aligned to your current learning signals.</p>
                </div>
                <NavLink to="/learn/computer-basics" className="btn btn-primary">Open Learning Canvas</NavLink>
            </section>

            <SectionHeader eyebrow="Curated Tracks" title="Recommended based on your momentum" />
            <div className="fx-grid fx-grid-3">
                {tracks.map((track, index) => (
                    <article key={track.title} className={`fx-card ${index === 0 ? 'feature' : ''}`}>
                        <Pill tone="brand">Track</Pill>
                        <h3>{track.title}</h3>
                        <p>{track.summary}</p>
                        <NavLink to={track.to} className="fx-link">Open track <span className="material-symbols-outlined">arrow_forward</span></NavLink>
                    </article>
                ))}
            </div>
        </DashboardShell>
    );
}
