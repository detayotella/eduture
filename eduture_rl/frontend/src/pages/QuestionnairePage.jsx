import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SurfaceCard } from '../components/ui/Cards';
import { getCurrentLearnerId, questionnaireQuestions } from '../constants/learningData';

export default function QuestionnairePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const learnerId = getCurrentLearnerId(user);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState(() => Object.fromEntries(questionnaireQuestions.map((item) => [item.id, null])));
    const [submitting, setSubmitting] = useState(false);
    const [isAdvancing, setIsAdvancing] = useState(false);
    const advanceTimerRef = useRef(null);

    const currentQuestion = questionnaireQuestions[currentIndex];
    const currentAnswer = answers[currentQuestion.id];
    const answeredCount = Object.values(answers).filter((value) => value !== null).length;
    const sectionIndex = Math.floor(currentIndex / 20);
    const sectionLabel = `Section ${sectionIndex + 1} of 4`;

    useEffect(() => () => {
        if (advanceTimerRef.current) {
            clearTimeout(advanceTimerRef.current);
        }
    }, []);

    const setAndAdvance = (value) => {
        if (isAdvancing || submitting) {
            return;
        }

        setAnswers((previous) => ({ ...previous, [currentQuestion.id]: value }));
        setIsAdvancing(true);

        if (currentIndex < questionnaireQuestions.length - 1) {
            advanceTimerRef.current = setTimeout(() => {
                setCurrentIndex((index) => index + 1);
                setIsAdvancing(false);
            }, 240);
            return;
        }

        advanceTimerRef.current = setTimeout(async () => {
            setIsAdvancing(false);
            await submitQuestionnaire();
        }, 240);
    };

    const submitQuestionnaire = async () => {
        setSubmitting(true);
        try {
            await api.post('/learning-style/submit', {
                learner_id: learnerId,
                responses: questionnaireQuestions.map((question) => ({ question_id: question.id, answer: Boolean(answers[question.id]) })),
            });
            navigate('/dashboard');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="focus-shell">
            <header className="focus-header glass-header">
                <div className="shell-brand">
                    <div className="brand-mark" />
                    <div>
                        <div className="shell-brand-title">EDUTURE 2.0</div>
                        <div className="shell-brand-subtitle">Questionnaire</div>
                    </div>
                </div>
                <button className="btn btn-soft" type="button" onClick={() => navigate('/dashboard')}>Exit</button>
            </header>

            <main className="focus-main">
                <div className="focus-progress-block">
                    <div className="focus-meta-row">
                        <div className="focus-meta-label">{sectionLabel}</div>
                        <div className="focus-meta-label muted">{questionnaireQuestions.length - answeredCount} remaining</div>
                    </div>
                    <div className="segmented-progress">
                        {Array.from({ length: 4 }, (_, blockIndex) => {
                            const start = blockIndex * 20;
                            const block = questionnaireQuestions.slice(start, start + 20);
                            const blockComplete = block.filter((item) => answers[item.id] !== null).length;
                            return <span key={blockIndex} className="segment"><span style={{ width: `${(blockComplete / 20) * 100}%` }} /></span>;
                        })}
                    </div>
                </div>

                <SurfaceCard className="focus-card">
                    <div className="focus-question-index">Question {currentIndex + 1} of {questionnaireQuestions.length}</div>
                    <h1 className="focus-question-text">{currentQuestion.text}</h1>
                    <div className="question-buttons">
                        <button
                            className={`choice-button choice-yes ${currentAnswer === true ? 'is-selected' : ''}`}
                            type="button"
                            disabled={isAdvancing || submitting}
                            onClick={() => setAndAdvance(true)}
                        >
                            <span className="choice-icon" aria-hidden="true">✓</span>
                            <span>Yes, that feels like me</span>
                        </button>
                        <button
                            className={`choice-button choice-no ${currentAnswer === false ? 'is-selected' : ''}`}
                            type="button"
                            disabled={isAdvancing || submitting}
                            onClick={() => setAndAdvance(false)}
                        >
                            <span className="choice-icon" aria-hidden="true">✕</span>
                            <span>No, not really</span>
                        </button>
                    </div>
                </SurfaceCard>

                <div className="focus-footer-note">Your responses adapt the learning pathway in real time.</div>

                <div className="focus-footer">
                    <button className="btn btn-soft" type="button" onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}>Previous</button>
                    <div className="focus-footer-actions">
                        <button className="btn btn-soft" type="button" onClick={() => navigate('/dashboard')}>Save &amp; Continue Later</button>
                        <button className="btn btn-primary" type="button" disabled>
                            {submitting ? 'Submitting...' : 'Tap Yes or No to Continue'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
