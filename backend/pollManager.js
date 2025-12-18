import { v4 as uuidv4 } from 'uuid';

/**
 * PollManager Service
 * 
 * Responsible for managing the lifecycle of polls, student sessions,
 * answer tracking, and time management.
 * 
 * Follows the Singleton pattern (exported instance) to ensure
 * consistent state across all socket connections.
 */
class PollManager {
    constructor() {
        this.currentPoll = null;
        this.students = new Map(); // socketId -> { name, hasAnswered }
        this.answers = new Map(); // studentName -> optionIndex
        this.pollHistory = []; // For bonus feature: past polls
        this.timerInterval = null;
        this.timeRemaining = 60;
    }

    // Check if teacher can ask a new question
    canAskNewQuestion() {
        if (!this.currentPoll) return true;

        // Allow new question if timer expired OR all students answered
        if (this.timeRemaining === 0) return true;

        const allAnswered = Array.from(this.students.values()).every(
            student => student.hasAnswered
        );

        return allAnswered;
    }

    // Create a new poll
    createPoll(question, options, timeLimit = 60, correctOptionIndex = null) {
        if (!this.canAskNewQuestion()) {
            throw new Error('Cannot create new poll: not all students have answered');
        }

        // Save previous poll to history if exists
        if (this.currentPoll) {
            this.savePollToHistory();
        }

        this.currentPoll = {
            id: uuidv4(),
            question,
            options,
            correctOptionIndex,
            timeLimit,
            createdAt: Date.now()
        };

        // Reset answers and student states
        this.answers.clear();
        this.students.forEach(student => {
            student.hasAnswered = false;
        });

        this.timeRemaining = timeLimit;
        return this.currentPoll;
    }

    // Student submits answer
    submitAnswer(socketId, studentName, optionIndex) {
        if (!this.currentPoll) {
            throw new Error('No active poll');
        }

        const student = this.students.get(socketId);
        if (!student) {
            throw new Error('Student not found');
        }

        if (student.hasAnswered) {
            throw new Error('Already answered');
        }

        this.answers.set(studentName, optionIndex);
        student.hasAnswered = true;

        return this.getResults();
    }

    // Get current results
    getResults() {
        if (!this.currentPoll) return null;

        const results = {
            pollId: this.currentPoll.id,
            question: this.currentPoll.question,
            options: this.currentPoll.options,
            votes: new Array(this.currentPoll.options.length).fill(0),
            studentAnswers: [],
            totalStudents: this.students.size,
            answeredCount: Array.from(this.students.values()).filter(s => s.hasAnswered).length,
            timeRemaining: this.timeRemaining
        };

        // Count votes
        this.answers.forEach((optionIndex, studentName) => {
            results.votes[optionIndex]++;
            results.studentAnswers.push({
                name: studentName,
                answer: this.currentPoll.options[optionIndex]
            });
        });

        return results;
    }

    // Add student
    addStudent(socketId, name) {
        // Check if name already exists
        const nameExists = Array.from(this.students.values()).some(
            student => student.name === name
        );

        if (nameExists) {
            throw new Error('Name already taken');
        }

        this.students.set(socketId, {
            name,
            hasAnswered: false,
            joinedAt: Date.now()
        });

        return this.getStudentsList();
    }

    // Remove student
    removeStudent(socketId) {
        this.students.delete(socketId);
        return this.getStudentsList();
    }

    // Remove student by name (teacher action)
    removeStudentByName(name) {
        let removedSocketId = null;
        this.students.forEach((student, socketId) => {
            if (student.name === name) {
                removedSocketId = socketId;
            }
        });

        if (removedSocketId) {
            this.students.delete(removedSocketId);
            this.answers.delete(name);
        }

        return { removedSocketId, students: this.getStudentsList() };
    }

    // Get list of students
    getStudentsList() {
        return Array.from(this.students.values()).map(student => ({
            name: student.name,
            hasAnswered: student.hasAnswered
        }));
    }

    // Get current poll info
    getCurrentPoll() {
        return this.currentPoll;
    }

    // Decrement timer
    decrementTimer() {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;
        }
        return this.timeRemaining;
    }

    // Reset timer
    resetTimer() {
        this.timeRemaining = this.currentPoll ? this.currentPoll.timeLimit : 60;
    }

    // Save current poll to history
    savePollToHistory() {
        if (this.currentPoll) {
            // Check if poll is already in history (prevent duplicates)
            const alreadySaved = this.pollHistory.some(p => p.id === this.currentPoll.id);
            if (!alreadySaved) {
                const results = this.getResults();
                console.log('📊 Saving poll to history:', {
                    question: this.currentPoll.question,
                    votes: results?.votes,
                    answeredCount: results?.answeredCount,
                    answersMap: Array.from(this.answers.entries())
                });
                this.pollHistory.push({
                    ...this.currentPoll,
                    results,
                    completedAt: Date.now()
                });
            }
        }
    }

    // Get poll history (bonus feature)
    getPollHistory() {
        return this.pollHistory;
    }

    // Clear current poll
    clearCurrentPoll() {
        this.savePollToHistory();
        this.currentPoll = null;
        this.answers.clear();
        this.students.forEach(student => {
            student.hasAnswered = false;
        });
        this.timeRemaining = 60;
    }
}

export const pollManager = new PollManager();
