import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

function ScriptWaveform() {
    const canvasRef = useRef();
    const scriptText = useSelector((state) => state.scriptText.text);
    const audio = useSelector((state) => state.audioUpload.url);
    const audioDuration = useSelector((state) => state.audio.duration);
    const audioCurrentTime = useSelector((state) => state.audio.currentTime);
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth-6.5*parseFloat(getComputedStyle(document.documentElement).fontSize));
    const canvasHeight = 300;
    const axis_x_len_default = canvasWidth - 70;
    const amplitude_up = canvasHeight*20/100;
    const amplitude_down = canvasHeight*80/100;
    const [peaks, setPeaks] = useState([]);
    let start_pos = 41;   
    const radius = 7;
    const [dragDiff, setDragDiff] = useState();
    const mouseDownRef = useRef(false);
    const [selectedPeak, setSelectedPeak] = useState();

    // detect window resize and adjust canvas width due to new size
    // initialize variables
    useEffect(() => {
        window.addEventListener('resize', () => {
            // set canvas width 6.5 rem less than window width
            setCanvasWidth(window.innerWidth-6.5*parseFloat(getComputedStyle(document.documentElement).fontSize));
        });
    });    

    useEffect(() => {
        setPeaks([]);   // reset peaks when window size changes
    }, [canvasWidth]);

    useEffect(() => {
        if(canvasRef.current) {
            clearCanvas();
            drawCoordinateAxis();
            drawScriptText();
            drawWaveform();
            timelineBar();
        }        
    });

    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    const drawCoordinateAxis = () => {
        const ctx = canvasRef.current.getContext('2d');
        // draw axis y
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(40, canvasHeight);

        // draw ticks of axis y
        ctx.moveTo(40, 0);
        ctx.lineTo(30, 10);

        ctx.moveTo(40, 0);
        ctx.lineTo(50, 10);

        ctx.moveTo(40, canvasHeight);
        ctx.lineTo(30, canvasHeight-10);   
        
        ctx.moveTo(40, canvasHeight);
        ctx.lineTo(50, canvasHeight-10); 

        // draw axis x
        ctx.moveTo(35, canvasHeight/2);
        ctx.lineTo(canvasWidth, canvasHeight/2);

        // draw ticks of axis x
        ctx.moveTo(canvasWidth, canvasHeight/2);
        ctx.lineTo(canvasWidth-10, canvasHeight/2-10);

        ctx.moveTo(canvasWidth, canvasHeight/2);
        ctx.lineTo(canvasWidth-10, canvasHeight/2+10);

        ctx.stroke();

        // draw grid lines of axis y
        // 0
        ctx.font = '20px  Comic Sans MS';
        ctx.fillText("0", 20, canvasHeight/2+5);

        // +1
        ctx.beginPath();
        ctx.moveTo(35, amplitude_up);
        ctx.lineTo(45, amplitude_up);
        ctx.fillText("+1", 15, amplitude_up+5);
        
        // -1
        ctx.moveTo(35, amplitude_down);
        ctx.lineTo(45, amplitude_down);
        ctx.stroke();
        ctx.fillText("-1", 15, amplitude_down+5);
    }

    const drawScriptText = () => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.save();
        const font_size = parseInt(canvasWidth * 1.3/100); // 1.3% of window width
        ctx.font = `${font_size}px  Comic Sans MS`;

        // ignore puntuation marks and split text to words
        const text = scriptText.replace(/[.,/#!?$%^&*;:{}=\-_`~()]/g,"").replace(/ +(?= )/g,'').split(" ");
        let x = 50;
        const text_len = scriptText.replace(/\s/g, "").length; // length of text without spaces based on the number of letters
        const axis_x_len = axis_x_len_default - (text.length-1) * 30; // length of axis x after subtracting spaces between words 
        const letter_weight = parseInt(axis_x_len / text_len);
        text.forEach((word, index) => {
            ctx.fillStyle = "#000000"; // word background color
            const word_width = parseInt(ctx.measureText(word).width)
            const rect_width = word_width + 20;
            const rect_height = parseInt(ctx.measureText(word).fontBoundingBoxAscent);
            const word_sec = letter_weight * word.length;
            const offset = (word_sec - rect_width)/2; // offset to position each word in the middle of the word sector
            ctx.fillRect(x+offset, canvasHeight/2-rect_height-17, rect_width, rect_height+15);
            ctx.fillStyle = "#00b33c"; // word color
            ctx.fillText(word, x+offset+10, canvasHeight/2-rect_height+5);

            // define peaks of word
            let cpx1, cpy1, x1, y1, cpx2, cpy2, x2, y2;
            cpx1 = x-15;
            x1 = parseInt(x+word_sec/2);
            cpx2 = parseInt(x+word_sec+20);
            x2 = parseInt(x+word_sec+15);
            y2 = parseInt(canvasHeight/2);
            if (index % 2 === 0) {
                // even index is amplitude (+1) - amplitude_up
                cpy1 = parseInt(amplitude_up);
                y1 = parseInt(amplitude_up);
                cpy2 = parseInt(amplitude_up);

            } else {
                // odd index is amplitude (-1) - amplitude_down
                cpy1 = parseInt(amplitude_down);
                y1 = parseInt(amplitude_down);
                cpy2 = parseInt(amplitude_down);
            }
            const p = ({cpx1: cpx1, cpy1: cpy1, 
                        x1: x1, y1: y1,
                        cpx2: cpx2, cpy2: cpy2,
                        x2: x2, y2: y2});

            if(peaks.length < text.length) 
                setPeaks(old => [...old, p]);
            else if (peaks.length > text.length) 
                setPeaks([]); // reset peaks

            // add thecurrent word sector onto x for the next word
            x += word_sec+30; 
        });
        ctx.restore();
    }

    const drawWaveform = () => {
        if(peaks.length > 0) {        
            const ctx = canvasRef.current.getContext("2d");
            ctx.beginPath();
            let x0 = 40, 
                y0 = canvasHeight/2;
            ctx.moveTo(x0, y0);
            ctx.bezierCurveTo(  x0, y0, 
                                peaks[0].cpx1, peaks[0].cpy1, 
                                peaks[0].x1, peaks[0].y1 ); // first sub-wave
            for (let i = 0; i < peaks.length-1; i++) {
                ctx.bezierCurveTo(  peaks[i].cpx2, peaks[i].cpy2, 
                                    peaks[i+1].cpx1, peaks[i+1].cpy1, 
                                    peaks[i+1].x1, peaks[i+1].y1 );
            }
            const last = peaks.length - 1;
            ctx.bezierCurveTo(  peaks[last].x1, peaks[last].y1, 
                                peaks[last].cpx2, peaks[last].cpy2, 
                                peaks[last].x2, peaks[last].y2 ); // last sub-wave
            ctx.stroke();
            
            // draw peak circles
            ctx.save();
            peaks.forEach( peak => {
                ctx.beginPath();
                ctx.arc(peak.x1, peak.y1, radius, 0, 2*Math.PI);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.closePath();
                ctx.stroke();
            });
            ctx.restore();
        }
    }
    
    const timelineBar = () => {
        const durationPercentage = audioCurrentTime*100/audioDuration;
        let pos_x = axis_x_len_default*durationPercentage/100;
        if(audioCurrentTime === 0) pos_x = 0;
        const ctx = canvasRef.current.getContext("2d");
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "red";
        ctx.moveTo(start_pos+pos_x, amplitude_up-20);
        ctx.lineTo(start_pos+pos_x, amplitude_down+20);
        ctx.stroke();
        ctx.restore();      
    }
    
    function isPeak(point, peak) {
        return Math.sqrt((point.x-peak.x1) ** 2 + (point.y - peak.y1) ** 2) < radius;
    }

    const handleMouseDown = (e) => {
        var rect = canvasRef.current.getBoundingClientRect();
        let mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          };

        if (e.button === 0) {   // if left button is down
            peaks.forEach( (peak, i) => {
                if(isPeak(mousePos, peak)) {
                    mouseDownRef.current = true;
                    mousePos.x -= peak.x1;
                    mousePos.y -= peak.y1
                    setDragDiff(mousePos);
                    setSelectedPeak(i); // save index of selected peak point
                }
            });
        }
    }

    const handleMouseMove = (e) => {
        // mouse coordinate on canvas
        const mousePos = { 
            x: e.clientX - canvasRef.current.getBoundingClientRect().left, 
            y: e.clientY - canvasRef.current.getBoundingClientRect().top
          };

        if (mouseDownRef.current){
            const currentPos = {
                x: mousePos.x - dragDiff.x,
                y: mousePos.y - dragDiff.y
            }
            let new_peaks = [...peaks];
            new_peaks[selectedPeak].x1 = currentPos.x;
            new_peaks[selectedPeak].y1 = currentPos.y;
            setPeaks(new_peaks);
        }
        else {
            return;
        }
    }

    const handleMouseUp = (e) => {
        mouseDownRef.current = false;
        setSelectedPeak(null);
    }

    return (
        audio &&
            <>
                <h3>Script Waveform</h3>
                <canvas ref={canvasRef} 
                        className="script-canvas" 
                        width={canvasWidth} 
                        height={canvasHeight} 
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                />
            </>
    )
}

export default ScriptWaveform;