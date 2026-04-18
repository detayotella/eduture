import React from 'react';
import AppShell from '../components/layout/AppShell';
import { styleMeta } from '../constants/learningData';

export default function ProgressPage() {
    const formatRelativeTime = (timestamp) => {
        const diffMs = Date.now() - timestamp.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes < 1) {
            return 'just now';
        }
        if (diffMinutes < 60) {
            return `${diffMinutes} min ago`;
        }
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        }
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) {
            return 'Yesterday';
        }
        return `${diffDays} days ago`;
    };

    const now = new Date();
    const statCards = [
        { label: 'Study Time', value: '12.5', suffix: 'hrs', icon: '◷', accent: 'primary', chip: 'LIFETIME' },
        { label: 'Avg Score', value: '84', suffix: '%', icon: '★', accent: 'tertiary', chip: '+2.4%' },
        { label: 'Topics Completed', value: '15', suffix: '/20', icon: '☑', accent: 'theorist', chip: '75%' },
        { label: 'Current Streak', value: '5', suffix: 'days', icon: '⚑', accent: 'activist', chip: 'ACTIVE' },
    ];

    const bars = [
        { day: 'MON', height: '30%', value: '1.2h' },
        { day: 'TUE', height: '50%', value: '2.1h' },
        { day: 'WED', height: '80%', value: '3.2h', active: true },
        { day: 'THU', height: '45%', value: '1.7h' },
        { day: 'FRI', height: '60%', value: '2.5h' },
        { day: 'SAT', height: '20%', value: '0.8h' },
        { day: 'SUN', height: '10%', value: '0.4h' },
    ];

    const styleRows = [
        { key: 'activist', value: 65 },
        { key: 'reflector', value: 85 },
        { key: 'theorist', value: 45 },
        { key: 'pragmatist', value: 55 },
    ];

    const timeline = [
        {
            title: 'Module Completed',
            detail: 'Advanced Theoretical Frameworks',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            icon: '✓',
            active: true,
        },
        {
            title: 'Assessment Submitted',
            detail: 'Cognitive Bias Identification (Score: 92%)',
            timestamp: new Date(now.getTime() - 26 * 60 * 60 * 1000),
            icon: '✎',
        },
        {
            title: 'Material Reviewed',
            detail: 'Reading: History of Structuralism',
            timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            icon: '◉',
        },
    ];

    return (
        <AppShell
            title="Your Learning Journey"
            subtitle="Analytics Overview"
            actions={(
                <div className="prg-header-actions">
                    <button type="button" className="btn btn-soft">Export Data</button>
                    <button type="button" className="btn btn-primary">Review Modules</button>
                </div>
            )}
        >
            <div className="prg-stat-grid">
                {statCards.map((card) => (
                    <article key={card.label} className={`prg-stat-card ${card.accent}`}>
                        <div className="prg-stat-head">
                            <span className="prg-stat-icon" aria-hidden="true">{card.icon}</span>
                            <span className="prg-stat-chip">{card.chip}</span>
                        </div>
                        <p className="prg-stat-label">{card.label}</p>
                        <p className="prg-stat-value">
                            {card.value}
                            <span>{card.suffix}</span>
                        </p>
                    </article>
                ))}
            </div>

            <section className="prg-main-grid">
                <article className="prg-panel prg-activity-panel">
                    <div className="prg-panel-head">
                        <div>
                            <h3>Learning Activity</h3>
                            <p>Hours invested per day</p>
                        </div>
                        <div className="prg-period-switch">
                            <button type="button" className="active">Week</button>
                            <button type="button">Month</button>
                        </div>
                    </div>
                    <div className="prg-bar-chart">
                        <div className="prg-y-axis" aria-hidden="true">
                            <span>4h</span>
                            <span>3h</span>
                            <span>2h</span>
                            <span>1h</span>
                            <span>0h</span>
                        </div>
                        <div className="prg-bars">
                            {bars.map((bar) => (
                                <div key={bar.day} className="prg-bar-group">
                                    <div className={`prg-bar ${bar.active ? 'active' : ''}`} style={{ height: bar.height }}>
                                        <span className="prg-bar-tip">{bar.value}</span>
                                    </div>
                                    <span className={`prg-bar-label ${bar.active ? 'active' : ''}`}>{bar.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>

                <article className="prg-panel prg-style-panel">
                    <h3>Style Radar</h3>
                    <p>Cognitive balance</p>
                    <div className="prg-style-list">
                        {styleRows.map((row) => (
                            <div key={row.key} className="prg-style-row">
                                <div className="prg-style-label">
                                    <span className="prg-style-dot" style={{ backgroundColor: styleMeta[row.key].color }} />
                                    <span>{styleMeta[row.key].label}</span>
                                </div>
                                <div className="prg-style-track">
                                    <span style={{ width: `${row.value}%`, backgroundColor: styleMeta[row.key].color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="prg-style-note">
                        Your current approach heavily favors <strong style={{ color: styleMeta.reflector.color }}>Reflective</strong> processing.
                    </p>
                </article>
            </section>

            <section className="prg-panel prg-timeline-panel">
                <h3>Recent Activity</h3>
                <div className="prg-timeline">
                    {timeline.map((event) => (
                        <article key={event.title} className="prg-event-row">
                            <div className={`prg-event-icon ${event.active ? 'active' : ''}`}>{event.icon}</div>
                            <div className="prg-event-card">
                                <div className="prg-event-head">
                                    <h4>{event.title}</h4>
                                    <time>{formatRelativeTime(event.timestamp)}</time>
                                </div>
                                <p>{event.detail}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </AppShell>
    );
}
