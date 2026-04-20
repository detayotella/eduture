import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import api from './services/api';
import { useAuth } from './context/AuthContext';

const styles = [
  { key: 'activist', label: 'Activist', color: 'var(--style-activist)' },
  { key: 'reflector', label: 'Reflector', color: 'var(--style-reflector)' },
  { key: 'theorist', label: 'Theorist', color: 'var(--style-theorist)' },
  { key: 'pragmatist', label: 'Pragmatist', color: 'var(--style-pragmatist)' },
];

const routeItems = [
  { to: '/', label: 'Landing', public: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/questionnaire', label: 'Questionnaire' },
  { to: '/progress', label: 'Progress' },
  { to: '/admin', label: 'Admin' },
];

const questionBank = Array.from({ length: 80 }, (_, index) => ({
  id: `q${index + 1}`,
  label: `Question ${index + 1}`,
  style: styles[Math.floor(index / 20)].key,
}));

const fallbackModules = [
  { module_id: 'icdl-essentials', title: 'ICDL Computer Essentials', description: 'Core hardware, software, and safe computing habits.' },
  { module_id: 'icdl-productivity', title: 'ICDL Productivity', description: 'Document workflows and hands-on productivity tasks.' },
];

function Shell({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 28 }}>
          <div className="brand-mark" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>EDUTURE 2.0</div>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>Adaptive learning platform</div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {routeItems.map((item) => {
            if (!item.public && !user) return null;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={item.to === '/'}>
                <span>{item.label}</span>
                <span>↗</span>
              </NavLink>
            );
          })}
        </div>
        <div style={{ marginTop: 28, padding: 18, borderRadius: 20, background: 'rgba(0,81,213,0.08)' }}>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>Signed in as</div>
          <div style={{ fontWeight: 600, marginTop: 6 }}>{user?.full_name || 'Guest'}</div>
          <button className="btn btn-soft" style={{ marginTop: 12, width: '100%' }} onClick={logout} type="button">
            Logout
          </button>
        </div>
      </aside>
      <main className="main-shell">{children}</main>
    </div>
  );
}

function Topbar({ title, subtitle, actions }) {
  return (
    <div className="topbar">
      <div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>{subtitle}</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em' }}>{title}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{actions}</div>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="auth-grid" style={{ minHeight: '100vh' }}>
      <section className="auth-visual">
        <div className="pill" style={{ background: 'rgba(255,255,255,0.14)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>Adaptive learning for ICDL</div>
        <h1 style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', lineHeight: 0.95, marginTop: 18, maxWidth: 620 }}>Learn with a system that adjusts in real time.</h1>
        <p style={{ maxWidth: 620, fontSize: 18, lineHeight: 1.7, opacity: 0.9 }}>
          EDUTURE 2.0 blends structured content, learning-style insight, and contextual bandit recommendations to guide each learner through theory, examples, activities, and exercises.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" type="button" onClick={() => navigate('/register')}>Start learning</button>
          <button className="btn btn-soft" type="button" onClick={() => navigate('/login')}>Sign in</button>
        </div>
        <div className="grid-12" style={{ marginTop: 36 }}>
          {['Register', 'Assess', 'Adapt', 'Master'].map((item, index) => (
            <div key={item} className="card pad" style={{ gridColumn: 'span 3', background: 'rgba(255,255,255,0.12)', color: 'white' }}>
              <div style={{ fontSize: 13, opacity: 0.75 }}>0{index + 1}</div>
              <div style={{ fontSize: 21, fontWeight: 700, marginTop: 10 }}>{item}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="auth-panel">
        <div className="form-shell">
          <div className="pill" style={{ marginBottom: 16 }}>Research-ready adaptive learning</div>
          <h2 style={{ fontSize: 42, margin: 0, letterSpacing: '-0.04em' }}>Calm, focused, measurable.</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            The interface is built around mastery progression, frictionless assessment, and clear admin analytics.
          </p>
          <div className="grid-12" style={{ marginTop: 24 }}>
            <div className="card pad" style={{ gridColumn: 'span 6' }}>
              <div className="metric"><div className="metric-value">80</div><div className="metric-label">Learning style questions</div></div>
            </div>
            <div className="card pad" style={{ gridColumn: 'span 6' }}>
              <div className="metric"><div className="metric-value">50/50</div><div className="metric-label">Rule vs RL split</div></div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
            <button className="btn btn-primary" type="button" onClick={() => navigate('/register')}>Create learner account</button>
            <button className="btn btn-soft" type="button" onClick={() => navigate('/dashboard')}>Open dashboard</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const isLogin = mode === 'login';

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.full_name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail?.message || err.response?.data?.message || 'Unable to authenticate right now.');
    }
  };

  return (
    <div className="auth-grid">
      <section className="auth-visual">
        <div className="pill" style={{ background: 'rgba(255,255,255,0.14)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>{isLogin ? 'Welcome back' : 'Join the learner flow'}</div>
        <h1 style={{ fontSize: 'clamp(3rem, 7vw, 4.8rem)', lineHeight: 0.95, marginTop: 18 }}>A precise learning environment with room to breathe.</h1>
        <p style={{ maxWidth: 620, fontSize: 18, lineHeight: 1.7, opacity: 0.9 }}>
          Register once, complete the questionnaire, then move through adaptive content that matches your learning profile and performance signals.
        </p>
      </section>
      <section className="auth-panel">
        <form className="form-shell" onSubmit={submit}>
          <div className="pill">{isLogin ? 'Login' : 'Register'}</div>
          <h2 style={{ fontSize: 38, marginTop: 16, marginBottom: 10 }}>{isLogin ? 'Sign in to continue' : 'Create your account'}</h2>
          <p style={{ color: 'var(--muted)', marginTop: 0 }}>{isLogin ? 'Continue where you left off.' : 'Set up access and start the assessment flow.'}</p>
          {!isLogin && (
            <div className="field">
              <label>Full name</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="SecurePass123!" />
          </div>
          {error ? <div className="card pad" style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(254,242,242,0.9)', color: '#991b1b', marginBottom: 16 }}>{error}</div> : null}
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>{isLogin ? 'Sign in' : 'Create account'}</button>
          <button className="btn btn-soft" type="button" onClick={() => navigate(isLogin ? '/register' : '/login')} style={{ width: '100%', marginTop: 12 }}>
            {isLogin ? 'Need an account?' : 'Already have an account?'}
          </button>
        </form>
      </section>
    </div>
  );
}

function QuestionnairePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const learnerId = user?.learner_id || 0;
  const [answers, setAnswers] = useState(() => Object.fromEntries(questionBank.map((q) => [q.id, null])));
  const [loading, setLoading] = useState(false);
  const answeredCount = Object.values(answers).filter((value) => value !== null).length;
  const progress = Math.round((answeredCount / questionBank.length) * 100);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/learning-style/submit', {
        learner_id: learnerId,
        responses: questionBank.map((question) => ({ question_id: question.id, answer: Boolean(answers[question.id]) })),
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <Topbar
        title="Questionnaire"
        subtitle="Honey & Mumford learning styles"
        actions={[<span key="1" className="pill">{answeredCount}/80 answered</span>, <span key="2" className="pill">{progress}% complete</span>]}
      />
      <div className="hero" style={{ marginTop: 20 }}>
        <div className="grid-12">
          <div style={{ gridColumn: 'span 8' }}>
            <h2 style={{ marginTop: 0, fontSize: 32 }}>Answer quickly and honestly.</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, maxWidth: 620 }}>
              Each block maps to one of the four Honey & Mumford styles. The flow is intentionally lightweight so the learner can move through it without friction.
            </p>
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <div className="card pad">
              <div className="metric"><div className="metric-value">80</div><div className="metric-label">Yes/No questions</div></div>
            </div>
          </div>
        </div>
        <div className="progress" style={{ marginTop: 18 }}><span style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="grid-12" style={{ marginTop: 20 }}>
        {questionBank.map((question, index) => (
          <div key={question.id} className="question-card" style={{ gridColumn: 'span 6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div className="tag">{question.style}</div>
                <h3 style={{ marginBottom: 8 }}>{question.label}</h3>
                <div style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Question group {index + 1} of 80. Answer yes or no.</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
                <button className={`btn ${answers[question.id] === true ? 'btn-primary' : 'btn-soft'}`} type="button" onClick={() => setAnswers({ ...answers, [question.id]: true })}>Yes</button>
                <button className={`btn ${answers[question.id] === false ? 'btn-primary' : 'btn-soft'}`} type="button" onClick={() => setAnswers({ ...answers, [question.id]: false })}>No</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
        <button className="btn btn-primary" type="button" onClick={submit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit questionnaire'}
        </button>
      </div>
    </Shell>
  );
}

function DashboardPage() {
  const [modules, setModules] = useState(fallbackModules);
  const [recommendation, setRecommendation] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/content/modules').then((response) => setModules(response.data.data)).catch(() => setModules(fallbackModules));
    api
      .get('/content/recommend', {
        params: { time_on_task: 0.5, error_rate: 0.2, revisit_count: 0.1, completion_rate: 0.2, engagement_score: 0.6, topic_difficulty: 0.4 },
      })
      .then((response) => setRecommendation(response.data.data))
      .catch(() => setRecommendation(null));
  }, [user]);

  return (
    <Shell>
      <Topbar
        title="Dashboard"
        subtitle="Learner overview"
        actions={[
          <span key="1" className="pill">Adaptive path ready</span>,
          <NavLink key="2" to="/questionnaire" className="btn btn-primary">Review style</NavLink>,
        ]}
      />
      <div className="hero">
        <div className="grid-12">
          <div style={{ gridColumn: 'span 7' }}>
            <div className="pill">Next recommended step</div>
            <h2 style={{ fontSize: 34, marginBottom: 8 }}>{recommendation?.content?.title || 'Computer Essentials'}</h2>
            <p style={{ color: 'var(--muted)', maxWidth: 620, lineHeight: 1.7 }}>
              {recommendation?.content?.content_data || 'A guided module that uses the learner profile and group assignment to determine the next best step.'}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <NavLink to={`/learn/${recommendation?.content?.topic_id || 'computer-basics'}`} className="btn btn-primary">Open learning view</NavLink>
              <NavLink to="/assessment/pre-test" className="btn btn-soft">Start pre-test</NavLink>
            </div>
          </div>
          <div style={{ gridColumn: 'span 5' }}>
            <div className="card pad" style={{ height: '100%' }}>
              <div className="metric"><div className="metric-value">{recommendation?.group || 'rule_based'}</div><div className="metric-label">Assigned group</div></div>
              <div style={{ marginTop: 18 }} className="progress"><span style={{ width: '64%' }} /></div>
              <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
                <div className="pill">Theory</div>
                <div className="pill">Example</div>
                <div className="pill">Activity</div>
                <div className="pill">Exercise</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid-12" style={{ marginTop: 20 }}>
        {[
          { label: 'Modules available', value: modules.length },
          { label: 'Completion', value: '72%' },
          { label: 'Satisfaction', value: '4.7/5' },
          { label: 'Pass rate', value: '89%' },
        ].map((metric) => (
          <div key={metric.label} className="card pad" style={{ gridColumn: 'span 3' }}>
            <div className="metric"><div className="metric-value">{metric.value}</div><div className="metric-label">{metric.label}</div></div>
          </div>
        ))}
      </div>
      <div className="grid-12" style={{ marginTop: 20 }}>
        {modules.map((module) => (
          <div key={module.module_id} className="card pad" style={{ gridColumn: 'span 6' }}>
            <div className="pill">Module</div>
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>{module.title}</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{module.description}</p>
            <NavLink className="btn btn-soft" to={`/learn/${module.module_id}`} style={{ marginTop: 8 }}>Open module</NavLink>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function LearningPage() {
  const { topicId } = useParams();
  const [tab, setTab] = useState('theory');
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.get('/content/recommend', { params: { time_on_task: 0.5, error_rate: 0.2, revisit_count: 0.1, completion_rate: 0.5, engagement_score: 0.7, topic_difficulty: 0.4 } })
      .then((response) => setContent(response.data.data.content))
      .catch(() => setContent(null));
  }, [topicId]);

  return (
    <Shell>
      <Topbar title="Learning view" subtitle={topicId} actions={[<span key="1" className="pill">Adaptive content</span>]} />
      <div className="grid-12" style={{ marginTop: 20 }}>
        <div style={{ gridColumn: 'span 8' }} className="card pad">
          <div className="tab-group">
            {['theory', 'example', 'activity', 'exercise'].map((item) => (
              <button key={item} className={`tab ${tab === item ? 'active' : ''}`} type="button" onClick={() => setTab(item)}>{item}</button>
            ))}
          </div>
          <h2 style={{ fontSize: 32, marginBottom: 8 }}>{content?.title || 'Learning content'}</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, maxWidth: 65 }}>
            {content?.content_data || 'The selected content appears here. The design intentionally keeps reading space comfortable and focused.'}
          </p>
          <div className="card pad" style={{ marginTop: 18, background: 'rgba(0,81,213,0.05)' }}>
            <div className="pill">Current mode</div>
            <p style={{ marginBottom: 0, lineHeight: 1.7 }}>
              The learner is seeing the {tab} layer. Recommendation logic can switch to a different layer based on engagement signals.
            </p>
          </div>
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <div className="card pad">
            <div className="metric"><div className="metric-value">10m</div><div className="metric-label">Estimated time</div></div>
            <div className="progress" style={{ marginTop: 16 }}><span style={{ width: '58%' }} /></div>
            <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
              <div className="pill">Theory first when reflection is high</div>
              <div className="pill">Activities when engagement drops</div>
              <div className="pill">Exercises for consolidation</div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function AssessmentPage() {
  const { type } = useParams();
  const { user } = useAuth();
  const [score, setScore] = useState(72);
  const [satisfaction, setSatisfaction] = useState(4);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    const payload = {
      learner_id: user?.learner_id || 0,
      module_id: 'icdl-essentials',
      content_id: 1,
      score: Number(score),
      responses: { q1: 'A', q2: 'B' },
      completion_time_minutes: 18,
      satisfaction_rating: Number(satisfaction),
    };
    await api.post(type === 'post-test' ? '/assessment/post-test' : '/assessment/pre-test', payload);
    setSubmitted(true);
  };

  return (
    <Shell>
      <Topbar title={`${type || 'assessment'} assessment`} subtitle="Low-stakes validation" actions={[<span key="1" className="pill">{submitted ? 'Saved' : 'Ready'}</span>]} />
      <div className="grid-12" style={{ marginTop: 20 }}>
        <div style={{ gridColumn: 'span 8' }} className="card pad">
          <h2 style={{ marginTop: 0 }}>Assessment flow</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            The UI supports pre-test and post-test submissions while keeping the process calm and transparent.
          </p>
          <div className="field">
            <label>Score</label>
            <input type="range" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} />
            <div className="pill">{score}/100</div>
          </div>
          <div className="field">
            <label>Satisfaction</label>
            <input type="range" min="1" max="5" value={satisfaction} onChange={(e) => setSatisfaction(e.target.value)} />
            <div className="pill">{satisfaction}/5</div>
          </div>
          <button className="btn btn-primary" type="button" onClick={submit}>Submit {type || 'assessment'}</button>
        </div>
        <div style={{ gridColumn: 'span 4' }} className="card pad">
          <div className="pill">Result preview</div>
          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            <div className="metric"><div className="metric-value">{score >= 75 ? 'Pass' : 'Review'}</div><div className="metric-label">Threshold result</div></div>
            <div className="metric"><div className="metric-value">{satisfaction}</div><div className="metric-label">Satisfaction rating</div></div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ProgressPage() {
  const metrics = [
    { label: 'Completion', value: 72 },
    { label: 'Improvement', value: 84 },
    { label: 'Satisfaction', value: 94 },
    { label: 'Consistency', value: 67 },
  ];
  return (
    <Shell>
      <Topbar title="Progress" subtitle="Learner analytics" actions={[<span key="1" className="pill">Updated today</span>]} />
      <div className="grid-12" style={{ marginTop: 20 }}>
        {metrics.map((metric) => (
          <div key={metric.label} className="card pad" style={{ gridColumn: 'span 3' }}>
            <div className="metric"><div className="metric-value">{metric.value}%</div><div className="metric-label">{metric.label}</div></div>
            <div className="progress" style={{ marginTop: 16 }}><span style={{ width: `${metric.value}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="grid-12" style={{ marginTop: 20 }}>
        <div className="card pad" style={{ gridColumn: 'span 7' }}>
          <h3 style={{ marginTop: 0 }}>Activity feed</h3>
          {['Completed questionnaire', 'Viewed theory content', 'Answered checkpoint quiz', 'Improved post-test score'].map((entry, index) => (
            <div key={entry} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: index ? '1px solid var(--line)' : 0 }}>
              <span>{entry}</span>
              <span style={{ color: 'var(--muted)' }}>{index + 1}d ago</span>
            </div>
          ))}
        </div>
        <div className="card pad" style={{ gridColumn: 'span 5' }}>
          <h3 style={{ marginTop: 0 }}>Learning styles</h3>
          {styles.map((style) => (
            <div key={style.key} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{style.label}</span>
                <span style={{ color: style.color }}>{Math.round(Math.random() * 100)}%</span>
              </div>
              <div className="progress"><span style={{ width: `${Math.round(Math.random() * 100)}%`, background: style.color }} /></div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [learners, setLearners] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then((response) => setStats(response.data.data)).catch(() => setStats(null));
    api.get('/admin/learners').then((response) => setLearners(response.data.data)).catch(() => setLearners([]));
  }, []);

  return (
    <Shell>
      <Topbar title="Admin analytics" subtitle="A/B test comparison" actions={[<span key="1" className="pill">Research view</span>]} />
      <div className="grid-12" style={{ marginTop: 20 }}>
        {[
          { label: 'Control group', value: stats?.assignments?.rule_based ?? 0 },
          { label: 'Treatment group', value: stats?.assignments?.rl_based ?? 0 },
          { label: 'Total learners', value: stats?.total_learners ?? learners.length },
          { label: 'Available comparisons', value: stats?.comparisons ? Object.keys(stats.comparisons).length : 0 },
        ].map((metric) => (
          <div key={metric.label} className="card pad" style={{ gridColumn: 'span 3' }}>
            <div className="metric"><div className="metric-value">{metric.value}</div><div className="metric-label">{metric.label}</div></div>
          </div>
        ))}
      </div>
      <div className="grid-12" style={{ marginTop: 20 }}>
        <div className="card pad" style={{ gridColumn: 'span 7' }}>
          <h3 style={{ marginTop: 0 }}>Group comparison</h3>
          <pre style={{ overflow: 'auto', background: 'rgba(30,27,23,0.04)', padding: 16, borderRadius: 16 }}>
            {JSON.stringify(stats?.comparisons || stats, null, 2)}
          </pre>
        </div>
        <div className="card pad" style={{ gridColumn: 'span 5' }}>
          <h3 style={{ marginTop: 0 }}>Learner list</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {learners.slice(0, 6).map((learner) => (
              <div key={learner.learner_id} className="card pad" style={{ background: 'rgba(255,255,255,0.68)' }}>
                <div style={{ fontWeight: 600 }}>{learner.full_name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 14 }}>{learner.email}</div>
                <div className="pill" style={{ marginTop: 8 }}>{learner.group_assignment || 'unassigned'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/questionnaire" element={<RequireAuth><QuestionnairePage /></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/learn/:topicId" element={<RequireAuth><LearningPage /></RequireAuth>} />
      <Route path="/assessment/:type" element={<RequireAuth><AssessmentPage /></RequireAuth>} />
      <Route path="/progress" element={<RequireAuth><ProgressPage /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
    </Routes>
  );
}
