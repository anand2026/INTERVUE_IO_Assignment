import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentPoll: null,
    results: null,
    students: [],
    hasAnswered: false,
    timeRemaining: 60,
    pollHistory: []
};

const pollSlice = createSlice({
    name: 'poll',
    initialState,
    reducers: {
        setCurrentPoll: (state, action) => {
            state.currentPoll = action.payload;
            state.hasAnswered = false;
        },
        setResults: (state, action) => {
            state.results = action.payload;
        },
        setStudents: (state, action) => {
            state.students = action.payload;
        },
        setHasAnswered: (state, action) => {
            state.hasAnswered = action.payload;
        },
        setTimeRemaining: (state, action) => {
            state.timeRemaining = action.payload;
        },
        setPollHistory: (state, action) => {
            state.pollHistory = action.payload;
        },
        clearPoll: (state) => {
            state.currentPoll = null;
            state.results = null;
            state.hasAnswered = false;
            state.timeRemaining = 60;
        }
    }
});

export const {
    setCurrentPoll,
    setResults,
    setStudents,
    setHasAnswered,
    setTimeRemaining,
    setPollHistory,
    clearPoll
} = pollSlice.actions;

export default pollSlice.reducer;
