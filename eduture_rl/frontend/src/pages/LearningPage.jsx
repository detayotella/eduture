import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { learningContent, getCurrentLearnerId } from '../constants/learningData';
import { useAuth } from '../context/AuthContext';

export default function LearningPage() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const content = learningContent[topicId] || learningContent['computer-basics'];
    const activity = content.activity || {
        title: 'Match the learning pieces',
        intro: 'Use drag-and-drop or click a component and then a target card.',
        hint: 'Pick the item that best fits the description.',
        items: [],
        targets: [],
    };
    const [contentType, setContentType] = useState('theory');

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
        setContentType('theory');
        setTheoryTimer(12 * 60);
        setActivityTimer(8 * 60 + 45);
        setExerciseTimer(4 * 60 + 20);
        setTheoryMarkedAsRead(false);
        setActivityHintShown(false);
        setSelectedOption(null);
        setSelectedItemId(null);
        setPlacements({});
        setActiveTargetId(null);
        setDragState(null);
    }, [topicId]);

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

    const exerciseOptions = ['Monitor', 'Printer', 'Keyboard', 'Speakers'];
    const correctExerciseOption = 'Keyboard';
    const [selectedOption, setSelectedOption] = useState(null);

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

    const formatTimer = (seconds) => {
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleMarkAsRead = async () => {
        try {
            await api.post('/interaction/record', {
                learner_id: getCurrentLearnerId(user),
                content_id: 1,
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
    const moduleLabel = contentType === 'theory' ? 'Computer Essentials' : contentType === 'activity' ? 'Hardware Essentials' : 'Hardware Basics';

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
                            <span>{content.badge}</span>
                        </div>
                        <h1 className="lx-title">{content.title}</h1>

                        <article className="lx-article">
                            <p>{content.body}</p>

                            <div className="lx-callout">
                                <div className="lx-callout-bar" />
                                <div className="lx-callout-inner">
                                    <span className="material-symbols-outlined">lightbulb</span>
                                    <p>{content.callout}</p>
                                </div>
                            </div>

                            <p>{content.activity?.intro || 'This module includes an interactive activity to reinforce the lesson.'}</p>

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
                        <h1 className="lx-title">{activity.title}</h1>

                        <div className="lx-info-box">
                            <span className="material-symbols-outlined">info</span>
                            <div>
                                <p>{activity.intro}</p>
                                <p className="lx-info-box-meta">
                                    {placedCount}/{activity.targets.length} placed{selectedItemLabel ? ` · Selected: ${selectedItemLabel}` : ''}
                                </p>
                            </div>
                        </div>

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

                        <button className="lx-hint" type="button" onClick={handleNeedHint}>
                            <span className="material-symbols-outlined">lightbulb</span>
                            {activityHintShown ? activity.hint : selectedItemLabel ? 'Click a description to place the selected component.' : 'Need a hint? Select or drag a component first.'}
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
                        <p className="lx-subtitle">Which of the following is an input device?</p>

                        <div className="lx-options">
                            {exerciseOptions.map((option) => {
                                const isSelected = option === selectedOption;
                                const isCorrect = option === correctExerciseOption;
                                const isWrongSelection = isSelected && !isCorrect;
                                return (
                                    <div key={option} className="lx-option-group">
                                        <button
                                            className={`lx-option ${isSelected ? 'is-selected' : ''} ${isSelected && isCorrect ? 'is-correct' : ''} ${isWrongSelection ? 'is-wrong' : ''}`}
                                            type="button"
                                            onClick={() => setSelectedOption(option)}
                                        >
                                            <span className="material-symbols-outlined">{isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <span className="lx-option-text">{option}</span>
                                            {isSelected ? <span className="material-symbols-outlined lx-option-ok">{isCorrect ? 'check_circle' : 'cancel'}</span> : null}
                                        </button>
                                        {isSelected ? (
                                            <div className={`lx-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
                                                <strong>{isCorrect ? 'Great job!' : 'Almost there'}</strong>
                                                <p>
                                                    {isCorrect
                                                        ? 'A keyboard is used to input text and commands into the computer, making it a primary input device.'
                                                        : 'That choice is an output device. Try again and pick the option used for entering text and commands.'}
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
                    <button className="lx-footer-btn secondary" type="button">Previous</button>
                    {contentType === 'exercise' ? (
                        <button className="lx-footer-btn primary" type="button">
                            Complete Topic
                            <span className="material-symbols-outlined">check</span>
                        </button>
                    ) : (
                        <button className="lx-footer-btn primary" type="button">
                            {contentType === 'theory' ? 'Next Topic' : 'Next'}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    )}
                </div>
                {contentType === 'theory' ? <div className="lx-footer-inline-note">Est. {content.estimated}</div> : null}
            </footer>

            {contentType === 'theory' ? (
                <div className="lx-mobile-next">
                    <button className="lx-mobile-next-btn" type="button">
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
