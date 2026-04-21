import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/layout/DashboardShell';
import api from '../services/api';
import { styleMeta } from '../constants/learningData';

const styleOrder = ['activist', 'reflector', 'theorist', 'pragmatist'];

function formatRelativeTime(timestamp) {
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
}

function toScore(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return 0;
    }
    return Math.max(0, Math.min(100, value));
}

function extractBarHeight(value) {
    if (value === 'today') {
        return '86%';
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return '0%';
    }
    return `${Math.max(10, Math.min(100, numeric))}%`;
}

export default function ProgressPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [recommendationStatus, setRecommendationStatus] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [styleResult, setStyleResult] = useState(null);

    useEffect(() => {
        let active = true;
        const recommendationParams = {
            time_on_task: 0.5,
            error_rate: 0.2,
            revisit_count: 0.1,
            completion_rate: 0.2,
            engagement_score: 0.6,
            topic_difficulty: 0.4,
        };

        Promise.all([
            api.get('/interaction/summary'),
            api.get('/content/recommendation-status'),
            api.get('/content/recommend', { params: recommendationParams }),
            api.get('/learning-style/result'),
        ])
            .then(([summaryResponse, statusResponse, recommendationResponse, styleResponse]) => {
                if (!active) {
                    return;
                }
                setSummary(summaryResponse.data.data);
                setRecommendationStatus(statusResponse.data.data);
                setRecommendation(recommendationResponse.data.data);
                setStyleResult(styleResponse.data.data);
            })
            .catch(async () => {
                if (!active) {
                    return;
                }
                try {
                    const [summaryResponse, statusResponse, recommendationResponse] = await Promise.all([
                        api.get('/interaction/summary'),
                        api.get('/content/recommendation-status'),
                        api.get('/content/recommend', { params: recommendationParams }),
                    ]);
                    if (!active) {
                        return;
                    }
                    setSummary(summaryResponse.data.data);
                    setRecommendationStatus(statusResponse.data.data);
                    setRecommendation(recommendationResponse.data.data);
                } catch {
                    if (!active) {
                        return;
                    }
                    setSummary(null);
                    setRecommendationStatus(null);
                    setRecommendation(null);
                    setStyleResult(null);
                }
            });

        return () => {
            active = false;
        };
    }, [user]);

    const streakDays = Math.max(0, Number(summary?.streak_days ?? 0));
    const activityDensity = Array.isArray(summary?.activity_density) ? summary.activity_density : [];
    const activeDays = useMemo(() => activityDensity.filter((value) => value !== '0' && value !== 'today').length, [activityDensity]);
    const badgesEarned = Math.max(1, Math.min(50, streakDays + activeDays));
    const rankTopPercent = Math.max(5, 35 - Math.min(25, streakDays + Math.floor(activeDays / 2)));
    const nextMilestone = [3, 7, 14, 21, 30].find((milestone) => milestone > streakDays) ?? (streakDays + 7);
    const badgesToNextGoal = Math.max(0, nextMilestone - streakDays);
    const checkpointDateLabel = summary?.checkpoints?.[0]?.scheduled_at
        ? new Date(summary.checkpoints[0].scheduled_at).toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        })
        : 'No checkpoint scheduled';

    const engineSource = recommendationStatus?.engine_source || 'rule';
    const assignmentGroup = recommendationStatus?.assignment_group || recommendation?.group || 'rule_based';
    const recommendedTitle = recommendation?.content?.title || 'Next recommended step';
    const recommendedType = recommendation?.recommended_content_type || recommendation?.content?.content_type || 'activity';
    const recommendedContent = recommendation?.content?.content_data || 'The backend recommendation engine will surface live content here once the learner engages.';
    const lastRoute = recommendationStatus?.last_route || recommendation?.last_route || null;
    const lastRouteType = lastRoute?.content_type || recommendedType;

    const styleRows = styleOrder.map((key) => {
        const rawScore = styleResult ? Number(styleResult[`${key}_score`] ?? 0) : 0;
        return { key, value: toScore(rawScore) };
    });

    const dominantStyleLabel = styleResult?.dominant_style && styleMeta[styleResult.dominant_style]
        ? styleMeta[styleResult.dominant_style].label
        : 'Learning';

    const statCards = [
        { label: 'Current streak', value: `${streakDays}`, suffix: 'days', icon: 'local_fire_department', accent: 'activist', chip: streakDays > 0 ? 'ACTIVE' : 'READY' },
        { label: 'Active days', value: `${activeDays}`, suffix: '/14', icon: 'calendar_month', accent: 'primary', chip: 'RECENT' },
        { label: 'Engine source', value: engineSource.toUpperCase(), suffix: assignmentGroup, icon: 'hub', accent: 'tertiary', chip: 'RL' },
        { label: 'Next read', value: `${Math.max(10, Number(summary?.recommended_read_minutes ?? 45))}`, suffix: 'min', icon: 'menu_book', accent: 'theorist', chip: 'LIVE' },
    ];

    const bars = (activityDensity.length ? activityDensity : ['0', '20', '40', '60', '80', '100', 'today']).map((value, index) => ({
        day: index === 13 ? 'TODAY' : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][index % 7],
        height: extractBarHeight(value),
        value: value === 'today' ? 'today' : `${value}%`,
        active: value !== '0',
    }));

    const timeline = [
        {
            title: 'Latest recommendation',
            detail: `${recommendedTitle} • ${recommendedType}`,
            timestamp: recommendationStatus?.last_route?.recorded_at ? new Date(recommendationStatus.last_route.recorded_at) : new Date(),
            icon: 'route',
            active: true,
        },
        {
            title: 'Assessment checkpoint',
            detail: summary?.checkpoints?.[0]?.title || 'No checkpoint scheduled',
            timestamp: summary?.checkpoints?.[0]?.scheduled_at ? new Date(summary.checkpoints[0].scheduled_at) : new Date(),
            icon: 'military_tech',
        },
        {
            title: 'Learning style',
            detail: styleResult?.dominant_style && styleMeta[styleResult.dominant_style]
                ? `${styleMeta[styleResult.dominant_style].label} confirmed`
                : 'Run the questionnaire to update your style',
            timestamp: styleResult?.assessed_at ? new Date(styleResult.assessed_at) : new Date(),
            icon: 'psychology',
        },
    ];

    const exportData = () => {
        const exportDataObj = {
            exportDate: new Date().toISOString(),
            learner: {
                id: user?.learner_id ?? user?.id ?? null,
                name: user?.full_name || user?.email || 'Learner',
                stats: {
                    streakDays,
                    activeDays,
                    recommendedReadMinutes: Number(summary?.recommended_read_minutes ?? 45),
                    estimatedHours: Number(summary?.estimated_hours ?? 0),
                },
                learningStyle: styleResult ? {
                    dominantStyle: styleResult.dominant_style,
                    activist: styleResult.activist_score,
                    reflector: styleResult.reflector_score,
                    theorist: styleResult.theorist_score,
                    pragmatist: styleResult.pragmatist_score,
                } : null,
                recommendation: {
                    engineSource,
                    assignmentGroup,
                    title: recommendedTitle,
                    contentType: recommendedType,
                },
            },
            recentActivity: timeline.map((event) => ({
                title: event.title,
                detail: event.detail,
                timestamp: event.timestamp.toISOString(),
            })),
        };

        const dataStr = JSON.stringify(exportDataObj, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `eduture-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const reviewModules = () => {
        navigate('/pathways');
    };

    return (
        <DashboardShell>
            <header className="db-header">
                <h1>Your Learning Journey</h1>
                <p>Analytics Overview</p>
            </header>

            <div className="prg-stat-grid">
                {statCards.map((card) => (
                    <article key={card.label} className={`prg-stat-card ${card.accent}`}>
                        <div className="prg-stat-head">
                            <span className="prg-stat-icon" aria-hidden="true"><span className="material-symbols-outlined prg-material-icon">{card.icon}</span></span>
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
                            <p>Live activity density from the backend</p>
                        </div>
                        <div className="prg-period-switch">
                            <button type="button" className="active">14 days</button>
                            <button type="button" onClick={reviewModules}>Pathways</button>
                        </div>
                    </div>
                    <div className="prg-bar-chart">
                        <div className="prg-y-axis" aria-hidden="true">
                            <span>100%</span>
                            <span>80%</span>
                            <span>60%</span>
                            <span>40%</span>
                            <span>20%</span>
                        </div>
                        <div className="prg-bars">
                            {bars.map((bar, index) => (
                                <div key={`${bar.day}-${index}`} className="prg-bar-group">
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
                    <p>{styleResult?.dominant_style ? `${dominantStyleLabel} leads your profile` : 'Cognitive balance'}</p>
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
                        {styleResult?.dominant_style
                            ? `Your current approach favors ${dominantStyleLabel.toLowerCase()} processing.`
                            : 'Run the questionnaire to unlock a live style profile.'}
                    </p>
                </article>
            </section>

            <section className="prg-panel prg-timeline-panel">
                <div className="prg-panel-head" style={{ marginBottom: 0 }}>
                    <div>
                        <h3>RL Status</h3>
                        <p>{engineSource.toUpperCase()} engine • {assignmentGroup}</p>
                    </div>
                    <div className="prg-period-switch">
                        <button type="button" className="active" onClick={exportData}>Export</button>
                        <button type="button" onClick={reviewModules}>Review modules</button>
                    </div>
                </div>

                <div className="prg-rl-status-card">
                    <div className="prg-rl-status-head">
                        <div className="prg-rl-icon-wrap"><span className="material-symbols-outlined">neurology</span></div>
                        <div>
                            <h4>Recommendation Engine</h4>
                            <p>Live backend decisioning is active for your account.</p>
                        </div>
                    </div>
                    <div className="prg-rl-chip-row">
                        <span>{engineSource.toUpperCase()}</span>
                        <span>{assignmentGroup}</span>
                        <span>{dominantStyleLabel}</span>
                        <span>{lastRouteType}</span>
                    </div>
                </div>

                <div className="prg-timeline" style={{ marginTop: 20 }}>
                    {timeline.map((event) => (
                        <article key={event.title} className="prg-event-row">
                            <div className={`prg-event-icon ${event.active ? 'active' : ''}`}><span className="material-symbols-outlined">{event.icon}</span></div>
                            <div className="prg-event-card">
                                <div className="prg-event-head">
                                    <h4>{event.title}</h4>
                                    <time>{formatRelativeTime(event.timestamp)}</time>
                                </div>
                                <p>{event.detail}</p>
                            </div>
                        </article>
                    ))}
                    <article className="prg-event-row">
                        <div className="prg-event-icon active"><span className="material-symbols-outlined">arrow_forward</span></div>
                        <div className="prg-event-card">
                            <div className="prg-event-head">
                                <h4>Current recommendation</h4>
                                <time>{lastRoute?.recorded_at ? formatRelativeTime(new Date(lastRoute.recorded_at)) : 'live'}</time>
                            </div>
                            <p><strong>{recommendedTitle}</strong> • {recommendedType}</p>
                            <p>{recommendedContent}</p>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                                <button type="button" className="btn btn-primary" onClick={reviewModules}>Open pathways</button>
                                <button type="button" className="btn btn-soft" onClick={exportData}>Export progress</button>
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </DashboardShell>
    );
}
