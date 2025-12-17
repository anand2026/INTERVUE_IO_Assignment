import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    messages: [],
    isOpen: false
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        toggleChat: (state) => {
            state.isOpen = !state.isOpen;
        },
        setChatOpen: (state, action) => {
            state.isOpen = action.payload;
        }
    }
});

export const { addMessage, setMessages, toggleChat, setChatOpen } = chatSlice.actions;
export default chatSlice.reducer;
