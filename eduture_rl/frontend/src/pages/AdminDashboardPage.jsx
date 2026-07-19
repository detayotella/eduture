import React, { useEffect, useState } from "react";
import api from "../services/api";
import AppShell from "../components/layout/AppShell";
import { SurfaceCard } from "../components/ui/Cards";
import { styleMeta } from "../constants/learningData";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [learners, setLearners] = useState([]);
  const [showAllLearners, setShowAllLearners] = useState(false);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((response) => setStats(response.data.data))
      .catch(() => setStats(null));
    api
      .get("/admin/learners")
      .then((response) => setLearners(response.data.data))
      .catch(() => setLearners([]));
  }, []);

  const learnerUsers = learners.filter((learner) => !learner.is_admin);
  const totalLearners = stats?.total_learners ?? learnerUsers.length;
  const controlCount = stats?.assignments?.rule_based ?? 0;
  const treatmentCount = stats?.assignments?.rl_based ?? 0;
  const unassignedCount =
    stats?.unassigned_learners ??
    Math.max(0, totalLearners - controlCount - treatmentCount);
  const controlRate =
    totalLearners > 0 ? Math.round((controlCount / totalLearners) * 100) : 0;
  const treatmentRate =
    totalLearners > 0 ? Math.round((treatmentCount / totalLearners) * 100) : 0;
  const passRate = Math.round((stats?.pass_rate ?? 0) * 100);
  const completionRate = Math.round((stats?.completion_rate ?? 0) * 100);

  const chartData = [
    {
      label: "Pass rate",
      control: Math.round((stats?.control?.pass_rate ?? 0) * 100),
      treatment: Math.round((stats?.treatment?.pass_rate ?? 0) * 100),
    },
    {
      label: "Engagement",
      control: Math.round((stats?.control?.engagement ?? 0) * 100),
      treatment: Math.round((stats?.treatment?.engagement ?? 0) * 100),
    },
    {
      label: "Satisfaction",
      control: Math.round((stats?.control?.satisfaction ?? 0) * 20),
      treatment: Math.round((stats?.treatment?.satisfaction ?? 0) * 20),
    },
  ];

  const visibleLearners = showAllLearners
    ? learnerUsers
    : learnerUsers.slice(0, 6);

  const comparisonLabels = {
    pass_rate: "Pass Rate",
    post_test_score: "Post-test Score",
    completion_rate: "Completion Rate",
    satisfaction: "Satisfaction",
  };

  const comparisonEntries = Object.entries(stats?.comparisons || {}).filter(
    ([, value]) => value && Object.keys(value).length > 0,
  );

  const styleBalanceMap = learnerUsers.reduce((acc, learner) => {
    const styleKey = learner.dominant_style || "unassessed";
    const group = learner.group_assignment || "unassigned";

    if (!acc[styleKey]) {
      acc[styleKey] = {
        styleKey,
        rule_based: 0,
        rl_based: 0,
        unassigned: 0,
        total: 0,
      };
    }

    if (group === "rule_based") acc[styleKey].rule_based += 1;
    else if (group === "rl_based") acc[styleKey].rl_based += 1;
    else acc[styleKey].unassigned += 1;

    acc[styleKey].total += 1;
    return acc;
  }, {});

  const styleBalanceRows = Object.values(styleBalanceMap)
    .map((row) => ({
      ...row,
      imbalance: Math.abs((row.rule_based ?? 0) - (row.rl_based ?? 0)),
    }))
    .sort((a, b) => (b.total ?? 0) - (a.total ?? 0));

  const exerciseQuestions =
    stats?.exercise_analytics?.question_stats?.slice(0, 8) || [];

  const formatNumber = (value, digits = 3) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return value.toFixed(digits);
  };

  const formatPercent = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <AppShell
      title="A/B Testing Results"
      subtitle="Evaluation of Cognitive Routing Mechanisms"
      actions={
        <div className="ab-header-actions">
          <button className="btn btn-soft" type="button">
            View Methodology
          </button>
          <button className="btn btn-primary" type="button">
            Export Report
          </button>
        </div>
      }
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
          <p>Pass / Completion</p>
          <h3>
            {passRate}% / {completionRate}%
          </h3>
          <span>
            post-tests: {(stats?.post_test_count ?? 0).toLocaleString()} •
            unassigned: {unassignedCount.toLocaleString()}
          </span>
        </SurfaceCard>
      </section>

      <section className="ab-main-grid">
        <SurfaceCard className="ab-chart-card">
          <div className="ab-chart-head">
            <h3>Group Performance Comparison</h3>
            <span>
              Post-test sample sizes • Rule n={stats?.control?.post_test_count ?? 0} • RL n={stats?.treatment?.post_test_count ?? 0}
            </span>
          </div>
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
                      <span
                        className="ab-bar control"
                        style={{ height: `${entry.control}%` }}
                        data-value={`${entry.control}%`}
                        title={`Rule-Based: ${entry.control}%`}
                      />
                      <span
                        className="ab-bar treatment"
                        style={{ height: `${entry.treatment}%` }}
                        data-value={`${entry.treatment}%`}
                        title={`RL-Based: ${entry.treatment}%`}
                      />
                    </div>
                    <span className="ab-bar-label">{entry.label}</span>
                    <span className="ab-bar-values">Rule {entry.control}% • RL {entry.treatment}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="ab-legend">
            <span>
              <i className="legend-swatch control" />
              Rule-Based
            </span>
            <span>
              <i className="legend-swatch treatment" />
              RL-Based
            </span>
          </div>
        </SurfaceCard>

        <SurfaceCard className="ab-learners-card">
          <div className="ab-learners-head">
            <h3>Learner Details</h3>
            <button className="btn btn-soft" type="button">
              Filter
            </button>
          </div>
          <div className="ab-learners-list">
            {visibleLearners.map((learner) => {
              const styleKey =
                learner.dominant_style && styleMeta[learner.dominant_style]
                  ? learner.dominant_style
                  : null;
              const styleLabel = styleKey
                ? styleMeta[styleKey].label
                : "Unassessed";
              const styleColor = styleKey
                ? styleMeta[styleKey].color
                : "#727785";

              const groupLabel = learner.group_assignment
                ? learner.group_assignment === "rl_based"
                  ? "RL-Based"
                  : "Rule-Based"
                : "Unassigned";

              return (
                <article key={learner.learner_id} className="ab-learner-row">
                  <div className="ab-learner-main">
                    <h4>{learner.full_name}</h4>
                    <p className="ab-learner-email">
                      {learner.email || "No email"}
                    </p>
                  </div>

                  <div className="ab-chip-row">
                    <div
                      className={`ab-group-chip ${learner.group_assignment || "unassigned"}`}
                    >
                      {groupLabel}
                    </div>
                    {learner.is_admin ? (
                      <div className="ab-group-chip admin">Admin</div>
                    ) : null}
                    <div
                      className="ab-style-chip"
                      style={{
                        color: styleColor,
                        borderColor: `${styleColor}40`,
                        background: `${styleColor}1A`,
                      }}
                    >
                      <span
                        className="ab-style-dot"
                        style={{ backgroundColor: styleColor }}
                      />
                      <span>{styleLabel}</span>
                    </div>
                  </div>
                </article>
              );
            })}
            {visibleLearners.length === 0 ? (
              <p className="ab-empty">No learner data yet.</p>
            ) : null}
          </div>
          {learnerUsers.length > 6 ? (
            <button
              className="ab-view-all"
              type="button"
              onClick={() => setShowAllLearners((prev) => !prev)}
            >
              {showAllLearners
                ? "Show Top 6"
                : `View All Data (${learnerUsers.length})`}
            </button>
          ) : null}
        </SurfaceCard>
      </section>

      <SurfaceCard className="ab-comparison-card">
        <div className="ab-comparison-head">
          <h3>Per-Style Group Balance</h3>
          <span>{styleBalanceRows.length} style buckets</span>
        </div>

        <div className="ab-learners-list" style={{ marginTop: 12 }}>
          {styleBalanceRows.map((row) => {
            const styleLabel =
              row.styleKey === "unassessed"
                ? "Unassessed"
                : (styleMeta[row.styleKey]?.label ?? row.styleKey);

            return (
              <article key={row.styleKey} className="ab-learner-row">
                <div className="ab-learner-main">
                  <h4>{styleLabel}</h4>
                  <p className="ab-learner-email">
                    Total learners: {(row.total ?? 0).toLocaleString()} • Imbalance (|Rule - RL|): {(row.imbalance ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="ab-chip-row">
                  <div className="ab-group-chip rule_based">
                    Rule: {(row.rule_based ?? 0).toLocaleString()}
                  </div>
                  <div className="ab-group-chip rl_based">
                    RL: {(row.rl_based ?? 0).toLocaleString()}
                  </div>
                  <div className="ab-group-chip unassigned">
                    Unassigned: {(row.unassigned ?? 0).toLocaleString()}
                  </div>
                </div>
              </article>
            );
          })}
          {styleBalanceRows.length === 0 ? (
            <p className="ab-metric-empty">No style-assignment data available yet.</p>
          ) : null}
        </div>
      </SurfaceCard>

      <SurfaceCard className="ab-comparison-card">
        <div className="ab-comparison-head">
          <h3>Exercise Question Analytics</h3>
          <span>{(stats?.exercise_analytics?.assessment_count ?? 0).toLocaleString()} exercise assessments</span>
        </div>

        <div className="ab-learners-list" style={{ marginTop: 12 }}>
          {exerciseQuestions.map((row) => (
            <article key={row.question_id} className="ab-learner-row">
              <div className="ab-learner-main">
                <h4>{row.question || row.question_id}</h4>
                <p className="ab-learner-email">
                  Attempts: {(row.attempts ?? 0).toLocaleString()} • Accuracy: {Math.round((row.accuracy ?? 0) * 100)}%
                </p>
              </div>
              <div className="ab-chip-row">
                <div className="ab-group-chip rule_based">
                  Rule: {Math.round(((row.by_group?.rule_based?.accuracy ?? 0) * 100))}%
                </div>
                <div className="ab-group-chip rl_based">
                  RL: {Math.round(((row.by_group?.rl_based?.accuracy ?? 0) * 100))}%
                </div>
              </div>
            </article>
          ))}
          {exerciseQuestions.length === 0 ? (
            <p className="ab-metric-empty">No exercise question analytics yet.</p>
          ) : null}
        </div>
      </SurfaceCard>

      <SurfaceCard className="ab-comparison-card">
        <div className="ab-comparison-head">
          <h3>Comparison Snapshot</h3>
          <span>{comparisonEntries.length} metrics</span>
        </div>

        <div className="ab-comparison-grid">
          {comparisonEntries.map(([key, value]) => {
            const pValue =
              typeof value.p_value === "number" ? value.p_value : null;
            const isSignificant = pValue !== null && pValue < 0.05;
            return (
              <article key={key} className="ab-comparison-metric">
                <div className="ab-comparison-metric-head">
                  <h4>{comparisonLabels[key] || key.replaceAll("_", " ")}</h4>
                  <span
                    className={`ab-sig-chip ${isSignificant ? "yes" : "no"}`}
                  >
                    {pValue === null
                      ? "Pending"
                      : isSignificant
                        ? "Significant"
                        : "Not significant"}
                  </span>
                </div>

                {value.error ? (
                  <p className="ab-metric-empty">{value.error}</p>
                ) : (
                  <div className="ab-metric-values">
                    <div className="ab-metric-row">
                      <span>P-value</span>
                      <strong>{formatNumber(value.p_value)}</strong>
                    </div>
                    {"mean_diff" in value ? (
                      <div className="ab-metric-row">
                        <span>Mean diff</span>
                        <strong>{formatNumber(value.mean_diff, 2)}</strong>
                      </div>
                    ) : null}
                    {"cohens_d" in value ? (
                      <div className="ab-metric-row">
                        <span>Effect size (d)</span>
                        <strong>{formatNumber(value.cohens_d, 2)}</strong>
                      </div>
                    ) : null}
                    {"method" in value ? (
                      <div className="ab-metric-row">
                        <span
                          title="Fisher exact is used when expected counts in the 2×2 table are small (any cell expected count < 5). Chi-square is used for larger samples."
                        >
                          Method ⓘ
                        </span>
                        <strong>
                          {value.method === "fisher_exact"
                            ? "Fisher exact"
                            : value.method === "chi_square"
                              ? "Chi-square"
                              : String(value.method)}
                        </strong>
                      </div>
                    ) : null}
                    {typeof value.chi2 === "number" ? (
                      <div className="ab-metric-row">
                        <span>Chi-square</span>
                        <strong>{formatNumber(value.chi2, 2)}</strong>
                      </div>
                    ) : null}
                    {"odds_ratio" in value && typeof value.odds_ratio === "number" ? (
                      <div className="ab-metric-row">
                        <span>Odds ratio</span>
                        <strong>{formatNumber(value.odds_ratio, 2)}</strong>
                      </div>
                    ) : null}
                    {"proportion1" in value ? (
                      <div className="ab-metric-row">
                        <span>Control proportion</span>
                        <strong>{formatPercent(value.proportion1)}</strong>
                      </div>
                    ) : null}
                    {"proportion2" in value ? (
                      <div className="ab-metric-row">
                        <span>Treatment proportion</span>
                        <strong>{formatPercent(value.proportion2)}</strong>
                      </div>
                    ) : null}
                    {"absolute_lift" in value ? (
                      <div className="ab-metric-row">
                        <span>Absolute lift</span>
                        <strong>{formatPercent(value.absolute_lift)}</strong>
                      </div>
                    ) : null}
                  </div>
                )}
              </article>
            );
          })}
          {comparisonEntries.length === 0 ? (
            <p className="ab-metric-empty">No comparison data available yet.</p>
          ) : null}
        </div>
      </SurfaceCard>
    </AppShell>
  );
}
