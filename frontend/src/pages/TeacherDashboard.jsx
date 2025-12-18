import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Zap } from 'lucide-react';
import EyeIcon from '../assets/Eye.svg';
import { Button } from '../components/Button';
import { Timer } from '../components/Timer';
import { PollResults } from '../components/PollResults';
import { Sidebar } from '../components/Sidebar';
import { ChatButton } from '../components/ChatButton';
import { IntervueLogo } from '../components/IntervueLogo';
import { socketService } from '../services/socket';
import {
    setCurrentPoll,
    setResults,
    setStudents,
    setTimeRemaining,
    setPollHistory
} from '../store/slices/pollSlice';
import { setConnected } from '../store/slices/userSlice';
import { setChatOpen } from '../store/slices/chatSlice';
import './TeacherDashboard.css';

export const TeacherDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { role } = useSelector((state) => state.user);
    const { currentPoll, results, timeRemaining } = useSelector((state) => state.poll);

    const [activeTab, setActiveTab] = useState(null); // 'chat' or 'participants'
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [pollHistory, setPollHistory] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(true); // Start with form, then show results

    // Poll Creation State
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    const [timeLimit, setTimeLimitSelect] = useState(60);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (role !== 'teacher') {
            navigate('/');
            return;
        }

        socketService.connect();
        socketService.emit('teacher:join')
            .then((response) => {
                if (response.success) {
                    dispatch(setConnected(true));
                    dispatch(setStudents(response.students || []));
                    if (response.currentPoll) dispatch(setCurrentPoll(response.currentPoll));
                    if (response.results) dispatch(setResults(response.results));
                    if (response.pollHistory) setPollHistory(response.pollHistory);
                }
            })
            .catch(console.error);

        const handleStudentsUpdated = (updated) => dispatch(setStudents(updated));
        const handleResultsUpdated = (updated) => dispatch(setResults(updated));
        const handleTimerUpdate = ({ timeRemaining }) => dispatch(setTimeRemaining(timeRemaining));
        const handleTimeExpired = (data) => {
            // Handle new format: { results, pollHistory }
            dispatch(setResults(data.results || data));
            if (data.pollHistory) setPollHistory(data.pollHistory);
        };

        socketService.on('students:updated', handleStudentsUpdated);
        socketService.on('poll:resultsUpdated', handleResultsUpdated);
        socketService.on('poll:timerUpdate', handleTimerUpdate);
        socketService.on('poll:timeExpired', handleTimeExpired);

        return () => {
            socketService.off('students:updated', handleStudentsUpdated);
            socketService.off('poll:resultsUpdated', handleResultsUpdated);
            socketService.off('poll:timerUpdate', handleTimerUpdate);
            socketService.off('poll:timeExpired', handleTimeExpired);
        };
    }, [dispatch, role, navigate]);

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        if (!question.trim()) return alert('Enter a question');
        const validOptions = options.filter(o => o.text.trim());
        if (validOptions.length < 2) return alert('Need at least 2 options');

        setLoading(true);
        try {
            const response = await socketService.emit('teacher:createPoll', {
                question,
                options: validOptions.map(o => o.text),
                correctOptionIndex: options.findIndex(o => o.isCorrect), // Backend might ignore this but UI asks for it
                timeLimit
            });
            if (response.success) {
                dispatch(setCurrentPoll(response.poll));
                dispatch(setTimeRemaining(timeLimit));
                setQuestion('');
                setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateOptionText = (index, text) => {
        const newOpts = [...options];
        newOpts[index].text = text;
        setOptions(newOpts);
    };

    const setCorrectOption = (index) => {
        const newOpts = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index
        }));
        setOptions(newOpts);
    };

    const toggleCorrectOption = (index, value) => {
        const newOpts = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index ? value : opt.isCorrect
        }));
        setOptions(newOpts);
    };

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, { text: '', isCorrect: false }]);
        }
    };

    // Determine if we should show create form or results
    // Show form ONLY when: showCreateForm is true AND no active poll/results
    // Show results when: poll exists OR results exist (regardless of showCreateForm)
    const canCreate = showCreateForm && !currentPoll && !results;

    return (
        <div className={`teacher-dashboard fade-in ${activeTab ? 'sidebar-open' : ''}`}>
            <div className="teacher-dashboard__main">
                {/* View Poll history button - hide when viewing poll history */}
                {!showHistory && (
                    <button
                        className="view-history-btn"
                        onClick={() => setShowHistory(true)}
                    >
                        <img src={EyeIcon} alt="" width={24} height={24} />
                        View Poll history
                    </button>
                )}
                <div className="teacher-dashboard__content-wrapper">
                    {/* Poll History View - Full Page */}
                    {showHistory ? (
                        <div className="poll-history-page">
                            <h2 className="poll-history-title">View <strong>Poll History</strong></h2>
                            {pollHistory.length === 0 ? (
                                <div className="history-empty-page">
                                    <p>No polls completed yet in this session.</p>
                                    <p className="history-hint">Completed polls will appear here after you ask new questions.</p>
                                    <button className="back-btn" onClick={() => setShowHistory(false)}>
                                        ← Back to Dashboard
                                    </button>
                                </div>
                            ) : (
                                <div className="history-list-page">
                                    {pollHistory.map((poll, index) => {
                                        // Votes are inside poll.results.votes
                                        const votes = poll.results?.votes || poll.votes || [];
                                        const totalVotes = votes.reduce((a, b) => a + b, 0);
                                        return (
                                            <div key={index} className="history-item">
                                                <div className="history-item__label">Question {index + 1}</div>
                                                <div className="history-item__card">
                                                    <div className="history-item__question-bar">{poll.question}</div>
                                                    <div className="history-item__options">
                                                        {poll.options.map((option, optIndex) => {
                                                            const voteCount = votes[optIndex] || 0;
                                                            const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(0) : 0;
                                                            return (
                                                                <div key={optIndex} className="history-item__option">
                                                                    <div
                                                                        className="history-item__option-bar-fill"
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                    <div className="history-item__option-content">
                                                                        <div className="history-item__option-left">
                                                                            <span className="history-item__option-circle">{optIndex + 1}</span>
                                                                            <span className="history-item__option-text">{option}</span>
                                                                        </div>
                                                                        <span className="history-item__option-percentage">{percentage}%</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : canCreate ? (
                        <div className="create-poll-card">
                            <div className="card-header">
                                <div>
                                    <div className="badge">
                                        <IntervueLogo size={12} />
                                        Intervue Poll
                                    </div>
                                    <h1 className="title">Let's <strong>Get Started</strong></h1>
                                    <p className="subtitle">
                                        you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleCreatePoll}>
                                <div className="question-section">
                                    <div className="label-row">
                                        <label>Enter your question</label>
                                        <select
                                            value={timeLimit}
                                            onChange={(e) => setTimeLimitSelect(Number(e.target.value))}
                                            className="time-select"
                                        >
                                            <option value={30}>30 seconds</option>
                                            <option value={60}>60 seconds</option>
                                            <option value={90}>90 seconds</option>
                                            <option value={120}>2 minutes</option>
                                        </select>
                                    </div>
                                    <div className="input-wrapper">
                                        <textarea
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            placeholder="Rahul Bajaj" // Placeholder per Figma, seemingly wrong but matching exact UI
                                            maxLength={100}
                                        />
                                        <span className="char-count">{question.length}/100</span>
                                    </div>
                                </div>

                                <div className="options-section">
                                    <div className="options-header">
                                        <span className="col-label">Edit Options</span>
                                        <span className="col-label center">Is it Correct?</span>
                                    </div>

                                    {options.map((opt, idx) => (
                                        <div key={idx} className="option-row">
                                            <div className="option-input-wrapper">
                                                <span className="option-number">{idx + 1}</span>
                                                <input
                                                    type="text"
                                                    value={opt.text}
                                                    onChange={(e) => updateOptionText(idx, e.target.value)}
                                                    placeholder="Rahul Bajaj"
                                                />
                                            </div>
                                            <div className="correct-radios">
                                                <label className={`radio-label ${opt.isCorrect ? 'active' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name={`correctOption_${idx}`}
                                                        checked={opt.isCorrect}
                                                        onChange={() => toggleCorrectOption(idx, true)}
                                                    />
                                                    Yes
                                                </label>
                                                <label className={`radio-label ${!opt.isCorrect ? 'active' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name={`correctOption_${idx}`}
                                                        checked={!opt.isCorrect}
                                                        onChange={() => toggleCorrectOption(idx, false)}
                                                    />
                                                    No
                                                </label>
                                            </div>
                                        </div>
                                    ))}

                                    {options.length < 6 && (
                                        <button type="button" onClick={addOption} className="add-option-btn">
                                            + Add More option
                                        </button>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <Button type="submit" variant="primary" disabled={loading}>
                                        Ask Question
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Live Results View */
                        <div className="results-container">
                            <div className="results-header">
                                <span className="results-label">Question</span>
                            </div>

                            {/* Bordered card containing question bar + results */}
                            <div className="results-card-wrapper">
                                <div className="results-question-bar">{currentPoll?.question}</div>
                                <div className="results-content">
                                    {results ? (
                                        <PollResults results={results} isTeacher={true} />
                                    ) : (
                                        <PollResults results={{
                                            pollId: currentPoll?.id,
                                            question: currentPoll?.question,
                                            options: currentPoll?.options || [],
                                            votes: new Array(currentPoll?.options?.length || 0).fill(0),
                                            studentAnswers: [],
                                            totalStudents: 0,
                                            answeredCount: 0,
                                            timeRemaining: timeRemaining
                                        }} />
                                    )}
                                </div>
                            </div>

                            {/* Ask New Question button - OUTSIDE the card */}
                            {results && (
                                <div className="ask-new-question-container">
                                    <button
                                        className="ask-new-question-btn"
                                        onClick={() => {
                                            // Save current poll to history before clearing
                                            if (currentPoll && results) {
                                                setPollHistory(prev => [...prev, {
                                                    question: currentPoll.question,
                                                    options: currentPoll.options,
                                                    endedAt: new Date().toISOString(),
                                                    totalResponses: results.answeredCount || 0,
                                                    votes: results.votes || []
                                                }]);
                                            }

                                            // End poll via socket (fire and forget)
                                            socketService.emit('teacher:endPoll').catch(() => { });

                                            // Clear Redux state
                                            dispatch(setCurrentPoll(null));
                                            dispatch(setResults(null));

                                            // Reset form fields
                                            setQuestion('');
                                            setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);

                                            // Show create form
                                            setShowCreateForm(true);
                                        }}
                                    >
                                        + Ask a new question
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Button - Bottom Right */}
            <ChatButton onClick={() => {
                setIsChatOpen(!isChatOpen);
                if (!isChatOpen) setActiveTab('chat'); // Default to chat tab when opening
            }} />

            {/* Sidebar Modal */}
            {isChatOpen && (
                <Sidebar
                    activeTab={activeTab || 'chat'}
                    onClose={() => setIsChatOpen(false)}
                    isTeacher={true}
                />
            )}
        </div>
    );
};
