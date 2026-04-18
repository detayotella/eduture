import React from 'react';
import { NavLink } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { Pill, SectionHeader } from '../components/ui/Cards';

const pathwayItems = [
    { name: 'Computer Essentials', state: 'In progress', completion: 68 },
    { name: 'Data Structures II', state: 'Queued', completion: 0 },
    { name: 'Applied Problem Solving', state: 'Locked', completion: 0 },
];

export default function PathwaysPage() {
    return (
        <AppShell title="Pathways" subtitle="Learning sequence" actions={<Pill tone="neutral">Adaptive ordering</Pill>}>
            <section className="fx-hero fx-hero-pathways">
                <div>
                    <div className="fx-kicker">Pathways</div>
                    <h2>Your progression map</h2>
                    <p>These pathways are ordered by readiness and projected impact on mastery progression.</p>
                </div>
            </section>

            <SectionHeader
                eyebrow="Trajectory"
                title="What to tackle next"
            />
            <div className="fx-pathway-list">
                {pathwayItems.map((item) => (
                    <article key={item.name} className="fx-pathway-item">
                        <div>
                            <div className="fx-pathway-title">{item.name}</div>
                            <div className="fx-pathway-state">{item.state}</div>
                        </div>
                        <div className="fx-pathway-progress-wrap">
                            <div className="progress-track"><span style={{ width: `${item.completion}%` }} /></div>
                        </div>
                    </article>
                ))}
            </div>

            <div className="fx-actions-row">
                <NavLink to="/learn/computer-basics" className="btn btn-primary">Continue active pathway</NavLink>
            </div>
        </AppShell>
    );
}
