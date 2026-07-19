import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getCurrentLearnerId } from "../constants/learningData";

const avatarUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCMofZ6l-IiSVXFTbgUrrcOQHSGgfusYMOwHkWRvTCbPDP0nURcsFNKvMXdeGXn8noYnX0rEDMsKQdXbBLYHvnkvI_XC9VdytOuhxbt79ze7OWiDYvtkXJB2j3p_0b56Cll45ieSXd5z6wzUqbvWzOoz2cQpJAc2nw95dlEKqub1qcpITGxACjs8-WAaR5LsBvhaVvKq7cpXe9ka_KDBNZsYg_7mcO8Y6oL_fWixJPKPJUDL9aF1ERw6ZWlHp3_HPIDt9lBYxHDtS-n";

function getInitials(fullName) {
  if (!fullName) {
    return "ED";
  }
  return (
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "ED"
  );
}

const curatedImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuChH6gOEEiAlGlr50N6Y-ibYlQWfq9hXjpDp5yZO0sZgaOozfVsAZwl-3bzXf7N7RG7VQIGFI_GNu4JbvEdocKkAhH2apMcIcXYd6K9VHhPkFdXSCm7esRxoPTGC-Jjirqo3dSN4ZxzUtJRSweOAB7FoBEfe0aGZMlOMaoFCcUB07LYmE-ysq9DkWWCCjRAUTKAIkY0bKO8EaSB8KBvsOrnHzTe7ApmZzQ9BQszuX9gYHaqX7dNzgpFBOjcRN-O_-7IabsknwR6lu5L";
const pathwayImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA3GQClOvyiAcb4Sb27ZXasg3QqxhXUWkDRzP-yjEbmDEIxeudqbQr41CYHQJpsN8KXTzYCdEW-aMbfWk0OzPLM2BvwsA2MJQR95fUZz8ioOeTL0CWD3mMxtAiV2AXbI3MxKT7KsxoNSw8X7KBxY9oSXjWm5JpSfJzrXyLmIV-gS6h2Doqq47ns7ZQxN5mByLIKkTL0EeVkjIpYcTqaFIFXnvpz4Y7kI2Uj_W-xCjMSkF90XzuGvG3RxKnepTrV4xo067O9A6LBBlsg";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [summary, setSummary] = useState(null);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.trim()?.split(" ")[0] || "Learner";

  useEffect(() => {
    const learnerId = getCurrentLearnerId(user);
    if (!learnerId) {
      setRecommendation(null);
      setSummary(null);
      return;
    }

    const loadDashboardData = async () => {
      try {
        const summaryResponse = await api.get("/interaction/summary");
        const summaryData = summaryResponse.data.data;
        setSummary(summaryData);

        const completionRate = Math.max(
          0,
          Math.min(1, Number(summaryData?.completion_rate ?? 0)),
        );
        const averageQuizScore = Math.max(
          0,
          Math.min(100, Number(summaryData?.average_quiz_score ?? 0)),
        );
        const errorRate = Math.max(0, Math.min(1, 1 - averageQuizScore / 100));
        const recentDensity = Array.isArray(summaryData?.activity_density)
          ? summaryData.activity_density
          : [];
        const numericDensity = recentDensity
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));
        const engagementScore = numericDensity.length
          ? Math.max(0, Math.min(1, numericDensity.reduce((acc, value) => acc + value, 0) / (numericDensity.length * 100)))
          : 0.2;

        const recommendResponse = await api.get("/content/recommend", {
          params: {
            learner_id: learnerId,
            time_on_task: 0.5,
            error_rate: errorRate,
            revisit_count: 0,
            completion_rate: completionRate,
            engagement_score: engagementScore,
            topic_difficulty: 0.4,
          },
        });
        setRecommendation(recommendResponse.data.data);
      } catch {
        setSummary(null);
        setRecommendation(null);
      }
    };

    loadDashboardData();
  }, [user]);

  const heatValues =
    summary?.activity_density?.length === 14
      ? summary.activity_density
      : [
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "today",
        ];

  const formatCheckpointTime = (isoValue) => {
    if (!isoValue) {
      return "Upcoming";
    }
    const date = new Date(isoValue);
    const nowDate = new Date();
    const tomorrow = new Date(nowDate);
    tomorrow.setDate(nowDate.getDate() + 1);

    const timePart = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timePart}`;
    }
    return `${date.toLocaleDateString([], { weekday: "long" })}, ${timePart}`;
  };

  const checkpoints = summary?.checkpoints?.length
    ? summary.checkpoints
    : [
        { title: "Next quiz checkpoint", scheduled_at: null },
        { title: "Next practice checkpoint", scheduled_at: null },
      ];

  const profileTitle = user?.full_name || user?.email || "Learner profile";
  const profileSubtitle = user?.email || "Open settings to manage your profile";
  const currentStyle =
    summary?.dominant_style ||
    summary?.style ||
    user?.preferred_style ||
    "Adaptive";
  const activityCount = Number(summary?.interaction_count || 0);
  const masteryScore = Number(summary?.mastery_score ?? 0);
  const computedMastery = Math.max(0, Math.min(100, Math.round(masteryScore)));
  const masteryLabel = user?.is_admin
    ? "Admin access"
    : activityCount === 0
      ? "No mastery data yet"
      : `${Math.max(1, Math.round(computedMastery / 10))} / 10 mastery`;
  const profileMilestone =
    summary?.next_milestone || "Keep exploring your recommended modules";
  const profileRoute = "/settings";
  const openProfile = () => navigate(profileRoute);
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const profileAvatar = user?.avatar_url || avatarUrl;
  const recommendedTopicId =
    recommendation?.content?.topic_id || "intro-computers";
  const recommendedTitle =
    recommendation?.content?.title || "Computer Essentials";
  const recommendedReadMinutes =
    summary?.recommended_read_minutes ||
    recommendation?.content?.estimated_time_minutes ||
    45;
  const styleLabel = `${String(currentStyle).charAt(0).toUpperCase()}${String(currentStyle).slice(1)} Style`;
  const resumeProgress = Math.max(0, Math.min(100, Math.round(computedMastery)));
  const ringCircumference = 282.7;
  const ringOffset = ringCircumference * (1 - resumeProgress / 100);
  const headerSummary = user?.is_admin
    ? `You can review learners, A/B assignments, and platform analytics from the admin dashboard.`
    : `You have ${summary?.streak_days ?? 0} day streak${(summary?.streak_days ?? 0) === 1 ? "" : "s"}, ${activityCount} recorded interaction${activityCount === 1 ? "" : "s"}, and a ${styleLabel.toLowerCase()} profile. ${profileMilestone}`;
  const trajectoryItems = [
    {
      title: checkpoints[0]?.title || "Next checkpoint",
      subtitle: formatCheckpointTime(checkpoints[0]?.scheduled_at),
      value: `${resumeProgress}%`,
      done: Boolean(checkpoints[0]?.scheduled_at),
    },
    {
      title: checkpoints[1]?.title || "Upcoming practice",
      subtitle: formatCheckpointTime(checkpoints[1]?.scheduled_at),
      value: `${Math.max(0, resumeProgress - 8)}%`,
      done: Boolean(checkpoints[1]?.scheduled_at),
    },
  ];

  return (
    <div className="db-page">
      <div className="db-desktop-shell">
        <aside className="db-sidebar">
          <div className="db-logo">EDUTURE 2.0</div>
          <button
            type="button"
            className="db-profile db-profile-link db-profile-button"
            onClick={openProfile}
          >
            <div className="db-profile-avatar">
              <img src={profileAvatar} alt={profileTitle} />
              <span>{getInitials(user?.full_name)}</span>
            </div>
            <div className="db-profile-copy">
              <div className="db-profile-name">{profileTitle}</div>
              <div className="db-profile-subtitle">{profileSubtitle}</div>
              <div className="db-profile-meta">
                <span>{masteryLabel}</span>
                <span>{currentStyle}</span>
              </div>
            </div>
          </button>

          <nav className="db-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `db-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="material-symbols-outlined">home</span>
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/questionnaire"
              className={({ isActive }) =>
                `db-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="material-symbols-outlined">quiz</span>
              <span>Questionnaire</span>
            </NavLink>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `db-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="material-symbols-outlined">explore</span>
              <span>Explore</span>
            </NavLink>
            <NavLink
              to="/pathways"
              className={({ isActive }) =>
                `db-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="material-symbols-outlined">moving</span>
              <span>Pathways</span>
            </NavLink>
            <NavLink
              to="/achievements"
              className={({ isActive }) =>
                `db-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="material-symbols-outlined">
                workspace_premium
              </span>
              <span>Achievements</span>
            </NavLink>
            <NavLink
              to="/progress"
              className={({ isActive }) =>
                `db-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="material-symbols-outlined">trending_up</span>
              <span>Progress</span>
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `db-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="material-symbols-outlined">settings</span>
              <span>Settings</span>
            </NavLink>
            {user?.is_admin ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `db-nav-item ${isActive ? "active" : ""}`
                }
              >
                <span className="material-symbols-outlined">
                  admin_panel_settings
                </span>
                <span>Admin</span>
              </NavLink>
            ) : null}
          </nav>

          <div className="db-bottom-actions">
            <button type="button" className="db-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <main className="db-main">
          <div className="db-main-inner">
            <header className="db-header">
              <h1>
                {greeting}, {firstName}.
              </h1>
              <p>{headerSummary}</p>
            </header>

            <section className="db-resume">
              <div className="db-resume-copy">
                <div className="db-resume-chip">
                  <span className="material-symbols-outlined">play_circle</span>
                  <span>Resume Focus</span>
                </div>
                <h2>{recommendedTitle}</h2>
                <div className="db-progress-row">
                  <div className="db-progress">
                    <span style={{ width: `${resumeProgress}%` }} />
                  </div>
                  <span>{resumeProgress}%</span>
                </div>
              </div>
              <NavLink
                className="db-primary-btn"
                to={`/learn/${recommendedTopicId}`}
              >
                Continue Learning
              </NavLink>
            </section>

            <div className="db-grid">
              <section className="db-left-stack">
                <div className="db-curated">
                  <div className="db-curated-head">
                    <h3>Personalized for Your Style</h3>
                    <div className="db-style-chip">
                      <span />
                      {styleLabel}
                    </div>
                  </div>
                  <div className="db-curated-body">
                    <img src={curatedImage} alt="Curated" />
                    <div>
                      <h4>{recommendedTitle}</h4>
                      <p>
                        Master practical computer skills with adaptive content
                        tuned to your current style and pace.
                      </p>
                      <NavLink to={`/learn/${recommendedTopicId}`}>
                        Start Module{" "}
                        <span className="material-symbols-outlined">
                          arrow_forward
                        </span>
                      </NavLink>
                    </div>
                  </div>
                </div>

                <div className="db-pathway">
                  <img src={pathwayImage} alt="Pathway" />
                  <div className="db-pathway-content">
                    <div className="db-pathway-kicker">Recommended Next</div>
                    <h3>Recommended Pathway</h3>
                    <p>
                      Continue with guided modules, assessments, and progress
                      checkpoints from your personalized track.
                    </p>
                    <div className="db-pathway-footer">
                      <div>
                        <span className="material-symbols-outlined">
                          schedule
                        </span>
                        <span>Est. {summary?.estimated_hours ?? 12} Hours</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate("/pathways")}
                      >
                        Open Pathway
                      </button>
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
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        className="db-ring-progress"
                        style={{ strokeDashoffset: ringOffset }}
                      />
                    </svg>
                    <div>{resumeProgress}%</div>
                  </div>
                  <p>
                    {activityCount === 0
                      ? "Start your first learning interaction to generate mastery insights."
                      : "Your mastery estimate is based on completion rate, quiz performance, and learning streak."}
                  </p>
                </div>

                <div className="db-heatmap-card">
                  <div className="db-heatmap-head">
                    <h4>Activity Density</h4>
                    <span>{summary?.streak_days ?? 0} Day Streak</span>
                  </div>
                  <div className="db-heatmap-grid">
                    {heatValues.map((v, idx) => (
                      <span key={idx} className={`db-heat db-heat-${v}`} />
                    ))}
                  </div>
                </div>

                <div className="db-checkpoints">
                  <h4>Critical Checkpoints</h4>
                  <div className="db-checkpoint-item">
                    <div className="db-checkpoint-icon">
                      <span className="material-symbols-outlined">quiz</span>
                    </div>
                    <div>
                      <h5>{checkpoints[0]?.title || "Architecture Quiz"}</h5>
                      <p>
                        {formatCheckpointTime(checkpoints[0]?.scheduled_at)}
                      </p>
                    </div>
                  </div>
                  <div className="db-checkpoint-item">
                    <div className="db-checkpoint-icon">
                      <span className="material-symbols-outlined">
                        assignment
                      </span>
                    </div>
                    <div>
                      <h5>{checkpoints[1]?.title || "Peer Code Review"}</h5>
                      <p>
                        {formatCheckpointTime(checkpoints[1]?.scheduled_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      <div className="db-mobile-shell">
        <header className="db-mobile-topbar">
          <button type="button" onClick={openProfile}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1>EDUTURE 2.0</h1>
          <button
            type="button"
            className="db-mobile-avatar-button"
            onClick={openProfile}
            aria-label="Open profile"
          >
            <img src={profileAvatar} alt={profileTitle} />
          </button>
        </header>

        <main className="db-mobile-main">
          <section className="db-mobile-welcome">
            <p>{user?.is_admin ? "Admin workspace" : "Adaptive learning"}</p>
            <h2>
              {greeting},<br />
              <span>{firstName}.</span>
            </h2>
          </section>

          <section className="db-mobile-hero">
            <div className="db-mobile-hero-badge">
              <span />
              In Progress
            </div>
            <h3>{recommendedTitle}</h3>
            <p>Personalized continuation module</p>
            <div className="db-mobile-hero-footer">
              <div>
                <div>
                  <span>Completion</span>
                  <strong>{resumeProgress}%</strong>
                </div>
                <div className="db-mobile-progress">
                  <span style={{ width: `${resumeProgress}%` }} />
                </div>
              </div>
              <NavLink to={`/learn/${recommendedTopicId}`}>
                Resume
                <span className="material-symbols-outlined">play_arrow</span>
              </NavLink>
            </div>
          </section>

          <section className="db-mobile-curated">
            <div className="db-mobile-section-head">
              <h3>Personalized for Your Style</h3>
              <span>
                <span className="material-symbols-outlined">tune</span>
                {styleLabel}
              </span>
            </div>
            <div className="db-mobile-bento">
              <article className="db-mobile-primary-card">
                <div className="db-mobile-primary-inner">
                  <img src={curatedImage} alt="Curated" />
                  <div>
                    <h4>{recommendedTitle}</h4>
                    <p>
                      Master practical computing concepts through guided
                      practice.
                    </p>
                    <span>{recommendedReadMinutes} MIN READ</span>
                  </div>
                </div>
              </article>
              <article
                className="db-mobile-mini-card"
                onClick={() => navigate("/pathways")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/pathways")}
              >
                <div>
                  <span className="material-symbols-outlined">
                    account_tree
                  </span>
                </div>
                <h4>Pathways</h4>
                <p>Review your route</p>
              </article>
              <article
                className="db-mobile-mini-card"
                onClick={() => navigate("/explore")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/explore")}
              >
                <div>
                  <span className="material-symbols-outlined">
                    library_books
                  </span>
                </div>
                <h4>Explore</h4>
                <p>Browse modules</p>
              </article>
            </div>
          </section>

          <section className="db-mobile-trajectory">
            <h3>Mastery Trajectory</h3>
            <div className="db-mobile-timeline">
              <div className="db-mobile-timeline-line" />
              {trajectoryItems.map((item) => (
                <div
                  key={item.title}
                  className={`db-mobile-timeline-item ${item.done ? "done" : ""}`}
                >
                  <div className="db-mobile-dot" />
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.subtitle}</p>
                  </div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <button
            type="button"
            className="db-profile-banner"
            onClick={openProfile}
          >
            <div>
              <span>Open profile</span>
              <strong>{profileTitle}</strong>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <button
            type="button"
            className="db-mobile-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </main>

        <nav className="db-mobile-bottomnav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="material-symbols-outlined">auto_stories</span>
            <span>Learn</span>
          </NavLink>
          <NavLink
            to="/explore"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="material-symbols-outlined">analytics</span>
            <span>Insights</span>
          </NavLink>
          <NavLink
            to="/achievements"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="material-symbols-outlined">military_tech</span>
            <span>Mastery</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="material-symbols-outlined">person</span>
            <span>Profile</span>
          </NavLink>
          {user?.is_admin ? (
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="material-symbols-outlined">
                admin_panel_settings
              </span>
              <span>Admin</span>
            </NavLink>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
