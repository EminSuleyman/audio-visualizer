import React from 'react';
import './App.css';
import TextEditor from './components/textEditor';
import AudioWaveform from './components/audioWaveform';
import ScriptWaveform from './components/scriptWaveform';

function App() {

  return (
    <div className="App">
      <TextEditor/>
      <div className="waveform-container">
        <div className="audio-waveform">
          <AudioWaveform />
        </div>
        <div className="script-waveform">
          <ScriptWaveform />
        </div>
      </div>
    </div>
  );
}

export default App;
