import React from 'react';
import './Button.css';

export const Button = ({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
    type = 'button',
    className = ''
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant} ${className}`}
        >
            {children}
        </button>
    );
};
