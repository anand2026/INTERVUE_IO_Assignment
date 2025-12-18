import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { IntervueLogo } from '../components/IntervueLogo';
import { Button } from '../components/Button';
import { setName, setConnected, setRole } from '../store/slices/userSlice';
import { setCurrentPoll, setResults, setTimeRemaining, setStudents } from '../store/slices/pollSlice';
import { socketService } from '../services/socket';
import './StudentNameInput.css';

export const StudentNameInput = () => {
    const [name, setNameInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Connect to socket
            socketService.connect();

            // Join as student
            const response = await socketService.emit('student:join', { name: name.trim() });

            if (response.success) {
                dispatch(setName(name.trim()));
                dispatch(setRole('student'));  // Set role for chat functionality
                dispatch(setConnected(true));

                // Set poll state from join response
                if (response.currentPoll) {
                    dispatch(setCurrentPoll(response.currentPoll));
                    // Use timeRemaining from backend (accurate for mid-poll joins)
                    dispatch(setTimeRemaining(response.timeRemaining ?? response.currentPoll.timeLimit));
                }

                // Only set results if provided (poll has ended)
                if (response.results) {
                    dispatch(setResults(response.results));
                    dispatch(setTimeRemaining(0)); // Ensure time is 0 when poll ended
                }

                // Set students list for participants view
                if (response.students) {
                    dispatch(setStudents(response.students));
                }

                navigate('/student/poll');
            }
        } catch (err) {
            setError(err.message || 'Failed to join. Name might be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-name fade-in">
            <div className="student-name__container">
                <div className="student-name__badge">
                    <IntervueLogo size={14} />
                    Intervue Poll
                </div>

                <h1 className="student-name__title">
                    Let's <strong>Get Started</strong>
                </h1>
                <p className="student-name__subtitle">
                    If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
                </p>

                <form onSubmit={handleSubmit} className="student-name__form">
                    <div className="student-name__input-group">
                        <label htmlFor="name" className="student-name__label">
                            Enter your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Rahul Bajaj"
                            value={name}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="student-name__input"
                            disabled={loading}
                        />
                        {error && (
                            <p className="student-name__error">{error}</p>
                        )}
                    </div>

                    <div className="student-name__actions">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading || !name.trim()}
                        >
                            {loading ? 'Joining...' : 'Continue'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
