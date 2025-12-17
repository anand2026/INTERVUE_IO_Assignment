import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    role: null, // 'student' or 'teacher'
    name: null,
    isConnected: false
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setRole: (state, action) => {
            state.role = action.payload;
        },
        setName: (state, action) => {
            state.name = action.payload;
            // Save to sessionStorage
            sessionStorage.setItem('studentName', action.payload);
        },
        setConnected: (state, action) => {
            state.isConnected = action.payload;
        },
        clearUser: (state) => {
            state.role = null;
            state.name = null;
            state.isConnected = false;
            sessionStorage.removeItem('studentName');
        }
    }
});

export const { setRole, setName, setConnected, clearUser } = userSlice.actions;
export default userSlice.reducer;
