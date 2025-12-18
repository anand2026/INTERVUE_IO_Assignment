import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { IntervueLogo } from '../components/IntervueLogo';
import { RoleCard } from '../components/RoleCard';
import { Button } from '../components/Button';
import { setRole } from '../store/slices/userSlice';
import './RoleSelection.css';

export const RoleSelection = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleContinue = () => {
        if (!selectedRole) return;

        dispatch(setRole(selectedRole));

        if (selectedRole === 'student') {
            navigate('/student/name');
        } else {
            navigate('/teacher');
        }
    };

    return (
        <div className="role-selection fade-in">
            <div className="role-selection__container">
                <div className="role-selection__badge">
                    <IntervueLogo size={14} />
                    Intervue Poll
                </div>

                <h1 className="role-selection__title">
                    Welcome to the <span className="highlight">Live Polling System</span>
                </h1>
                <p className="role-selection__subtitle">
                    Please select the role that best describes you to begin using the live polling system
                </p>

                <div className="role-selection__cards">
                    <RoleCard
                        title="I'm a Student"
                        description="Lorem Ipsum is simply dummy text of the printing and typesetting industry"
                        onClick={() => setSelectedRole('student')}
                        selected={selectedRole === 'student'}
                    />
                    <RoleCard
                        title="I'm a Teacher"
                        description="Submit answers and view live poll results in real-time."
                        onClick={() => setSelectedRole('teacher')}
                        selected={selectedRole === 'teacher'}
                    />
                </div>

                <div className="role-selection__actions">
                    <Button
                        variant="primary"
                        onClick={handleContinue}
                        disabled={!selectedRole}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
};
