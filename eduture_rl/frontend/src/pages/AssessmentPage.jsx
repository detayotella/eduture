import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { assessmentQuestions, getCurrentLearnerId } from '../constants/learningData';

function renderStatusItems(total, currentIndex, selected, flagged) {
    if (total <= 8) {
        return Array.from({ length: total }, (_, i) => i);
    }

    const base = [0, 1, 2, 3, currentIndex, currentIndex + 1, currentIndex + 2, total - 1]
        .filter((v) => v >= 0 && v < total);
    const unique = Array.from(new Set(base)).sort((a, b) => a - b);

    const result = [];
    unique.forEach((value, idx) => {
        result.push(value);
        const next = unique[idx + 1];
        if (next !== undefined && next - value > 1) {
            result.push('ellipsis-' + value);
        }
    });
    return result;
}

export default function AssessmentPage() {
    const { type } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const routeType = type || (location.pathname.startsWith('/preview/assessment') ? 'pre-test' : 'pre-test');

    const [hasStarted, setHasStarted] = useState(routeType !== 'pre-test');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState({});
    const [flagged, setFlagged] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const assessmentDurationSeconds = 25 * 60;
    const [remainingSeconds, setRemainingSeconds] = useState(assessmentDurationSeconds);

    const totalQuestions = assessmentQuestions.length;
    const currentQuestion = assessmentQuestions[currentIndex];

    useEffect(() => {
        setHasStarted(routeType !== 'pre-test');
    }, [routeType]);

    useEffect(() => {
        if (!hasStarted || submitting) {
            return undefined;
        }

        const timer = setInterval(() => {
            setRemainingSeconds((value) => Math.max(0, value - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [hasStarted, submitting]);

    const formatCountdown = (seconds) => {
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const completeAssessment = useCallback(async () => {
        setSubmitting(true);
        try {
            const totalCorrect = assessmentQuestions.reduce((count, question) => count + (selected[question.id] === question.answer ? 1 : 0), 0);
            const finalScore = Math.round((totalCorrect / totalQuestions) * 100);
            const elapsedMinutes = Math.max(1, Math.ceil((assessmentDurationSeconds - remainingSeconds) / 60));

            await api.post(routeType === 'post-test' ? '/assessment/post-test' : '/assessment/pre-test', {
                learner_id: getCurrentLearnerId(user),
                module_id: 'icdl-essentials',
                content_id: 1,
                score: finalScore,
                responses: selected,
                completion_time_minutes: elapsedMinutes,
                satisfaction_rating: 4,
            });

            navigate('/dashboard');
        } finally {
            setSubmitting(false);
        }
    }, [assessmentDurationSeconds, navigate, remainingSeconds, routeType, selected, totalQuestions, user]);

    useEffect(() => {
        if (!hasStarted || submitting || remainingSeconds > 0) {
            return;
        }
        completeAssessment();
    }, [completeAssessment, hasStarted, remainingSeconds, submitting]);

    const statusItems = useMemo(
        () => renderStatusItems(totalQuestions, currentIndex, selected, flagged),
        [totalQuestions, currentIndex, selected, flagged],
    );

    const chooseOption = (optionIndex) => {
        setSelected((previous) => ({ ...previous, [currentQuestion.id]: optionIndex }));
    };

    const toggleFlag = () => {
        setFlagged((previous) => ({ ...previous, [currentQuestion.id]: !previous[currentQuestion.id] }));
    };

    const goNext = async () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((value) => value + 1);
            return;
        }

        await completeAssessment();
    };

    if (!hasStarted) {
        return (
            <div className="prea-shell">
                <header className="prea-top">
                    <div className="prea-brand">EDUTURE 2.0</div>
                    <button className="prea-exit" type="button" onClick={() => navigate('/dashboard')}>
                        <span className="material-symbols-outlined">close</span>
                        Exit
                    </button>
                </header>

                <main className="prea-main">
                    <div className="prea-blob prea-blob-left" />
                    <div className="prea-blob prea-blob-right" />

                    <div className="prea-card">
                        <div className="prea-head">
                            <div className="prea-kicker">Pre-Assessment</div>
                            <h1 className="prea-title">Module Assessment:<br />Computer Essentials</h1>
                            <p className="prea-copy">
                                Demonstrate your foundational understanding before advancing. This curates your learning path to ensure cognitive fluidity in upcoming modules.
                            </p>
                        </div>

                        <div className="prea-stats">
                            <div className="prea-stat">
                                <span className="material-symbols-outlined">format_list_numbered</span>
                                <div className="prea-stat-value">{totalQuestions}</div>
                                <div className="prea-stat-label">Questions</div>
                            </div>
                            <div className="prea-stat">
                                <span className="material-symbols-outlined">timer</span>
                                <div className="prea-stat-value">~25</div>
                                <div className="prea-stat-label">Minutes</div>
                            </div>
                            <div className="prea-stat">
                                <span className="material-symbols-outlined">verified</span>
                                <div className="prea-stat-value">75%</div>
                                <div className="prea-stat-label">Passing Score</div>
                            </div>
                        </div>

                        <div className="prea-protocols">
                            <h2>Assessment Protocols</h2>
                            <ul>
                                <li>
                                    <span className="material-symbols-outlined">flag</span>
                                    <span>You can flag questions to review later</span>
                                </li>
                                <li>
                                    <span className="material-symbols-outlined">cloud_sync</span>
                                    <span>Auto-save is active</span>
                                </li>
                            </ul>
                        </div>

                        <div className="prea-actions">
                            <button className="prea-start" type="button" onClick={() => setHasStarted(true)}>
                                I'm Ready
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <p>This helps us measure your progress. No pressure!</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="asm-shell">
            <header className="asm-topbar">
                <div className="asm-brand">EDUTURE 2.0</div>
                <div className="asm-meta">
                    <div className="asm-timer">
                        <span className="material-symbols-outlined">timer</span>
                        <span>{formatCountdown(remainingSeconds)}</span>
                    </div>
                    <div className="asm-counter">{currentIndex + 1} of {totalQuestions}</div>
                </div>
                <div className="asm-icons">
                    <button
                        className="asm-icon-btn"
                        type="button"
                        title="Notifications"
                        onClick={() => alert('Notifications will be available soon')}
                    >
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button
                        className="asm-icon-btn"
                        type="button"
                        title="Profile Settings"
                        onClick={() => navigate('/settings')}
                    >
                        <span className="material-symbols-outlined">account_circle</span>
                    </button>
                </div>
            </header>

            <main className="asm-main">
                <div className="asm-bg" />
                <div className="asm-canvas">
                    <div className="asm-chip">Hardware Basics</div>
                    <h1 className="asm-question">{currentQuestion.question}</h1>

                    <div className="asm-options">
                        {currentQuestion.options.map((option, index) => {
                            const isActive = selected[currentQuestion.id] === index;
                            return (
                                <button
                                    key={option}
                                    className={`asm-option ${isActive ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => chooseOption(index)}
                                >
                                    <span className={`asm-radio ${isActive ? 'active' : ''}`}>
                                        <span className="material-symbols-outlined">check</span>
                                    </span>
                                    <span className="asm-option-text">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            <footer className="asm-footer">
                <div className="asm-footer-row">
                    <div className="asm-left-actions">
                        <button className="asm-btn secondary" type="button" onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}>
                            <span className="material-symbols-outlined">arrow_back</span>
                            Previous
                        </button>
                        <button className="asm-btn ghost" type="button" onClick={toggleFlag}>
                            <span className="material-symbols-outlined">flag</span>
                            {flagged[currentQuestion.id] ? 'Flagged' : 'Flag for Review'}
                        </button>
                    </div>

                    <button className="asm-btn primary" type="button" onClick={goNext} disabled={submitting}>
                        {currentIndex === totalQuestions - 1 ? (submitting ? 'Submitting...' : 'Complete Topic') : 'Next'}
                        <span className="material-symbols-outlined">{currentIndex === totalQuestions - 1 ? 'check' : 'arrow_forward'}</span>
                    </button>
                </div>

                <div className="asm-status-grid">
                    {statusItems.map((entry) => {
                        if (typeof entry === 'string') {
                            return <span key={entry} className="asm-ellipsis">...</span>;
                        }
                        const question = assessmentQuestions[entry];
                        const isCurrent = entry === currentIndex;
                        const isAnswered = selected[question.id] !== undefined;
                        const isFlagged = Boolean(flagged[question.id]);
                        return (
                            <span key={question.id} className={`asm-dot ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isFlagged ? 'flagged' : ''}`}>
                                {entry + 1}
                            </span>
                        );
                    })}
                </div>
            </footer>
        </div>
    );
}
