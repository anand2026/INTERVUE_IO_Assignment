import React, { useEffect } from 'react';
import './Timer.css';
import TimerIcon from '../assets/Timer.svg';

export const Timer = ({ timeRemaining }) => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    const isLowTime = timeRemaining <= 10;

    return (
        <div className={`timer ${isLowTime ? 'timer--low' : ''}`}>
            <div className="timer__icon">
                <img src={TimerIcon} alt="Timer" />
            </div>
            <div className="timer__value">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
        </div>
    );
};
