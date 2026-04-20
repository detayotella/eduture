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
    const [contentType, setContentType] = useState('theory');

    // Timer states
    const [theoryTimer, setTheoryTimer] = useState(12 * 60); // 12 minutes
    const [activityTimer, setActivityTimer] = useState(8 * 60 + 45); // 8:45
    const [exerciseTimer, setExerciseTimer] = useState(4 * 60 + 20); // 4:20

    // State for interactions
    const [theoryMarkedAsRead, setTheoryMarkedAsRead] = useState(false);
    const [activityHintShown, setActivityHintShown] = useState(false);

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

    const initialTargets = {
        cpu: 'CPU',
        storage: null,
        memory: null,
    };
    const [activityTargets, setActivityTargets] = useState(initialTargets);
    const [activeDragItem, setActiveDragItem] = useState(null);
    const [activeTarget, setActiveTarget] = useState(null);

    const draggableItems = ['RAM', 'Hard Drive'];

    const unplacedItems = draggableItems.filter((item) => !Object.values(activityTargets).includes(item));

    const placeItemInTarget = (item, targetKey) => {
        if (!item || targetKey === 'cpu') {
            return;
        }
        setActivityTargets((previous) => {
            const next = { ...previous };
            Object.keys(next).forEach((key) => {
                if (next[key] === item) {
                    next[key] = null;
                }
            });
            next[targetKey] = item;
            return next;
        });
        setActiveDragItem(null);
    };

    const isTargetCorrect = (targetKey, value) => {
        if (targetKey === 'cpu') return value === 'CPU';
        if (targetKey === 'storage') return value === 'Hard Drive';
        if (targetKey === 'memory') return value === 'RAM';
        return false;
    };

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
                            <span>Theory</span>
                        </div>
                        <h1 className="lx-title">{content.title}</h1>

                        <article className="lx-article">
                            <p>
                                At its core, a computer is more than just a glowing rectangle on your desk or in your pocket. It is an incredibly fast, highly organized machine capable of processing vast amounts of information in fractions of a second.
                            </p>

                            <div className="lx-callout">
                                <div className="lx-callout-bar" />
                                <div className="lx-callout-inner">
                                    <span className="material-symbols-outlined">lightbulb</span>
                                    <p>
                                        A computer is an electronic device that manipulates information, or data. It has the ability to store, retrieve, and process data.
                                    </p>
                                </div>
                            </div>

                            <p>
                                You may already know that you can use a computer to type documents, send emails, play games, and browse the Web. You can also use it to edit or create spreadsheets, presentations, and even videos.
                            </p>

                            <p>
                                The magic of a computer lies in how it handles hardware and software working in perfect synchronization. The physical components you can touch rely entirely on the invisible instructions provided by software programs to function.
                            </p>

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
                        <h1 className="lx-title">Identify the Hardware</h1>

                        <div className="lx-info-box">
                            <span className="material-symbols-outlined">info</span>
                            <p>Drag the hardware component names on the left to match their correct functional descriptions on the right.</p>
                        </div>

                        <div className="lx-activity-grid">
                            <div className="lx-column">
                                <h3>Components</h3>
                                <div className="lx-draggable lx-draggable-disabled">
                                    <span>CPU</span>
                                    <span className="material-symbols-outlined">drag_indicator</span>
                                </div>
                                {unplacedItems.map((item) => (
                                    <button
                                        key={item}
                                        className={`lx-draggable ${activeDragItem === item ? 'lx-draggable-selected' : ''}`}
                                        type="button"
                                        draggable
                                        onDragStart={() => setActiveDragItem(item)}
                                        onDragEnd={() => setActiveDragItem(null)}
                                        onClick={() => setActiveDragItem(item)}
                                    >
                                        <span>{item}</span>
                                        <span className="material-symbols-outlined">drag_indicator</span>
                                    </button>
                                ))}
                                {unplacedItems.length === 0 ? <div className="lx-complete-note">All components placed.</div> : null}
                            </div>

                            <div className="lx-column lx-column-targets">
                                <h3>Descriptions</h3>
                                <div className="lx-target lx-target-filled">
                                    <div className="lx-target-badge"><span className="material-symbols-outlined">check</span></div>
                                    <div className="lx-token">CPU</div>
                                    <p>The primary component of a computer that acts as its brain, performing most of the processing inside the computer.</p>
                                </div>

                                <button
                                    className={`lx-target lx-target-drop ${activeTarget === 'storage' ? 'is-hover' : ''} ${activityTargets.storage && isTargetCorrect('storage', activityTargets.storage) ? 'is-correct' : ''}`}
                                    type="button"
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setActiveTarget('storage');
                                    }}
                                    onDragLeave={() => setActiveTarget(null)}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        placeItemInTarget(activeDragItem, 'storage');
                                        setActiveTarget(null);
                                    }}
                                    onClick={() => placeItemInTarget(activeDragItem, 'storage')}
                                >
                                    {activityTargets.storage ? (
                                        <div className="lx-token">{activityTargets.storage}</div>
                                    ) : (
                                        <div className="lx-token lx-token-empty" />
                                    )}
                                    <p>Long-term storage device that keeps data even when the power is turned off.</p>
                                </button>

                                <button
                                    className={`lx-target lx-target-drop ${activeTarget === 'memory' ? 'is-hover' : ''} ${activityTargets.memory && isTargetCorrect('memory', activityTargets.memory) ? 'is-correct' : ''}`}
                                    type="button"
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setActiveTarget('memory');
                                    }}
                                    onDragLeave={() => setActiveTarget(null)}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        placeItemInTarget(activeDragItem, 'memory');
                                        setActiveTarget(null);
                                    }}
                                    onClick={() => placeItemInTarget(activeDragItem, 'memory')}
                                >
                                    {activityTargets.memory ? (
                                        <div className="lx-token">{activityTargets.memory}</div>
                                    ) : (
                                        <div className="lx-token lx-token-empty" />
                                    )}
                                    <p>Temporary memory used by the system to store data that is currently being actively used or processed.</p>
                                </button>
                            </div>
                        </div>

                        <button className="lx-hint" type="button" onClick={handleNeedHint}>
                            <span className="material-symbols-outlined">lightbulb</span>
                            {activityHintShown ? 'Hint: Try dragging RAM to the Memory slot and Hard Drive to Storage.' : activeDragItem ? 'Click a description to place selected component' : 'Need a hint? Select or drag a component first.'}
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
