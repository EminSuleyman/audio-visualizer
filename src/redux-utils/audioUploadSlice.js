import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    url: '',
}

export const urlSlice = createSlice({
    name: 'url',
    initialState,
    reducers: {
        uploadAudio(state, action) {
            state.url =  action.payload;
        },
    },
})

export const { uploadAudio } = urlSlice.actions;

export default urlSlice.reducer;