import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Timer } from '../components/Timer';
import { PollResults } from '../components/PollResults';
import { Button } from '../components/Button';
import { Sidebar } from '../components/Sidebar';
import { socketService } from '../services/socket';
import { IntervueLogo } from '../components/IntervueLogo';
import {
    setCurrentPoll,
    setResults,
    setHasAnswered,
    setTimeRemaining,
    setStudents
} from '../store/slices/pollSlice';
import './StudentView.css';

export const StudentView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { name } = useSelector((state) => state.user);
    const { currentPoll, results, hasAnswered, timeRemaining } = useSelector((state) => state.poll);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState(null);

    useEffect(() => {
        if (!name) {
            navigate('/student/name');
            return;
        }

        socketService.on('poll:new', (poll) => {
            dispatch(setCurrentPoll(poll));
            dispatch(setHasAnswered(false));
            dispatch(setTimeRemaining(poll.timeLimit));
            setShowResults(false);
            setSelectedOption(null);
        });

        socketService.on('poll:resultsUpdated', (res) => dispatch(setResults(res)));
        socketService.on('poll:timerUpdate', ({ timeRemaining }) => dispatch(setTimeRemaining(timeRemaining)));
        socketService.on('poll:timeExpired', (res) => {
            dispatch(setResults(res));
            setShowResults(true);
            dispatch(setHasAnswered(true));
        });
        socketService.on('poll:allAnswered', (res) => {
            dispatch(setResults(res));
            setShowResults(true);
        });
        socketService.on('student:removed', () => {
            alert('You have been removed');
            navigate('/');
        });

        // Listen for student list updates so sidebar is accurate
        socketService.on('students:updated', (s) => dispatch(setStudents(s)));

        return () => {
            socketService.off('poll:new');
            socketService.off('poll:resultsUpdated');
            socketService.off('poll:timerUpdate');
            socketService.off('poll:timeExpired');
            socketService.off('poll:allAnswered');
            socketService.off('student:removed');
            socketService.off('students:updated');
        };
    }, [dispatch, name, navigate]);

    const handleSubmitAnswer = async () => {
        if (selectedOption === null) return;
        setSubmitting(true);
        try {
            const response = await socketService.emit('student:submitAnswer', {
                optionIndex: selectedOption
            });
            if (response.success) {
                dispatch(setResults(response.results));
                dispatch(setHasAnswered(true));
                setShowResults(true);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`student-view fade-in ${activeTab ? 'sidebar-open' : ''}`}>
            <div className="student-view__header">
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

            <div className="student-view__main">
                {/* Waiting State */}
                {!currentPoll && (
                    <div className="waiting-card">
                        <div className="brand-badge-center">
                            <IntervueLogo size={12} /> INTERVUE POLL
                        </div>
                        <h2 className="waiting-title">Let's <strong>Get Started</strong></h2>
                        <p className="waiting-text">
                            If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
                        </p>

                        <div className="waiting-input-mock">
                            <label>Enter your Name</label>
                            <div className="mock-input">{name}</div>
                        </div>

                        <Button disabled className="continue-btn-mock">Continue</Button>
                    </div>
                    /* Wait, looking at Desktop 660, the waiting screen AFTER joining says "Wait for the teacher..."
                       The screen Desktop-656 is the LOGIN screen which I already did.
                       Desktop-660 showing "Question 1", Results, "Wait for teacher..." is the Results View OR Waiting View.
                       Desktop-668 says "Wait for the teacher to ask a new question.."
                       So:
                    */
                )}

                {/* 
           Actually, if !currentPoll, it means we are waiting for the FIRST poll or NEXT poll.
           Desktop-660 shows "Wait for the teacher to ask a new question.." with results of previous?
        */}

                {!currentPoll && !results && (
                    <div className="waiting-simple">
                        <IntervueLogo size={24} className="pulse-icon" />
                        <h3>Wait for the teacher to ask questions..</h3>
                    </div>
                )}

                {currentPoll && !showResults && !hasAnswered && (
                    <div className="poll-card">
                        <div className="poll-header">
                            <span className="q-label">Question 1</span>
                            <Timer timeRemaining={timeRemaining} />
                        </div>
                        <h2 className="poll-question">{currentPoll.question}</h2>

                        <div className="poll-options">
                            {currentPoll.options.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`poll-option ${selectedOption === idx ? 'selected' : ''}`}
                                    onClick={() => setSelectedOption(idx)}
                                >
                                    <span className="opt-number">{idx + 1}</span>
                                    <span className="opt-text">{opt}</span>
                                </div>
                            ))}
                        </div>

                        <div className="poll-actions">
                            <Button
                                disabled={selectedOption === null || submitting}
                                onClick={handleSubmitAnswer}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                )}

                {(showResults || hasAnswered) && results && (
                    <div className="poll-card">
                        <div className="poll-header">
                            <span className="q-label">Question 1</span>
                            <span className="timer-stopped">00:00</span>
                        </div>
                        <h2 className="poll-question">{currentPoll ? currentPoll.question : "Poll Ended"}</h2>

                        <PollResults results={results} />

                        <p className="wait-footer">Wait for the teacher to ask a new question..</p>
                    </div>
                )}
            </div>

            <Sidebar
                activeTab={activeTab}
                onClose={() => setActiveTab(null)}
                isTeacher={false}
            />
        </div>
    );
};
