import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Send, UserX } from 'lucide-react';
import { socketService } from '../services/socket';
import { addMessage, setMessages } from '../store/slices/chatSlice';
import './Sidebar.css';

export const Sidebar = ({ activeTab, onClose, isTeacher = false }) => {
    const dispatch = useDispatch();
    const { messages } = useSelector((state) => state.chat);
    const { name } = useSelector((state) => state.user);
    const { students } = useSelector((state) => state.poll);
    const [inputMessage, setInputMessage] = React.useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Load chat history if opening chat tab
        if (activeTab === 'chat') {
            socketService.emit('chat:getHistory')
                .then((response) => {
                    if (response.messages) {
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

    const handleKickStudent = async (studentName) => {
        if (!isTeacher) return;
        if (!window.confirm(`Are you sure you want to kick ${studentName}?`)) return;

        try {
            await socketService.emit('teacher:removeStudent', { name: studentName });
        } catch (error) {
            console.error('Failed to kick student:', error);
        }
    };

    if (!activeTab) return null;

    return (
        <div className={`sidebar ${activeTab ? 'open' : ''}`}>
            <div className="sidebar__header">
                <h3 className="sidebar__title">
                    {activeTab === 'chat' ? 'Chat' : 'Participants'}
                </h3>
                <button className="sidebar__close" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            {activeTab === 'chat' && (
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
                                        <div className="chat-message__bubble">
                                            {!isOwnMessage && (
                                                <span className="chat-message__sender">
                                                    {msg.role === 'teacher' ? '👨‍🏫 ' : ''}{msg.sender}
                                                </span>
                                            )}
                                            <div className="chat-message__text">{msg.message}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="sidebar__input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="sidebar__input"
                        />
                        <button
                            type="submit"
                            className="sidebar__send-btn"
                            disabled={!inputMessage.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'participants' && (
                <div className="sidebar__content">
                    <div className="participants-list">
                        <div className="participants-header">
                            <span>Name</span>
                            {isTeacher && <span>Action</span>}
                        </div>
                        {students.length === 0 ? (
                            <div className="sidebar__empty">No students joined yet</div>
                        ) : (
                            students.map((student) => (
                                <div key={student.name} className="participant-row">
                                    <div className="participant-info">
                                        <span className="participant-name">{student.name}</span>
                                    </div>
                                    {isTeacher && (
                                        <button
                                            className="kick-btn"
                                            onClick={() => handleKickStudent(student.name)}
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
