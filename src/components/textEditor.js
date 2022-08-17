import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeText } from '../redux-utils/scriptTextSlice';

function TextEditor() {
    const text = useSelector((state) => state.scriptText.text)
    const dispatch = useDispatch()

    return (
        <>
            <h3>Script</h3>
            <textarea 
                className="text-script"
                rows={2}
                defaultValue={text}
                onChange={(e) => dispatch(changeText(e.target.value))}
            ></textarea>
        </>
    )
}

export default TextEditor;

