import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    text: 'Working with compartmentalized information is a difficult transition for new agents.',
}

export const textSlice = createSlice({
    name: 'script',
    initialState,
    reducers: {
        changeText(state, action) {
            state.text =  action.payload;
        },
    },
})

export const { changeText } = textSlice.actions;

export default textSlice.reducer;