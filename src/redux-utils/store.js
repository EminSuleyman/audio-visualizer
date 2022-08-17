import { configureStore } from '@reduxjs/toolkit'
import textReducer from './scriptTextSlice'
import audioUploadReducer from './audioUploadSlice'
import audioStatusReducer from './audioSlice'

export default configureStore({
    reducer: {
        scriptText: textReducer,
        audioUpload: audioUploadReducer,
        audio: audioStatusReducer,
    },
});


