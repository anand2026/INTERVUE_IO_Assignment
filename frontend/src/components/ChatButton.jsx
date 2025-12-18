import React from 'react';
import { MessageSquare } from 'lucide-react';
import './ChatButton.css';

export const ChatButton = ({ onClick }) => {
    return (
        <button className="chat-button" onClick={onClick} aria-label="Open Chat">
            <MessageSquare size={24} />
        </button>
    );
};
