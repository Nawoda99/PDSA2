import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Providers/AuthProvider';
import { useNotification } from '../../Providers/NotificationProvider';


function Disk({ size }) {
  const gradients = [
    'linear-gradient(135deg,#ff0080,#ff8c00)',
    'linear-gradient(135deg,#00d9ff,#7000ff)',
    'linear-gradient(135deg,#00ff88,#00ccff)',
    'linear-gradient(135deg,#ffea00,#ff6b00)',
    'linear-gradient(135deg,#ff0080,#4b0082)',
    'linear-gradient(135deg,#00fff2,#ff00ea)',
    'linear-gradient(135deg,#ff1493,#ff69b4)',
    'linear-gradient(135deg,#00bfff,#1e90ff)',
    'linear-gradient(135deg,#ff69b4,#ffb6c1)',
    'linear-gradient(135deg,#00ffff,#0080ff)'
  ];
  const idx = Math.max(0, Math.min(9, size - 1));
  const widthPct = `${20 + (size - 1) * 8}%`;
  const minW = `${60 + (size - 1) * 20}px`;

  return (
    <div
      className="text-white font-extrabold text-center px-3 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-110 hover:-translate-y-1 select-none cursor-pointer"
      style={{
        width: widthPct,
        minWidth: minW,
        background: gradients[idx],
        border: '2px solid rgba(255,255,255,0.3)',
        textShadow: '0 0 10px rgba(0,0,0,0.8)',
        boxShadow: '0 0 25px rgba(255,255,255,0.4)'
      }}
    >
      Disk {size}
    </div>
  );
}

function Peg({ name, disks, onClick, selected }) {
  return (
    <div
      className={`flex-1 min-w-[140px] p-4 rounded-2xl bg-slate-900/50 border-2 transition-all duration-300 cursor-pointer ${
        selected
          ? 'border-cyan-400 shadow-[0_0_40px_rgba(0,255,242,0.5)] -translate-y-2'
          : 'border-cyan-400/25 shadow-[0_0_20px_rgba(112,0,255,0.3)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(0,255,242,0.5)]'
      }`}
      onClick={() => onClick(name)}
    >
      <div
        className="text-cyan-300 font-black text-xl uppercase tracking-[3px] mb-3"
        style={{ textShadow: '0 0 10px rgba(0,255,242,0.8)' }}
      >
        {name}
      </div>
      <div className="min-h-[180px] flex flex-col-reverse items-center gap-1.5 pt-3">
        {disks.map((d, i) => (
          <Disk key={i} size={d} />
        ))}
      </div>
    </div>
  );
}

export default function HanoiGame() {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [n, setN] = useState(5);
  const [pegsCount, setPegsCount] = useState(3);
  const [pegsState, setPegsState] = useState({ A: [], B: [], C: [], D: [] });
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [win, setWin] = useState(false);

  const clickSound = useRef(null);
  const moveSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    resetPegs(n, pegsCount);
  }, [n, pegsCount]);

  function resetPegs(nn = n, pc = pegsCount) {
    const A = [];
    for (let i = nn; i >= 1; i--) A.push(i);
    setPegsState({ A, B: [], C: [], D: [] });
    setSelectedPeg(null);
    setMoveCount(0);
    setWin(false);
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
      if (selectedPeg === name) {
        setSelectedPeg(null);
        return;
      }

      const from = selectedPeg;
      const to = name;
      const src = pegsState[from];
      const dst = pegsState[to];

      if (src.length === 0) return;

      const moving = src[src.length - 1];
      const top = dst[dst.length - 1];

      if (top && moving > top) {
        showNotification('Invalid move! Cannot place larger disk on smaller disk.', 'error');
        setSelectedPeg(null);
        return;
      }

      const newState = JSON.parse(JSON.stringify(pegsState));
      newState[to].push(newState[from].pop());
      setPegsState(newState);
      setMoveCount((m) => m + 1);
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
      showNotification('🎉 Congratulations! You solved the puzzle!', 'success');
      saveResultToDB();
    }
  }

  async function saveResultToDB() {
    try {
      const token = localStorage.getItem('token');
      const playerId = user?._id || user?.id;

      if (!playerId || !token) {
        showNotification('You must be logged in to save results.', 'warning');
        return;
      }

      const res = await fetch('/hanoi/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          playerID: playerId,
          disks: n,
          pegs: pegsCount,
          moves: moveCount
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save result');
      }

      const data = await res.json();
      showNotification(data.message || 'Result saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showNotification(err.message || '❌ Failed to save result.', 'error');
    }
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-gradient-to-b from-[#0a0e27] to-[#050810] text-white">
      {/* Audio elements - uncomment and use imported audio variables */}
      {/* <audio ref={clickSound} src={clickWav} preload="auto" />
      <audio ref={moveSound} src={moveMp3} preload="auto" />
      <audio ref={winSound} src={winWav} preload="auto" /> */}

      <div className="w-full max-w-5xl text-center mb-8">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-widest mb-3"
          style={{
            background: 'linear-gradient(135deg,#00fff2,#7000ff,#ff00ea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(0,255,242,0.6))'
          }}
        >
          Towers of Hanoi
        </h1>
        <p className="text-cyan-200/80 text-base sm:text-lg">
          Classic puzzle — move all disks to the target peg using the fewest moves.
        </p>
      </div>

      <div className="w-full max-w-5xl p-6 sm:p-8 rounded-3xl bg-slate-900/60 border-2 border-cyan-400/30 shadow-[0_0_60px_rgba(112,0,255,0.4)] backdrop-blur-sm mb-8">
        <div className="flex flex-wrap justify-center items-end gap-4 sm:gap-6 mb-6">
          <label className="flex flex-col items-center gap-2 text-cyan-300 font-bold uppercase text-sm tracking-wider">
            <span style={{ textShadow: '0 0 10px rgba(0,255,242,0.6)' }}>Disks (N)</span>
            <input
              type="number"
              min={3}
              max={10}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-24 text-center bg-slate-800/80 text-cyan-200 border-2 border-cyan-400/40 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_30px_rgba(0,255,242,0.6)] transition-all hover:border-cyan-400/60"
            />
          </label>

          <label className="flex flex-col items-center gap-2 text-cyan-300 font-bold uppercase text-sm tracking-wider">
            <span style={{ textShadow: '0 0 10px rgba(0,255,242,0.6)' }}>Pegs</span>
            <select
              value={pegsCount}
              onChange={(e) => setPegsCount(Number(e.target.value))}
              className="w-24 bg-slate-800/80 text-cyan-200 border-2 border-cyan-400/40 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_30px_rgba(0,255,242,0.6)] transition-all hover:border-cyan-400/60 cursor-pointer"
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </label>

          <button
            onClick={() => {
              playSound(clickSound);
              resetPegs();
            }}
            className="px-6 py-3 rounded-xl font-extrabold text-base uppercase tracking-wider text-white border-2 border-white/30 shadow-[0_0_30px_rgba(112,0,255,0.6)] transition-all hover:scale-110 hover:shadow-[0_0_50px_rgba(0,255,242,0.8)] active:scale-95"
            style={{
              background: 'linear-gradient(135deg,#00fff2,#7000ff)'
            }}
          >
            Reset
          </button>
        </div>

        <div className="board flex flex-col sm:flex-row justify-around gap-5 p-6 sm:p-8 rounded-2xl bg-slate-900/40 border-2 border-cyan-400/30 shadow-[0_0_60px_rgba(112,0,255,0.4)] backdrop-blur-md">
          <Peg name="A" disks={pegsState.A} onClick={handlePegClick} selected={selectedPeg === 'A'} />
          <Peg name="B" disks={pegsState.B} onClick={handlePegClick} selected={selectedPeg === 'B'} />
          <Peg name="C" disks={pegsState.C} onClick={handlePegClick} selected={selectedPeg === 'C'} />
          {pegsCount === 4 && (
            <Peg name="D" disks={pegsState.D} onClick={handlePegClick} selected={selectedPeg === 'D'} />
          )}
        </div>

        <div className="results mt-6 p-5 rounded-2xl bg-slate-800/80 border-2 border-cyan-400/40 text-cyan-200 shadow-[0_0_40px_rgba(0,255,242,0.3)]">
          <h3 className="font-black text-xl mb-3" style={{ color: '#00fff2' }}>
            Status
          </h3>
          <div className="text-base">
            Moves: <span className="font-extrabold text-white text-lg">{moveCount}</span>
          </div>
          <div className="text-base mt-2">
            {win ? (
              <span className="text-green-400 font-bold text-lg">✅ You Won!</span>
            ) : selectedPeg ? (
              <span>Selected Peg: <span className="font-bold text-white">{selectedPeg}</span></span>
            ) : (
              <span>Click a peg to move</span>
            )}
          </div>
        </div>
      </div>

      <footer className="text-cyan-300/60 text-sm tracking-widest opacity-60">
        Good luck — solve with elegance ✦
      </footer>
    </div>
  );
}