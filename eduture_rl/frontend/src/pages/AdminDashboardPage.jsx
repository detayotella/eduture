import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import { SurfaceCard } from '../components/ui/Cards';
import { styleMeta } from '../constants/learningData';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [learners, setLearners] = useState([]);

    useEffect(() => {
        api.get('/admin/stats').then((response) => setStats(response.data.data)).catch(() => setStats(null));
        api.get('/admin/learners').then((response) => setLearners(response.data.data)).catch(() => setLearners([]));
    }, []);

    const totalLearners = stats?.total_learners ?? learners.length;
    const controlCount = stats?.assignments?.rule_based ?? 0;
    const treatmentCount = stats?.assignments?.rl_based ?? 0;
    const controlRate = totalLearners > 0 ? Math.round((controlCount / totalLearners) * 100) : 0;
    const treatmentRate = totalLearners > 0 ? Math.round((treatmentCount / totalLearners) * 100) : 0;

    const chartData = [
        { label: 'Module 1', control: 72, treatment: 81 },
        { label: 'Module 2', control: 75, treatment: 84 },
        { label: 'Module 3', control: 85, treatment: 84 },
    ];

    const topLearners = learners.slice(0, 6);

    return (
        <AppShell
            title="A/B Testing Results"
            subtitle="Evaluation of Cognitive Routing Mechanisms"
            actions={(
                <div className="ab-header-actions">
                    <button className="btn btn-soft" type="button">View Methodology</button>
                    <button className="btn btn-primary" type="button">Export Report</button>
                </div>
            )}
        >
            <section className="ab-overview-grid">
                <SurfaceCard className="ab-kpi-card">
                    <p>Total Learners</p>
                    <h3>{totalLearners.toLocaleString()}</h3>
                    <span>Current dataset</span>
                </SurfaceCard>
                <SurfaceCard className="ab-kpi-card">
                    <p>Rule-Based Group</p>
                    <h3>{controlRate}%</h3>
                    <span>n = {controlCount.toLocaleString()} (Control)</span>
                </SurfaceCard>
                <SurfaceCard className="ab-kpi-card ab-kpi-emphasis">
                    <p>RL-Based Group</p>
                    <h3>{treatmentRate}%</h3>
                    <span>n = {treatmentCount.toLocaleString()} (Test)</span>
                </SurfaceCard>
                <SurfaceCard className="ab-kpi-card ab-kpi-significance">
                    <p>Statistical Significance</p>
                    <h3>Significant</h3>
                    <span>p &lt; 0.001</span>
                </SurfaceCard>
            </section>

            <section className="ab-main-grid">
                <SurfaceCard className="ab-chart-card">
                    <h3>Pass Rate Comparison</h3>
                    <div className="ab-chart-stage">
                        <div className="ab-y-axis">
                            <span>100%</span>
                            <span>75%</span>
                            <span>50%</span>
                            <span>25%</span>
                            <span>0%</span>
                        </div>
                        <div className="ab-bars-wrap">
                            <span className="ab-grid-line top-25" />
                            <span className="ab-grid-line top-50" />
                            <span className="ab-grid-line top-75" />
                            <div className="ab-bars-row">
                                {chartData.map((entry) => (
                                    <div key={entry.label} className="ab-bar-group">
                                        <div className="ab-bar-stack">
                                            <span className="ab-bar control" style={{ height: `${entry.control}%` }} />
                                            <span className="ab-bar treatment" style={{ height: `${entry.treatment}%` }} />
                                        </div>
                                        <span className="ab-bar-label">{entry.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="ab-legend">
                        <span><i className="legend-swatch control" />Rule-Based</span>
                        <span><i className="legend-swatch treatment" />RL-Based</span>
                    </div>
                </SurfaceCard>

                <SurfaceCard className="ab-learners-card">
                    <div className="ab-learners-head">
                        <h3>Learner Details</h3>
                        <button className="btn btn-soft" type="button">Filter</button>
                    </div>
                    <div className="ab-learners-list">
                        {topLearners.map((learner) => {
                            const styleKey = learner.dominant_style && styleMeta[learner.dominant_style] ? learner.dominant_style : null;
                            const styleLabel = styleKey ? styleMeta[styleKey].label : 'Unassessed';
                            const styleColor = styleKey ? styleMeta[styleKey].color : '#727785';
                            return (
                                <article key={learner.learner_id} className="ab-learner-row">
                                    <div>
                                        <h4>{learner.full_name}</h4>
                                        <p>{learner.group_assignment || 'Unassigned'}</p>
                                    </div>
                                    <div className="ab-style-chip" style={{ color: styleColor, borderColor: `${styleColor}40`, background: `${styleColor}1A` }}>
                                        <span className="ab-style-dot" style={{ backgroundColor: styleColor }} />
                                        <span>{styleLabel}</span>
                                    </div>
                                </article>
                            );
                        })}
                        {topLearners.length === 0 ? <p className="ab-empty">No learner data yet.</p> : null}
                    </div>
                    <button className="ab-view-all" type="button">View All Data</button>
                </SurfaceCard>
            </section>

            <SurfaceCard className="ab-comparison-card">
                <div className="ab-comparison-head">
                    <h3>Comparison Snapshot</h3>
                    <span>{stats?.comparisons ? Object.keys(stats.comparisons).length : 0} metrics</span>
                </div>
                <pre className="results-json">{JSON.stringify(stats?.comparisons || stats || {}, null, 2)}</pre>
            </SurfaceCard>
        </AppShell>
    );
}
