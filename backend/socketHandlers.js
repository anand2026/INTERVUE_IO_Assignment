import { pollManager } from './pollManager.js';
import { chatManager } from './chatManager.js';

let timerInterval = null;

export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`✅ Client connected: ${socket.id}`);

        // Student joins
        socket.on('student:join', ({ name }, callback) => {
            try {
                const students = pollManager.addStudent(socket.id, name);
                socket.data.role = 'student';
                socket.data.name = name;

                // Send current poll if exists
                const currentPoll = pollManager.getCurrentPoll();

                // Only send results if poll has ended (time expired or all answered)
                // Otherwise, let the student answer
                let results = null;
                let timeRemaining = null;

                if (currentPoll) {
                    const pollResults = pollManager.getResults();
                    timeRemaining = pollResults.timeRemaining;

                    const pollEnded = pollResults.timeRemaining === 0 ||
                        pollResults.answeredCount === pollResults.totalStudents;

                    // Only send results if poll has actually ended
                    if (pollEnded) {
                        results = pollResults;
                        timeRemaining = 0;
                    }
                }

                callback({ success: true, currentPoll, results, students, timeRemaining });

                // Notify all clients about updated student list
                io.emit('students:updated', students);

                console.log(`👨‍🎓 Student joined: ${name}`);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        // Teacher joins
        socket.on('teacher:join', (data, callback) => {
            // Handle both (data, callback) and (callback) patterns
            const actualCallback = typeof data === 'function' ? data : callback;

            socket.data.role = 'teacher';
            const students = pollManager.getStudentsList();
            const currentPoll = pollManager.getCurrentPoll();
            const results = pollManager.getResults();
            const pollHistory = pollManager.getPollHistory();

            if (actualCallback && typeof actualCallback === 'function') {
                actualCallback({
                    success: true,
                    students,
                    currentPoll,
                    results,
                    pollHistory
                });
            }

            console.log(`👨‍🏫 Teacher joined`);
        });

        // Teacher creates poll
        socket.on('teacher:createPoll', ({ question, options, timeLimit, correctOptionIndex }, callback) => {
            try {
                const poll = pollManager.createPoll(question, options, timeLimit, correctOptionIndex);

                // Clear any existing timer
                if (timerInterval) {
                    clearInterval(timerInterval);
                }

                // Start timer
                pollManager.resetTimer();
                timerInterval = setInterval(() => {
                    const timeRemaining = pollManager.decrementTimer();

                    // Broadcast time update
                    io.emit('poll:timerUpdate', { timeRemaining });

                    // When timer expires, show results and save to history
                    if (timeRemaining === 0) {
                        clearInterval(timerInterval);
                        const results = pollManager.getResults();
                        pollManager.savePollToHistory(); // Save poll to history
                        const pollHistory = pollManager.getPollHistory();
                        io.emit('poll:timeExpired', { results, pollHistory });
                    }
                }, 1000);

                callback({ success: true, poll });

                // Broadcast new poll to all students
                io.emit('poll:new', poll);

                console.log(`📊 New poll created: ${question}`);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        // Student submits answer
        socket.on('student:submitAnswer', ({ optionIndex }, callback) => {
            try {
                const studentName = socket.data.name;
                if (!studentName) {
                    throw new Error('Student not registered');
                }

                const results = pollManager.submitAnswer(socket.id, studentName, optionIndex);

                callback({ success: true, results });

                // Broadcast updated results to everyone
                io.emit('poll:resultsUpdated', results);

                // Note: Timer continues running until it reaches 0
                // This allows late-joining students to still answer

                console.log(`✍️ ${studentName} submitted answer`);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        // Teacher removes student
        socket.on('student:remove', ({ studentName }, callback) => {
            try {
                const { removedSocketId, students } = pollManager.removeStudentByName(studentName);

                callback({ success: true, students });

                // Notify removed student
                if (removedSocketId) {
                    io.to(removedSocketId).emit('student:removed');
                }

                // Broadcast updated student list
                io.emit('students:updated', students);

                // Check if results changed
                const results = pollManager.getResults();
                if (results) {
                    io.emit('poll:resultsUpdated', results);
                }

                console.log(`🚫 Student removed: ${studentName}`);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        // Get current results
        socket.on('poll:getResults', (callback) => {
            const results = pollManager.getResults();
            callback({ success: true, results });
        });

        // Get poll history (bonus feature)
        socket.on('poll:getHistory', (callback) => {
            const history = pollManager.getPollHistory();
            callback({ success: true, history });
        });

        // Chat message sent (bonus feature)
        socket.on('chat:sendMessage', ({ message }, callback) => {
            try {
                const sender = socket.data.name || 'Teacher';
                const role = socket.data.role || 'teacher';

                const newMessage = chatManager.addMessage(sender, message, role);

                callback({ success: true, message: newMessage });

                // Broadcast message to all clients
                io.emit('chat:newMessage', newMessage);

                console.log(`💬 ${sender} (${role}): ${message}`);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        // Get chat history
        socket.on('chat:getHistory', (dataOrCallback, maybeCallback) => {
            // Handle both (callback) and (data, callback) patterns
            const callback = typeof dataOrCallback === 'function' ? dataOrCallback : maybeCallback;
            const messages = chatManager.getMessages();
            if (callback && typeof callback === 'function') {
                callback({ success: true, messages });
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            if (socket.data.role === 'student' && socket.data.name) {
                pollManager.removeStudent(socket.id);
                const students = pollManager.getStudentsList();
                io.emit('students:updated', students);

                console.log(`👋 Student disconnected: ${socket.data.name}`);
            } else {
                console.log(`❌ Client disconnected: ${socket.id}`);
            }
        });
    });
}
