import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import DashboardShell from '../components/layout/DashboardShell';
import api from '../services/api';
import { MetricCard, Pill, SectionHeader, SurfaceCard } from '../components/ui/Cards';

export default function AchievementsPage() {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        api
            .get('/interaction/summary')
            .then((response) => setSummary(response.data.data))
            .catch(() => setSummary(null));
    }, []);

    const streakDays = Math.max(0, Number(summary?.streak_days ?? 0));

    const activeDays = useMemo(() => {
        const density = Array.isArray(summary?.activity_density) ? summary.activity_density : [];
        return density.filter((value) => value !== '0' && value !== 'today').length;
    }, [summary]);

    const badgesEarned = Math.max(1, Math.min(50, streakDays + activeDays));
    const rankTopPercent = Math.max(5, 35 - Math.min(25, streakDays));

    const milestones = [3, 7, 14, 21, 30];
    const nextMilestone = milestones.find((milestone) => milestone > streakDays) ?? (streakDays + 7);
    const badgesToNextGoal = Math.max(0, nextMilestone - streakDays);

    const checkpointDateLabel = summary?.checkpoints?.[0]?.scheduled_at
        ? new Date(summary.checkpoints[0].scheduled_at).toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        })
        : 'No checkpoint scheduled';

    const newHighlights = Math.max(1, Math.min(5, Math.floor((streakDays + activeDays) / 4) || 1));

    const badges = [
        {
            title: 'Deep Work Streak',
            note: `${streakDays} day${streakDays === 1 ? '' : 's'}`,
            icon: 'local_fire_department',
        },
        {
            title: 'Assessment Ready',
            note: checkpointDateLabel,
            icon: 'military_tech',
        },
        {
            title: 'Theory Master',
            note: `Top ${rankTopPercent}%`,
            icon: 'workspace_premium',
        },
    ];

    return (
        <DashboardShell>
            <header className="db-header">
                <h1>Achievements</h1>
                <p>Mastery milestones</p>
            </header>

            <div className="metric-grid">
                <MetricCard label="Badges" value={String(badgesEarned)} note="Total earned" />
                <MetricCard label="Streak" value={`${streakDays}d`} note="Current run" accent="secondary" />
                <MetricCard label="Rank" value={`Top ${rankTopPercent}%`} note="Cohort standing" accent="tertiary" />
                <MetricCard label="Next Goal" value={String(badgesToNextGoal)} note="Badges remaining" />
            </div>

            <SectionHeader eyebrow="Highlights" title="Recent achievements" />
            <div className="module-grid">
                {badges.map((badge) => (
                    <SurfaceCard key={badge.title} className="module-card">
                        <Pill tone="brand"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{badge.icon}</span> Badge</Pill>
                        <h3 className="module-title">{badge.title}</h3>
                        <p className="module-copy">{badge.note}</p>
                    </SurfaceCard>
                ))}
            </div>

            <div style={{ marginTop: '16px' }}>
                <NavLink to="/assessment/pre-test" className="btn btn-primary">Take next checkpoint</NavLink>
            </div>
        </DashboardShell>
    );
}
