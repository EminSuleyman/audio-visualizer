import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    duration: 0,
    currentTime: 0,
}

export const audioSlice = createSlice({
    name: 'audio',
    initialState,
    reducers: {
        setAudioDuration(state, action) {
            state.duration =  action.payload;
        },
        setAudioCurrentTime(state, action) {
            state.currentTime = action.payload;
        },
    },
})

export const { setAudioDuration, setAudioCurrentTime } = audioSlice.actions;

export default audioSlice.reducer;