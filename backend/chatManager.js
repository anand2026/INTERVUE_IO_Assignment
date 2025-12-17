class ChatManager {
    constructor() {
        this.messages = [];
        this.maxMessages = 100; // Keep last 100 messages
    }

    addMessage(sender, message, role) {
        const newMessage = {
            id: Date.now(),
            sender,
            message,
            role, // 'teacher' or 'student'
            timestamp: Date.now()
        };

        this.messages.push(newMessage);

        // Keep only last maxMessages
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }

        return newMessage;
    }

    getMessages() {
        return this.messages;
    }

    clearMessages() {
        this.messages = [];
    }
}

export const chatManager = new ChatManager();
