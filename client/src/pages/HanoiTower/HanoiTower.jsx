import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../Providers/ThemeProvider';
import { useAuth } from '../../Providers/AuthProvider';
import { useNotification } from '../../Providers/NotificationProvider';
import click from '../../assets/click.WAV';
import win from '../../assets/win.WAV';

const diskColors = [
  'linear-gradient(135deg, #ff0080, #ff8c00)',
  'linear-gradient(135deg, #00d9ff, #7000ff)',
  'linear-gradient(135deg, #00ff88, #00ccff)',
  'linear-gradient(135deg, #ffea00, #ff6b00)',
  'linear-gradient(135deg, #ff0080, #4b0082)',
  'linear-gradient(135deg, #00fff2, #ff00ea)',
  'linear-gradient(135deg, #ff1493, #ff69b4)',
  'linear-gradient(135deg, #00bfff, #1e90ff)',
  'linear-gradient(135deg, #ff69b4, #ffb6c1)',
  'linear-gradient(135deg, #00ffff, #0080ff)',
];

const diskWidths = [20, 30, 40, 50, 60, 70, 80, 90, 95, 100];
const diskMinWidths = [60, 80, 100, 120, 140, 160, 180, 200, 220, 240];

function Disk({ size }) {
  const diskStyle = {
    width: `${diskWidths[size - 1]}%`,
    minWidth: `${diskMinWidths[size - 1]}px`,
    background: diskColors[size - 1],
    padding: '10px',
    borderRadius: '12px',
    textAlign: 'center',
    fontWeight: '900',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 0 25px rgba(255, 255, 255, 0.4)',
    transition: 'all 0.3s ease',
    textShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
  };

  return <div style={diskStyle}>Disk {size}</div>;
}

function Peg({ name, disks, onClick, selected }) {
  const { theme } = useTheme();
  
  const pegStyle = {
    flex: 1,
    minWidth: '140px',
    padding: '16px',
    borderRadius: '16px',
    background: theme === 'dark' ? 'rgba(15, 20, 40, 0.5)' : 'rgba(240, 240, 255, 0.5)',
    border: theme === 'dark' ? '2px solid rgba(0, 255, 242, 0.25)' : '2px solid rgba(108, 92, 231, 0.25)',
    boxShadow: theme === 'dark' ? '0 0 20px rgba(112, 0, 255, 0.3)' : '0 0 20px rgba(108, 92, 231, 0.3)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    transform: selected ? 'translateY(-5px)' : 'none',
  };

  const pegNameStyle = {
    color: theme === 'dark' ? '#00fff2' : '#6c5ce7',
    fontWeight: '900',
    fontSize: '1.2rem',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    marginBottom: '12px',
    textShadow: theme === 'dark' ? '0 0 10px rgba(0, 255, 242, 0.8)' : '0 0 10px rgba(108, 92, 231, 0.5)',
  };

  const pegStackStyle = {
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    gap: '6px',
    paddingTop: '12px',
  };

  return (
    <div style={pegStyle} onClick={() => onClick(name)}>
      <div style={pegNameStyle}>{name}</div>
      <div style={pegStackStyle}>
        {disks.map((d, i) => <Disk key={i} size={d} />)}
      </div>
    </div>
  );
}

export default function HanoiGame() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [n, setN] = useState(5);
  const [pegsCount, setPegsCount] = useState(3);
  const [pegsState, setPegsState] = useState({ A: [], B: [], C: [], D: [] });
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [win, setWin] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [playerMoves, setPlayerMoves] = useState([]);

  const clickSound = useRef(null);
  const moveSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => resetPegs(n, pegsCount), [n, pegsCount]);

  useEffect(() => {
    let interval = null;
    if (startTime && !win) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (win && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, win]);

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function resetPegs(nn = n) {
    const A = [];
    for (let i = nn; i >= 1; i--) A.push(i);
    setPegsState({ A, B: [], C: [], D: [] });
    setSelectedPeg(null);
    setMoveCount(0);
    setWin(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setPlayerMoves([]);
  }

  function playSound(ref) {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => {}); 
    }
  }

  function handlePegClick(name) {
    if (win) return;

    playSound(clickSound);

    if (!selectedPeg) {
      if (pegsState[name].length === 0) return;
      setSelectedPeg(name);
    } else {
      if (selectedPeg === name) { setSelectedPeg(null); return; }

      const from = selectedPeg, to = name;
      const src = pegsState[from], dst = pegsState[to];
      if (src.length === 0) return;
      const moving = src[src.length - 1], top = dst[dst.length - 1];
      if (top && moving > top) { 
        showNotification('Invalid move!', 'error', 2000);
        setSelectedPeg(null); 
        return; 
      }

      const newState = JSON.parse(JSON.stringify(pegsState));
      newState[to].push(newState[from].pop());
      setPegsState(newState);
      setMoveCount(m => m + 1);
      setPlayerMoves(moves => [...moves, { from, to }]);
      setSelectedPeg(null);
      playSound(moveSound);
      checkWin(newState);
    }
  }

  function checkWin(state) {
    const target = pegsCount === 3 ? 'C' : 'D';
    if (state[target].length === n) {
      setWin(true);
      playSound(winSound);
      showNotification('🎉 You won!', 'success', 3000);
      saveResultToDB();
    }
  }

  async function saveResultToDB() {
    if (!user) {
      showNotification('Please login to save your result', 'warning', 3000);
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    try {
      const res = await fetch(`${API_URL}/hanoi/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: user.username || user.name,
          disks: n,
          pegs: pegsCount,
          moves: moveCount + 1,
          time: elapsedTime,
          playerMoves: playerMoves.map(m => `${m.from}->${m.to}`)
        })
      });
      const data = await res.json();
      showNotification(data.message || 'Result saved!', 'success', 3000);
    } catch (err) {
      console.error(err);
      showNotification('Failed to save result', 'error', 3000);
    }
  }

  // Styles
  const gameStyle = {
    fontFamily: "'Orbitron', system-ui, sans-serif",
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '20px',
  };

  const controlsStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '25px',
    alignItems: 'flex-end',
  };

  const labelStyle = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: theme === 'dark' ? '#00fff2' : '#6c5ce7',
    fontWeight: '700',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: theme === 'dark' ? '0 0 10px rgba(0, 255, 242, 0.6)' : '0 0 10px rgba(108, 92, 231, 0.4)',
  };

  const inputStyle = {
    background: theme === 'dark' ? 'rgba(10, 14, 39, 0.8)' : 'rgba(248, 249, 250, 0.8)',
    color: theme === 'dark' ? '#00fff2' : '#6c5ce7',
    border: theme === 'dark' ? '2px solid rgba(0, 255, 242, 0.4)' : '2px solid rgba(108, 92, 231, 0.4)',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '1.1rem',
    fontWeight: '700',
    textAlign: 'center',
    outline: 'none',
    boxShadow: theme === 'dark' ? '0 0 20px rgba(112, 0, 255, 0.4)' : '0 0 20px rgba(108, 92, 231, 0.3)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    minWidth: '80px',
  };

  const buttonStyle = {
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #00fff2, #7000ff)' 
      : 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '14px 28px',
    fontWeight: '800',
    cursor: 'pointer',
    fontSize: '15px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    boxShadow: theme === 'dark' 
      ? '0 0 30px rgba(112, 0, 255, 0.6)' 
      : '0 0 30px rgba(108, 92, 231, 0.4)',
    transition: 'all 0.3s ease',
  };

  const boardStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '20px',
    padding: '30px',
    borderRadius: '25px',
    background: theme === 'dark' ? 'rgba(10, 14, 39, 0.6)' : 'rgba(248, 249, 250, 0.6)',
    boxShadow: theme === 'dark' 
      ? '0 0 60px rgba(112, 0, 255, 0.4)' 
      : '0 0 60px rgba(108, 92, 231, 0.3)',
    backdropFilter: 'blur(15px)',
    border: theme === 'dark' 
      ? '2px solid rgba(0, 255, 242, 0.3)' 
      : '2px solid rgba(108, 92, 231, 0.3)',
  };

  const resultsStyle = {
    marginTop: '30px',
    padding: '20px',
    borderRadius: '16px',
    background: theme === 'dark' ? 'rgba(10, 14, 39, 0.8)' : 'rgba(248, 249, 250, 0.8)',
    color: theme === 'dark' ? '#00fff2' : '#6c5ce7',
    border: theme === 'dark' 
      ? '2px solid rgba(0, 255, 242, 0.4)' 
      : '2px solid rgba(108, 92, 231, 0.4)',
    boxShadow: theme === 'dark' 
      ? '0 0 40px rgba(0, 255, 242, 0.3)' 
      : '0 0 40px rgba(108, 92, 231, 0.3)',
  };

  return (
    <div style={gameStyle}>
      {}
      {click && <audio ref={clickSound} src={click} preload="auto"></audio>}
{win && <audio ref={winSound} src={win} preload="auto"></audio>}
<audio ref={moveSound} src="/public/sounds/move.mp3" preload="auto"></audio>

      <div style={controlsStyle}>
        <label style={labelStyle}>
          Disks (N):
          <input 
            type="number" 
            min={3} 
            max={10} 
            value={n} 
            onChange={e => setN(Number(e.target.value))}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Pegs:
          <select 
            value={pegsCount} 
            onChange={e => setPegsCount(Number(e.target.value))}
            style={inputStyle}
          >
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </label>

        <button 
          onClick={() => { playSound(clickSound); resetPegs(); }}
          style={buttonStyle}
        >
          Reset
        </button>
      </div>

      <div style={boardStyle}>
        <Peg name="A" disks={pegsState.A} onClick={handlePegClick} selected={selectedPeg === 'A'} />
        <Peg name="B" disks={pegsState.B} onClick={handlePegClick} selected={selectedPeg === 'B'} />
        <Peg name="C" disks={pegsState.C} onClick={handlePegClick} selected={selectedPeg === 'C'} />
        {pegsCount === 4 && <Peg name="D" disks={pegsState.D} onClick={handlePegClick} selected={selectedPeg === 'D'} />}
      </div>

      <div style={resultsStyle}>
        <h3>Status</h3>
        <div>Time: {formatTime(elapsedTime)}</div>
        <div>Moves: {moveCount}</div>
        <div>
          {win ? '✅ You Won!' : selectedPeg ? `Selected Peg: ${selectedPeg}` : 'Click a peg to move'}
        </div>
      </div>
    </div>
  );
}