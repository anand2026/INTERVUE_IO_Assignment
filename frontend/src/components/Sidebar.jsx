import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Send, UserX } from 'lucide-react';
import { socketService } from '../services/socket';
import { addMessage, setMessages } from '../store/slices/chatSlice';
import './Sidebar.css';

export const Sidebar = ({ activeTab: initialTab, onClose, isTeacher = false }) => {
    const dispatch = useDispatch();
    const { messages } = useSelector((state) => state.chat);
    const { name } = useSelector((state) => state.user);
    const { students } = useSelector((state) => state.poll);
    const [inputMessage, setInputMessage] = React.useState('');
    const [activeTab, setActiveTab] = React.useState(initialTab || 'chat');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Load chat history if opening chat tab
        if (activeTab === 'chat') {
            socketService.emit('chat:getHistory')
                .then((response) => {
                    if (response && response.messages) {
                        dispatch(setMessages(response.messages));
                    }
                })
                .catch(console.error);
        }
    }, [activeTab, dispatch]);

    useEffect(() => {
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeTab]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        socketService.emit('chat:sendMessage', { message: inputMessage })
            .then(() => {
                setInputMessage('');
            })
            .catch(console.error);
    };

    const handleRemoveStudent = (studentName) => {
        if (!window.confirm(`Remove ${studentName}?`)) return;

        socketService.emit('student:remove', { studentName })
            .then((response) => {
                if (!response.success) {
                    alert('Failed to remove student');
                }
            })
            .catch(console.error);
    };

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__tabs">
                    <button
                        className={`sidebar__tab ${activeTab === 'chat' ? 'sidebar__tab--active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        Chat
                    </button>
                    <button
                        className={`sidebar__tab ${activeTab === 'participants' ? 'sidebar__tab--active' : ''}`}
                        onClick={() => setActiveTab('participants')}
                    >
                        Participants
                    </button>
                </div>
                <button className="sidebar__close" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            {activeTab === 'chat' ? (
                <div className="sidebar__content sidebar__content--chat">
                    <div className="sidebar__messages">
                        {messages.length === 0 ? (
                            <div className="sidebar__empty">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isOwnMessage = msg.sender === name;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`chat-message ${isOwnMessage ? 'chat-message--own' : ''}`}
                                    >
                                        {!isOwnMessage && (
                                            <span className="chat-message__sender">
                                                {msg.sender}
                                            </span>
                                        )}
                                        <div className="chat-message__bubble">
                                            <div className="chat-message__text">{msg.message}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="sidebar__input-form" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="sidebar__input"
                        />
                        <button type="submit" className="sidebar__send-btn">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            ) : (
                <div className="sidebar__content sidebar__content--participants">
                    <div className="sidebar__participants">
                        {students.length === 0 ? (
                            <div className="sidebar__empty">
                                No students have joined yet.
                            </div>
                        ) : (
                            students.map((student, index) => (
                                <div key={index} className="sidebar__participant">
                                    <span className="sidebar__participant-name">{student.name}</span>
                                    {isTeacher && (
                                        <button
                                            className="sidebar__remove-btn"
                                            onClick={() => handleRemoveStudent(student.name)}
                                            title="Remove student"
                                        >
                                            Kick out
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
