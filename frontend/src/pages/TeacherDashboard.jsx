import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Zap } from 'lucide-react';
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
                }
            })
            .catch(console.error);

        const handleStudentsUpdated = (updated) => dispatch(setStudents(updated));
        const handleResultsUpdated = (updated) => dispatch(setResults(updated));
        const handleTimerUpdate = ({ timeRemaining }) => dispatch(setTimeRemaining(timeRemaining));
        const handleEnd = (final) => dispatch(setResults(final));

        socketService.on('students:updated', handleStudentsUpdated);
        socketService.on('poll:resultsUpdated', handleResultsUpdated);
        socketService.on('poll:timerUpdate', handleTimerUpdate);
        socketService.on('poll:timeExpired', handleEnd);
        socketService.on('poll:allAnswered', handleEnd);

        return () => {
            socketService.off('students:updated', handleStudentsUpdated);
            socketService.off('poll:resultsUpdated', handleResultsUpdated);
            socketService.off('poll:timerUpdate', handleTimerUpdate);
            socketService.off('poll:timeExpired', handleEnd);
            socketService.off('poll:allAnswered', handleEnd);
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

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, { text: '', isCorrect: false }]);
        }
    };

    // Check if we can show create poll form (no active poll or poll ended)
    const canCreate = !currentPoll || (results && (timeRemaining === 0 || results.answeredCount === results.totalStudents));

    return (
        <div className={`teacher-dashboard fade-in ${activeTab ? 'sidebar-open' : ''}`}>
            <div className="teacher-dashboard__main">
                {/* Header */}
                <div className="teacher-dashboard__header">
                    <div className="brand">
                        <IntervueLogo size={16} />
                        <span>INTERVUE POLL</span>
                    </div>
                    <div className="header-actions">
                        <button
                            className={`header-tab ${activeTab === 'chat' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'chat' ? null : 'chat')}
                        >
                            Chat
                        </button>
                        <button
                            className={`header-tab ${activeTab === 'participants' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'participants' ? null : 'participants')}
                        >
                            Participants
                        </button>
                    </div>
                </div>

                <div className="teacher-dashboard__content-wrapper">
                    {/* Create Poll Section */}
                    {canCreate ? (
                        <div className="create-poll-card">
                            <div className="card-header">
                                <div>
                                    <div className="badge">
                                        <IntervueLogo size={12} />
                                        INTERVUE POLL
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
                                                        name="correctOption"
                                                        checked={opt.isCorrect}
                                                        onChange={() => setCorrectOption(idx)}
                                                    />
                                                    Yes
                                                </label>
                                                <label className={`radio-label ${!opt.isCorrect ? 'active' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name="correctOption"
                                                        checked={!opt.isCorrect}
                                                        onChange={() => { /* No-op, handled by Yes click usually, or toggle off? Assuming single correct answer */ }}
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
                        <div className="results-view">
                            <div className="results-header">
                                <span>Question 1</span>
                                <Timer timeRemaining={timeRemaining} />
                            </div>
                            <h2 className="results-question">{currentPoll?.question}</h2>

                            {/* Always show results, even if empty */}
                            {results ? (
                                <PollResults results={results} isTeacher={true} />
                            ) : (
                                /* Show initial empty results structure */
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

                            {/* Show 'Ask New Question' only if finished */}
                            {(!currentPoll || (results && results.answeredCount === results.totalStudents)) && (
                                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <Button onClick={() => dispatch(setCurrentPoll(null))}>
                                        Create New Poll
                                    </Button>
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
