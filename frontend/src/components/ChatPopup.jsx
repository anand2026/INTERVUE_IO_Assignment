import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, X, Send } from 'lucide-react';
import { socketService } from '../services/socket';
import { addMessage, toggleChat, setMessages } from '../store/slices/chatSlice';
import './ChatPopup.css';

export const ChatPopup = () => {
    const dispatch = useDispatch();
    const { messages, isOpen } = useSelector((state) => state.chat);
    const { name, role } = useSelector((state) => state.user);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Load chat history
        socketService.emit('chat:getHistory')
            .then((response) => {
                dispatch(setMessages(response.messages));
            })
            .catch(console.error);

        // Listen for new messages
        const handleNewMessage = (message) => {
            dispatch(addMessage(message));
        };

        socketService.on('chat:newMessage', handleNewMessage);

        return () => {
            socketService.off('chat:newMessage', handleNewMessage);
        };
    }, [dispatch]);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        socketService.emit('chat:sendMessage', { message: inputMessage })
            .then(() => {
                setInputMessage('');
            })
            .catch(console.error);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                className="chat-toggle"
                onClick={() => dispatch(toggleChat())}
                title="Toggle Chat"
            >
                <MessageCircle size={24} />
            </button>

            {/* Chat Popup */}
            {isOpen && (
                <div className="chat-popup">
                    <div className="chat-popup__header">
                        <div className="chat-popup__title">
                            <MessageCircle size={20} />
                            <span>Chat</span>
                        </div>
                        <button
                            className="chat-popup__close"
                            onClick={() => dispatch(toggleChat())}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-popup__messages">
                        {messages.length === 0 ? (
                            <div className="chat-popup__empty">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`chat-message ${msg.sender === name ? 'chat-message--own' : ''}`}
                                >
                                    <div className="chat-message__header">
                                        <span className="chat-message__sender">
                                            {msg.sender}
                                            {msg.role === 'teacher' && ' 👨‍🏫'}
                                        </span>
                                        <span className="chat-message__time">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                    <div className="chat-message__content">
                                        {msg.message}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-popup__input" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="chat-popup__input-field"
                        />
                        <button
                            type="submit"
                            className="chat-popup__send-btn"
                            disabled={!inputMessage.trim()}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};
