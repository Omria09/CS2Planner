import React from 'react';
import Canvas from './components/Canvas';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1 className='barlow-condensed-regular user-none'>CS2 Strategy Planner</h1>
      <h2 className='barlow-condensed-regular user-none' style={{color: '#FF0000'}}>Caution! Very early in development</h2>
      <Canvas />
    </div>
  );
}

export default App;