import React, { useState, useEffect, useRef } from 'react';
import smokeGrenadeImage from '../assets/smoke.png';
import smokeSoundEffect from '../assets/smoke.mp3';

function Canvas() {
  const [color, setColor] = useState('#000000'); // Default color is black
  const [activeBrush, setActiveBrush] = useState('draw'); //Default brush is draw
  const [volume, setVolume] = useState(0.05); // Default volume set to 0.5%
  const canvasRef = useRef(null);

  // Map references
  const ancientRef = useRef(null);
  const anubisRef = useRef(null);
  const dust2Ref = useRef(null);
  const infernoRef = useRef(null);
  const mirageRef = useRef(null);
  const vertigoRef = useRef(null);

  const aRef = useRef(null);
  const bRef = useRef(null);
  const wsRef = useRef(null);
  const bombRef = useRef(null);
  const soldierRef = useRef(null);
  const smokeRef = useRef(null);
  const pointRef = useRef(null);
  const smokeSoundRef = useRef(null);

  useEffect(() => {
    // Load smoke image
    smokeRef.current = new Image();
    smokeRef.current.src = smokeGrenadeImage;

    // Load smoke sound effect
    smokeSoundRef.current = new Audio(smokeSoundEffect);
    smokeSoundRef.current.volume = volume;
  }, []);
  
  useEffect(() => {
    if (smokeSoundRef.current) {
      smokeSoundRef.current.volume = volume;
    }
  }, [volume])

  // toggle drawing activeBrush
    const toggleActiveBrush = (brushType) => {
      setActiveBrush(brushType);
    };

    const playSmokeSoundEffect = () => {
      if (smokeSoundRef.current) {
        smokeSoundRef.current.currentTime = 0; // Reset the audio to the beginning
        smokeSoundRef.current.play();
      }
    };

    useEffect(() => {
    const ancient = ancientRef.current;
    const anubis = anubisRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let activeMap = "";

    wsRef.current = new WebSocket(`ws://localhost:5000`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'draw') {
        drawLine(ctx, data.x, data.y, data.lastX, data.lastY, data.color);
      } else if (data.type === 'smoke') {
        placeSmoke(ctx, data.x, data.y);
      } else if (data.type === 'clear') {
        clearCanvas();
      }
    };

    const drawLine = (context, x, y, lastX, lastY, strokeColor) => {
      context.strokeStyle = strokeColor;
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(x, y);
      context.stroke();
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      wsRef.current.send(JSON.stringify({ type: 'clear' }));
    };

    const placeSmoke = (context, x, y) => {
      if (smokeRef.current) {
        context.drawImage(smokeRef.current, x - 25, y - 25, 50, 50); // Adjust size as needed
      }
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (activeBrush === 'smoke') {
        placeSmoke(ctx, x, y);
        playSmokeSoundEffect();
        wsRef.current.send(JSON.stringify({ type: 'smoke', x, y }));
      } else if (activeBrush === 'draw') {
        isDrawing = true;
        [lastX, lastY] = [x, y];
      }
    };

    const handleMouseMove = (e) => {
      if (!isDrawing || activeBrush !== 'draw') return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      drawLine(ctx, x, y, lastX, lastY, color);
      wsRef.current.send(JSON.stringify({ type: 'draw', x, y, lastX, lastY, color }));
      
      [lastX, lastY] = [x, y];
    };

    const handleMouseUp = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    aRef.current.addEventListener('click', () => {
      if (activeMap)
      {
        clearCanvas();
        wsRef.current.send(JSON.stringify({ type: 'change_background' }));
        canvas.style.background = `url(/${activeMap}_A.png)`;
        canvas.style.backgroundSize = '100% 100%';
        canvas.style.backgroundRepeat = 'no-repeat';
        canvas.style.backgroundPosition = 'right';
      }
    });
      bRef.current.addEventListener('click', () => {
      if (activeMap)
      {
        clearCanvas();
        wsRef.current.send(JSON.stringify({ type: 'change_background' }));
        canvas.style.background = `url(/${activeMap}_MID.png)`;
        canvas.style.backgroundSize = '100% 100%';
        canvas.style.backgroundRepeat = 'no-repeat';
        canvas.style.backgroundPosition = 'right';
      }
    });

    ancient.addEventListener('mousedown', (e) =>{
      e.stopPropagation();
      activeMap = "de_ancient";
      clearCanvas();
      wsRef.current.send(JSON.stringify({ type: 'change_background' }));
      canvas.style.background = 'url(/de_ancient_mini.png)';
      canvas.style.backgroundSize = '100% 100%';
      canvas.style.backgroundRepeat = 'no-repeat';
      canvas.style.backgroundPosition = 'right';
    }); 
      anubis.addEventListener('mousedown', (e) =>{
      e.stopPropagation();
      activeMap = "de_anubis";
      clearCanvas();
      wsRef.current.send(JSON.stringify({ type: 'change_background' }));
      canvas.style.background = 'url(/de_anubis_mini.png)';
      canvas.style.backgroundSize = '100% 100%';
      canvas.style.backgroundRepeat = 'no-repeat';
      canvas.style.backgroundPosition = 'right';
    });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseUp);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [color, activeBrush]);

  return (
    <div>
        <div className='canvas-wrapper'>
          <div className='toolbar'>
            <a className='tool letter' ref={aRef}>A</a>
            <a className='tool letter' ref={bRef}>B</a>
            <img src='/Weapon_smokegrenade.png' onClick={() => toggleActiveBrush('smoke')} className='tool tool-img' alt='smoke granade' ref={smokeRef}></img>
            <img src='/soldier.png' className='tool tool-img' alt='soldier' ref={soldierRef}></img>
            <img src='/bomb.png' className='tool tool-img' alt='soldier' ref={bombRef}></img>
            <img src='/point.png' onClick={() => toggleActiveBrush('draw')} className='tool tool-img' alt='soldier' ref={pointRef}></img>
            <button onClick={() => setColor('#FF0000')} style={{backgroundColor: '#FF0000'}}>Red</button>
            <button onClick={() => setColor('#2ea44f')} style={{backgroundColor: '#2ea44f'}}>Green</button>
            <button onClick={() => setColor('#0000FF')} style={{backgroundColor: '#0000FF'}}>Blue</button>
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              style={{ width: '100%' , marginTop: '1vh' }}
            />
            <div>
              <label htmlFor="volume">Sound:</label>
              <input
                type="range"
                id="volume"
                min="0"
                max="0.4"
                step="0.01"
                style={{ width: '100%' }}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
            </div>
          </div>
          <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }} />
        </div>
        <div className='thumbnail-wrapper'>
          <img className='thumbnail ancient' ref={ancientRef} src="/de_ancient.png" alt="Logo" />
          <img className='thumbnail anubis' ref={anubisRef} src="/de_anubis.png" alt="Logo" />
          <img className='thumbnail dust2' ref={dust2Ref} src="/de_dust2.jpg" alt="Logo" />
          <img className='thumbnail inferno' ref={infernoRef} src="/de_inferno.png" alt="Logo" />
          <img className='thumbnail mirage' ref={mirageRef} src="/de_mirage.png" alt="Logo" />
          <img className='thumbnail nuke' src="/de_nuke.png" alt="Logo" />
          <img className='thumbnail overpass' src="/de_overpass.png" alt="Logo" />
          <img className='thumbnail vertigo' ref={vertigoRef} src="/de_vertigo.png" alt="Logo" />
        </div>
    </div>
  );
}

export default Canvas;