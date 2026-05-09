import React from 'react';
import { NavLink } from 'react-router-dom';
import DashboardShell from '../components/layout/DashboardShell';
import { Pill, SectionHeader } from '../components/ui/Cards';

export default function ExplorePage() {
    const tracks = [
        { title: 'Computer Essentials', summary: 'Master fundamental computing concepts. Learn about hardware components, file management, and device operations.', to: '/learn/intro-computers' },
        { title: 'Online Essentials', summary: 'Navigate the internet safely and effectively. Build skills in web browsing, online communication, and digital citizenship.', to: '/learn/internet-basics' },
        { title: 'Professional Development', summary: 'Enhance your workplace readiness with digital literacy and practical computing skills aligned to industry standards.', to: '/assessment/pre-test' },
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
                <NavLink to="/learn/intro-computers" className="btn btn-primary">Open Learning Canvas</NavLink>
            </section>

            <SectionHeader eyebrow="Learning Paths" title="ICDL-Aligned Training Modules" />
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
