import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { learningContent, getCurrentLearnerId } from '../constants/learningData';
import { useAuth } from '../context/AuthContext';

export default function LearningPage() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const normalizeTopicKey = (key) => {
        if (!key) {
            return 'computer-basics';
        }
        if (learningContent[key]) {
            return key;
        }
        if (key === 'intro-computers') {
            return 'computer-basics';
        }
        return 'computer-basics';
    };

    const [recommendedContent, setRecommendedContent] = useState(null);
    const localContent = learningContent[normalizeTopicKey(topicId)] || learningContent['computer-basics'];
    const activity = localContent.activity || {
        title: 'Match the learning pieces',
        intro: 'Use drag-and-drop or click a component and then a target card.',
        hint: 'Pick the item that best fits the description.',
        items: [],
        targets: [],
    };
    const [contentType, setContentType] = useState('theory');
    const [activeContentId, setActiveContentId] = useState(null);
    const [submittingComplete, setSubmittingComplete] = useState(false);
    const [exerciseSatisfaction, setExerciseSatisfaction] = useState(null);

    // Timer states
    const [theoryTimer, setTheoryTimer] = useState(12 * 60); // 12 minutes
    const [activityTimer, setActivityTimer] = useState(8 * 60 + 45); // 8:45
    const [exerciseTimer, setExerciseTimer] = useState(4 * 60 + 20); // 4:20

    // State for interactions
    const [theoryMarkedAsRead, setTheoryMarkedAsRead] = useState(false);
    const [activityHintShown, setActivityHintShown] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [placements, setPlacements] = useState({});
    const [activeTargetId, setActiveTargetId] = useState(null);
    const [dragState, setDragState] = useState(null);

    useEffect(() => {
        setTheoryTimer(12 * 60);
        setActivityTimer(8 * 60 + 45);
        setExerciseTimer(4 * 60 + 20);
        setTheoryMarkedAsRead(false);
        setActivityHintShown(false);
        setSelectedAnswers({});
        setSelectedItemId(null);
        setPlacements({});
        setActiveTargetId(null);
        setDragState(null);
        setSubmittingComplete(false);
        setExerciseSatisfaction(null);

        const learnerId = getCurrentLearnerId(user);
        if (!learnerId) {
            setRecommendedContent(null);
            setActiveContentId(null);
            setContentType('theory');
            return;
        }

        api
            .get('/content/recommend', {
                params: {
                    learner_id: learnerId,
                    time_on_task: 0.5,
                    error_rate: 0.2,
                    revisit_count: 0.1,
                    completion_rate: 0.2,
                    engagement_score: 0.7,
                    topic_difficulty: 0.4,
                },
            })
            .then((response) => {
                const payload = response?.data?.data || null;
                setRecommendedContent(payload);
                setActiveContentId(payload?.content?.id || null);
                const nextType = payload?.recommended_content_type || payload?.content?.content_type || 'theory';
                setContentType(nextType === 'example' ? 'theory' : nextType);
            })
            .catch(() => {
                setRecommendedContent(null);
                setActiveContentId(null);
                setContentType('theory');
            });
    }, [topicId, user]);

    // Timer countdown effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (contentType === 'theory' && theoryTimer > 0) {
                setTheoryTimer((prev) => Math.max(0, prev - 1));
            } else if (contentType === 'activity' && activityTimer > 0) {
                setActivityTimer((prev) => Math.max(0, prev - 1));
            } else if (contentType === 'exercise' && exerciseTimer > 0) {
                setExerciseTimer((prev) => Math.max(0, prev - 1));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contentType, theoryTimer, activityTimer, exerciseTimer]);

    const [selectedAnswers, setSelectedAnswers] = useState({});

    const getItemLabel = (itemId) => activity.items.find((item) => item.id === itemId)?.label || '';

    const getTargetById = (targetId) => activity.targets.find((target) => target.id === targetId);

    const availableItems = activity.items.filter((item) => !Object.values(placements).includes(item.id));

    const getPlacedItemForTarget = (targetId) => placements[targetId] || null;

    const isTargetCorrect = (targetId, itemId) => {
        const target = getTargetById(targetId);
        const itemLabel = getItemLabel(itemId);
        return Boolean(target && itemLabel && target.correctItem === itemLabel);
    };

    const placeItemInTarget = (itemId, targetId, sourceTargetId = null) => {
        if (!itemId || !targetId) {
            return;
        }

        setPlacements((previous) => {
            const next = { ...previous };
            const currentTargetId = Object.keys(next).find((key) => next[key] === itemId) || null;
            const sourceKey = sourceTargetId || currentTargetId;
            const occupant = next[targetId] || null;

            if (currentTargetId === targetId) {
                return previous;
            }

            if (currentTargetId) {
                delete next[currentTargetId];
            }

            if (occupant && occupant !== itemId) {
                if (sourceKey && sourceKey !== targetId) {
                    next[sourceKey] = occupant;
                }
            }

            next[targetId] = itemId;
            return next;
        });

        setSelectedItemId(null);
        setDragState(null);
    };

    const handleDragStart = (itemId, sourceTargetId = null) => (event) => {
        setSelectedItemId(itemId);
        setDragState({ itemId, sourceTargetId });
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', itemId);
    };

    const handleDragEnd = () => {
        setDragState(null);
        setActiveTargetId(null);
    };

    const selectedItemLabel = selectedItemId ? getItemLabel(selectedItemId) : null;
    const placedCount = Object.keys(placements).length;

    const recommendedFragment = recommendedContent?.content || null;
    const renderData = recommendedFragment?.render_data || null;

    const renderedTitle = recommendedFragment?.title || renderData?.title || localContent.title;
    const renderedBody = renderData?.body || recommendedFragment?.content_data || localContent.body;
    const renderedBadge = recommendedFragment?.content_type
        ? `${recommendedFragment.content_type.charAt(0).toUpperCase()}${recommendedFragment.content_type.slice(1)}`
        : localContent.badge;
    const renderedEstimated = renderData?.estimated_minutes
        ? `${renderData.estimated_minutes} min`
        : recommendedFragment?.estimated_time_minutes
            ? `${recommendedFragment.estimated_time_minutes} min`
            : localContent.estimated;

    const activityData = renderData?.kind === 'task_list'
        ? {
            title: renderData.title || renderedTitle,
            intro: renderData.intro || 'Follow the tasks below.',
            hint: renderData.hint || 'Complete each task in order.',
            tasks: Array.isArray(renderData.tasks) ? renderData.tasks : [],
        }
        : {
            title: activity.title,
            intro: activity.intro,
            hint: activity.hint,
            tasks: [],
        };

    const exerciseQuestions = renderData?.kind === 'quiz' && Array.isArray(renderData.questions) && renderData.questions.length > 0
        ? renderData.questions
        : [{
            question: 'Which of the following is an input device?',
            options: ['Monitor', 'Printer', 'Keyboard', 'Speakers'],
            answer_index: 2,
        }];
    const answeredCount = Object.keys(selectedAnswers).length;
    const fullyAnswered = exerciseQuestions.length > 0 && answeredCount >= exerciseQuestions.length;

    const evaluatedQuestions = exerciseQuestions.map((question, index) => {
        const selectedIndex = Object.prototype.hasOwnProperty.call(selectedAnswers, index)
            ? selectedAnswers[index]
            : null;
        const correctIndex = typeof question.answer_index === 'number' ? question.answer_index : null;
        const isCorrect = selectedIndex !== null && correctIndex !== null && selectedIndex === correctIndex;
        return {
            question,
            index,
            selectedIndex,
            correctIndex,
            isCorrect,
        };
    });

    const correctCount = evaluatedQuestions.filter((entry) => entry.isCorrect).length;
    const quizScore = exerciseQuestions.length > 0
        ? Math.round((correctCount / exerciseQuestions.length) * 100)
        : 0;

    const formatTimer = (seconds) => {
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleMarkAsRead = async () => {
        try {
            await api.post('/interaction/record', {
                learner_id: getCurrentLearnerId(user),
                content_id: activeContentId || 1,
                completed: true,
                quiz_score: 100,
                expected_time: 12,
                actual_time: 12 - theoryTimer / 60,
                is_revisit: false,
                scroll_depth: 0.9,
                click_count: 3,
            });
            setTheoryMarkedAsRead(true);
        } catch (error) {
            console.error('Error marking as read:', error);
            setTheoryMarkedAsRead(true);
        }
    };

    const handleNeedHint = () => {
        setActivityHintShown(true);
    };

    const progressWidth = contentType === 'theory' ? '30%' : contentType === 'activity' ? '65%' : '90%';
    const timerText = contentType === 'theory' ? formatTimer(theoryTimer) : contentType === 'activity' ? formatTimer(activityTimer) : formatTimer(exerciseTimer);
    const moduleLabel = renderedTitle;

    const goPrevious = () => {
        if (contentType === 'exercise') {
            setContentType('activity');
            return;
        }
        if (contentType === 'activity') {
            setContentType('theory');
            return;
        }
        navigate('/dashboard');
    };

    const goNext = () => {
        if (contentType === 'theory') {
            setContentType('activity');
            return;
        }
        if (contentType === 'activity') {
            setContentType('exercise');
            return;
        }
        navigate('/assessment/post-test');
    };

    const completeTopic = async () => {
        if (submittingComplete) {
            return;
        }
        setSubmittingComplete(true);
        try {
            const responses = {};
            evaluatedQuestions.forEach(({ question, index, selectedIndex, correctIndex, isCorrect }) => {
                const options = Array.isArray(question.options) ? question.options : [];
                responses[`q${index + 1}`] = {
                    question: question.question,
                    options,
                    selected_index: selectedIndex,
                    selected_option: selectedIndex !== null ? options[selectedIndex] || null : null,
                    correct_index: correctIndex,
                    correct_option: correctIndex !== null ? options[correctIndex] || null : null,
                    is_correct: isCorrect,
                };
            });

            await api.post('/interaction/record', {
                learner_id: getCurrentLearnerId(user),
                content_id: activeContentId || 1,
                completed: fullyAnswered,
                quiz_score: quizScore,
                expected_time: 5,
                actual_time: Math.max(1, (4 * 60 + 20 - exerciseTimer) / 60),
                is_revisit: false,
                scroll_depth: Math.max(0.2, Math.min(1, answeredCount / Math.max(1, exerciseQuestions.length))),
                click_count: Math.max(1, answeredCount),
            });

            await api.post('/assessment/exercise', {
                learner_id: getCurrentLearnerId(user),
                module_id: recommendedFragment?.module_id || 'icdl-computer-essentials',
                content_id: activeContentId || null,
                score: quizScore,
                responses,
                completion_time_minutes: Math.max(1, Math.round((4 * 60 + 20 - exerciseTimer) / 60)),
                satisfaction_rating: exerciseSatisfaction ?? 3,
            });

            navigate('/assessment/post-test');
        } catch (error) {
            console.error('Error completing topic:', error);
            navigate('/assessment/post-test');
        } finally {
            setSubmittingComplete(false);
        }
    };

    return (
        <div className="lx-shell">
            <header className="lx-topbar">
                <div className="lx-topbar-inner">
                    <button className="lx-back" type="button" onClick={() => navigate('/dashboard')}>
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>{moduleLabel}</span>
                    </button>
                    <div className="lx-timer">
                        <span className="material-symbols-outlined">timer</span>
                        <span>{timerText}</span>
                    </div>
                </div>
                <div className="lx-progress-track">
                    <div className="lx-progress-fill" style={{ width: progressWidth }} />
                </div>
            </header>

            <main className="lx-main">
                <div className="lx-tabs" role="tablist" aria-label="Learning mode">
                    {['theory', 'activity', 'exercise'].map((item) => (
                        <button
                            key={item}
                            className={`lx-tab ${contentType === item ? 'active' : ''}`}
                            type="button"
                            onClick={() => setContentType(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {contentType === 'theory' ? (
                    <section className="lx-section">
                        <div className="lx-chip lx-chip-theory">
                            <span className="lx-chip-dot" />
                            <span>{renderedBadge}</span>
                        </div>
                        <h1 className="lx-title">{renderedTitle}</h1>

                        <article className="lx-article">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{renderedBody}</p>

                            <div className="lx-callout">
                                <div className="lx-callout-bar" />
                                <div className="lx-callout-inner">
                                    <span className="material-symbols-outlined">lightbulb</span>
                                    <p>{localContent.callout}</p>
                                </div>
                            </div>

                            <p>{localContent.activity?.intro || 'This module includes an interactive activity to reinforce the lesson.'}</p>

                            <div className="lx-cta-row">
                                <button
                                    className={`lx-cta ${theoryMarkedAsRead ? 'lx-cta-done' : ''}`}
                                    type="button"
                                    onClick={handleMarkAsRead}
                                    disabled={theoryMarkedAsRead}
                                >
                                    <span className="material-symbols-outlined">{theoryMarkedAsRead ? 'check_circle' : 'check_circle'}</span>
                                    {theoryMarkedAsRead ? 'Marked as Read' : 'Mark as Read'}
                                </button>
                            </div>
                        </article>
                    </section>
                ) : null}

                {contentType === 'activity' ? (
                    <section className="lx-section">
                        <div className="lx-chip lx-chip-activity">
                            <span className="material-symbols-outlined">my_location</span>
                            <span>Activity</span>
                        </div>
                        <h1 className="lx-title">{activityData.title || renderedTitle}</h1>

                        <div className="lx-info-box">
                            <span className="material-symbols-outlined">info</span>
                            <div>
                                <p>{activityData.intro}</p>
                                {activityData.tasks.length === 0 ? (
                                    <p className="lx-info-box-meta">
                                        {placedCount}/{activity.targets.length} placed{selectedItemLabel ? ` · Selected: ${selectedItemLabel}` : ''}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        {activityData.tasks.length > 0 ? (
                            <div className="lx-options">
                                {activityData.tasks.map((task, index) => (
                                    <div key={`${task}-${index}`} className="lx-option-group">
                                        <div className="lx-option is-selected">
                                            <span className="material-symbols-outlined">task_alt</span>
                                            <span className="lx-option-text">{task}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="lx-activity-grid">
                                <div className="lx-column">
                                    <h3>Components</h3>
                                    {availableItems.map((item) => (
                                        <button
                                            key={item.id}
                                            className={`lx-draggable ${selectedItemId === item.id ? 'lx-draggable-selected' : ''}`}
                                            type="button"
                                            draggable
                                            onDragStart={handleDragStart(item.id)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => setSelectedItemId(item.id)}
                                        >
                                            <span>{item.label}</span>
                                            <span className="material-symbols-outlined">drag_indicator</span>
                                        </button>
                                    ))}
                                    {availableItems.length === 0 ? <div className="lx-complete-note">All components placed. Try moving one to another target.</div> : null}
                                </div>

                                <div className="lx-column lx-column-targets">
                                    <h3>Descriptions</h3>
                                    {activity.targets.map((target) => {
                                        const placedItemId = getPlacedItemForTarget(target.id);
                                        const placedItemLabel = placedItemId ? getItemLabel(placedItemId) : '';
                                        const isCorrect = placedItemId ? isTargetCorrect(target.id, placedItemId) : false;
                                        return (
                                            <div
                                                key={target.id}
                                                className={`lx-target lx-target-drop ${activeTargetId === target.id ? 'is-hover' : ''} ${placedItemId ? 'lx-target-filled' : ''} ${isCorrect ? 'is-correct' : ''}`}
                                                role="button"
                                                tabIndex={0}
                                                onDragOver={(event) => {
                                                    event.preventDefault();
                                                    setActiveTargetId(target.id);
                                                }}
                                                onDragLeave={() => setActiveTargetId(null)}
                                                onDrop={(event) => {
                                                    event.preventDefault();
                                                    placeItemInTarget(dragState?.itemId || selectedItemId, target.id, dragState?.sourceTargetId || null);
                                                    setActiveTargetId(null);
                                                }}
                                                onClick={() => placeItemInTarget(selectedItemId, target.id, dragState?.sourceTargetId || null)}
                                            >
                                                {isCorrect ? (
                                                    <div className="lx-target-badge"><span className="material-symbols-outlined">check</span></div>
                                                ) : null}
                                                <div className="lx-target-head">
                                                    <div className="lx-token">{target.label}</div>
                                                    <p>{target.description}</p>
                                                </div>
                                                <div className="lx-target-slot">
                                                    {placedItemId ? (
                                                        <div
                                                            className="lx-token lx-token-placed"
                                                            draggable
                                                            onDragStart={handleDragStart(placedItemId, target.id)}
                                                            onDragEnd={handleDragEnd}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setSelectedItemId(placedItemId);
                                                            }}
                                                        >
                                                            <span>{placedItemLabel}</span>
                                                            <span className="material-symbols-outlined">drag_indicator</span>
                                                        </div>
                                                    ) : (
                                                        <div className="lx-token lx-token-empty" aria-hidden="true" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <button className="lx-hint" type="button" onClick={handleNeedHint}>
                            <span className="material-symbols-outlined">lightbulb</span>
                            {activityHintShown ? activityData.hint : selectedItemLabel ? 'Click a description to place the selected component.' : 'Need a hint? Select or drag a component first.'}
                        </button>
                    </section>
                ) : null}

                {contentType === 'exercise' ? (
                    <section className="lx-section">
                        <div className="lx-chip lx-chip-exercise">
                            <span>✏️</span>
                            <span>Exercise</span>
                        </div>
                        <h1 className="lx-title lx-title-sm">Knowledge Check</h1>
                        <p className="lx-subtitle">Answer all questions before completing this topic.</p>

                        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>Satisfaction:</span>
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setExerciseSatisfaction(value)}
                                    style={{
                                        border: '1px solid var(--line)',
                                        background: exerciseSatisfaction === value ? 'var(--primary)' : '#fff',
                                        color: exerciseSatisfaction === value ? '#fff' : 'var(--text)',
                                        borderRadius: 999,
                                        padding: '4px 10px',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                    }}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>

                        <div className="lx-options">
                            {evaluatedQuestions.map(({ question, index, selectedIndex, correctIndex, isCorrect }) => {
                                const options = Array.isArray(question.options) ? question.options : [];
                                return (
                                    <div key={`${question.question}-${index}`} className="lx-option-group">
                                        <p className="lx-subtitle" style={{ marginBottom: 10 }}>{question.question}</p>
                                        {options.map((option, optionIndex) => {
                                            const isSelected = selectedIndex === optionIndex;
                                            const isWrongSelection = isSelected && correctIndex !== null && optionIndex !== correctIndex;
                                            return (
                                                <button
                                                    key={`${option}-${optionIndex}`}
                                                    className={`lx-option ${isSelected ? 'is-selected' : ''} ${isSelected && isCorrect ? 'is-correct' : ''} ${isWrongSelection ? 'is-wrong' : ''}`}
                                                    type="button"
                                                    onClick={() => setSelectedAnswers((prev) => ({ ...prev, [index]: optionIndex }))}
                                                >
                                                    <span className="material-symbols-outlined">{isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                                    <span className="lx-option-text">{option}</span>
                                                    {isSelected ? <span className="material-symbols-outlined lx-option-ok">{isCorrect ? 'check_circle' : 'cancel'}</span> : null}
                                                </button>
                                            );
                                        })}

                                        {selectedIndex !== null ? (
                                            <div className={`lx-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
                                                <strong>{isCorrect ? 'Great job!' : 'Almost there'}</strong>
                                                <p>
                                                    {isCorrect
                                                        ? 'Correct response recorded. Great job.'
                                                        : 'Not quite. Try again and choose the best option from the lesson content.'}
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ) : null}
            </main>

            <footer className="lx-footer">
                <div className="lx-footer-inner">
                    <button className="lx-footer-btn secondary" type="button" onClick={goPrevious}>Previous</button>
                    {contentType === 'exercise' ? (
                        <button className="lx-footer-btn primary" type="button" onClick={completeTopic} disabled={submittingComplete || !fullyAnswered || exerciseSatisfaction === null}>
                            {submittingComplete ? 'Completing...' : `Complete Topic (${answeredCount}/${exerciseQuestions.length})`}
                            <span className="material-symbols-outlined">check</span>
                        </button>
                    ) : (
                        <button className="lx-footer-btn primary" type="button" onClick={goNext}>
                            {contentType === 'theory' ? 'Next Topic' : 'Next'}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    )}
                </div>
                {contentType === 'theory' ? <div className="lx-footer-inline-note">Est. {renderedEstimated}</div> : null}
            </footer>

            {contentType === 'theory' ? (
                <div className="lx-mobile-next">
                    <button className="lx-mobile-next-btn" type="button" onClick={goNext}>
                        <div>
                            <div className="lx-mobile-next-kicker">Up Next</div>
                            <div>Practical Disruption</div>
                        </div>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            ) : null}
        </div>
    );
}
