import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import { useDispatch } from 'react-redux';
import { setAudioDuration, setAudioCurrentTime } from '../redux-utils/audioSlice';
import { uploadAudio } from '../redux-utils/audioUploadSlice';
import { Button, Chip } from '@mui/material';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

const AudioWaveform = () => {
	const wavesurferRef = useRef(null);
    const timelineRef = useRef(null);
	const dispatch = useDispatch();

	// crate an instance of the wavesurfer
	const [audioFile, setAudioFile] = useState();
	const [wavesurferObj, setWavesurferObj] = useState();
	const [playing, setPlaying] = useState(false); 
	const [duration, setDuration] = useState('0:00');
	const [currentTime, setCurrentTime] = useState('0:00');

	// handle audio file upload and store it
    useEffect(() => {
        if(audioFile) {
            dispatch(uploadAudio(audioFile));
        }
    }, [audioFile, dispatch]);

    const handleFileUpload = (e) => {
        const audioURL = URL.createObjectURL(e.target.files[0]);
        setAudioFile(audioURL);
	};

	// create wavesurfer instance
	useEffect(() => {
		if (wavesurferRef.current && !wavesurferObj && audioFile) {
			setWavesurferObj(
				WaveSurfer.create({
					container: wavesurferRef.current,
					autoCenter: true,
					cursorColor: 'red',
					waveColor: '#8A8A8A',
					progressColor: '#0000FF',
					responsive: true,
					plugins: [
						TimelinePlugin.create({
							container: '#wave-timeline',
                            timeInterval: 0.1,
                            
						}),
					],
				})
			);
		}
	}, [wavesurferRef, wavesurferObj, audioFile]);

	useEffect(() => {
		if (audioFile && wavesurferObj) {
			wavesurferObj.load(audioFile);
		}
	}, [audioFile, wavesurferObj]);

	useEffect(() => {
		if (wavesurferObj) {
			wavesurferObj.on('ready', () => {
				setDuration(timeCalculator(wavesurferObj.getDuration().toFixed(0)));
				storeAudioDuration();	// store audio duration
			});

			wavesurferObj.on('audioprocess', () => {
				setCurrentTime(timeCalculator(wavesurferObj.getCurrentTime().toFixed(0)));
				storeAudioCurrentTime();	//store audio current time
			});

			wavesurferObj.on('seek', () => {
				setCurrentTime(timeCalculator(wavesurferObj.getCurrentTime().toFixed(0)));
				storeAudioCurrentTime();	//store audio current time
			});

			wavesurferObj.on('play', () => {
				setPlaying(true);
			});

			wavesurferObj.on('finish', () => {
				setPlaying(false);
			});
		}
	});

	const storeAudioDuration = () => {
		dispatch(setAudioDuration(wavesurferObj.getDuration().toFixed(2)));
	}

	const storeAudioCurrentTime = () => {
		dispatch(setAudioCurrentTime(wavesurferObj.getCurrentTime().toFixed(2)));
	}

	const handlePlayPause = () => {
		if(wavesurferObj){
			wavesurferObj.playPause();
			setPlaying(!playing);
		}        
	};

	const timeCalculator = (time) => {
		let sec = Math.floor(time % 60);
		let min = Math.floor((time * 60) % 60);
		if( sec < 10 ){
			sec = '0' + sec;
		}
		return min + ':' + sec;
	}

	return (
		<>
			<div className="audio-controls">
				<Button variant="contained" component="label">
					Upload 
					<AudiotrackIcon fontSize="small"/>
					<input
						hidden
						type='file'
						id='file'
						accept='audio/*'
						onChange={handleFileUpload}
					/>
				</Button>
				<Button variant="contained" component="label" onClick={handlePlayPause}>
					{ playing ? "Pause" : "Play" }					
				</Button>
				<Chip label={currentTime +' / '+ duration} variant="outlined" />
			</div>
			{ audioFile && <>
				<h3>Audio Waveform</h3>
				<div ref={timelineRef} id="wave-timeline" />
				<div id="audioWave-container">
					<div id="amplitude-bar">
						<span className="amplitude-line"><b>1.0</b></span>
						<span className="amplitude-line">0.5</span>
						<span className="amplitude-line"><b>0.0</b></span>
						<span className="amplitude-line">-0.5</span>
						<span className="amplitude-line"><b>-1.0</b></span>
					</div>
					<div ref={wavesurferRef} id="audio-waveform" />
				</div>
			</>}
		</>
	);
};

export default AudioWaveform;
