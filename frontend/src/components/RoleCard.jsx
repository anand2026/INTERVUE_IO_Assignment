import React from 'react';
import './RoleCard.css';

export const RoleCard = ({ title, description, onClick, selected = false }) => {
    return (
        <div
            className={`role-card ${selected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <h3 className="role-card__title">{title}</h3>
            <p className="role-card__description">{description}</p>
        </div>
    );
};
