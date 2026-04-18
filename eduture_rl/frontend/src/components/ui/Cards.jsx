import React from 'react';

export function SurfaceCard({ className = '', children }) {
    return <div className={`surface-card ${className}`.trim()}>{children}</div>;
}

export function Pill({ children, tone = 'neutral' }) {
    return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function MetricCard({ label, value, note, accent = 'primary' }) {
    return (
        <SurfaceCard className={`metric-card accent-${accent}`}>
            <div className="metric-value">{value}</div>
            <div className="metric-label">{label}</div>
            {note ? <div className="metric-note">{note}</div> : null}
        </SurfaceCard>
    );
}

export function SectionHeader({ eyebrow, title, description, actions }) {
    return (
        <div className="section-header">
            <div>
                {eyebrow ? <div className="section-eyebrow">{eyebrow}</div> : null}
                <h2 className="section-title">{title}</h2>
                {description ? <p className="section-description">{description}</p> : null}
            </div>
            {actions ? <div className="section-actions">{actions}</div> : null}
        </div>
    );
}
