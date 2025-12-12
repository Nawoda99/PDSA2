import React, { useState, useEffect, useRef } from "react";
import "./SnakeGame.css";
import { BoardGrid } from "./components/BoardGrid";
import { BoardGraphics } from "./components/BoardGraphics";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Providers/AuthProvider";

class SoundManager {
  constructor() {
    this.sounds = {
      error: new Audio("/sounds/error.mp3"),
      start: new Audio("/sounds/start.mp3"),
      tick: new Audio("/sounds/tick.mp3"),
      correct: new Audio("/sounds/correct.mp3"),
      wrong: new Audio("/sounds/wrong.mp3"),
    };
    // Volume settings
    this.sounds.tick.volume = 0.3;
    this.sounds.start.volume = 0.6;
    this.isMuted = false;
  }

  play(soundName) {
    if (this.isMuted) return;
    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound
        .play()
        .catch((e) =>
          console.log("Audio play failed (interaction needed):", e)
        );
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

const SnakeAndLadder = () => {
  const [screen, setScreen] = useState("menu");
  const [nameError, setNameError] = useState("");
  const [isShake, setIsShake] = useState(false);

  const [boardSize, setBoardSize] = useState(10);
  const [gameRoundId, setGameRoundId] = useState(null);
  const [gameStatus, setGameStatus] = useState("Game Ready!");
  const [choices, setChoices] = useState([]);
  const [resultMessage, setResultMessage] = useState({ text: "", type: "" });

  const [timer, setTimer] = useState("00:00");
  const [isLoading, setIsLoading] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const gridRef = useRef(null);
  const svgRef = useRef(null);
  const boardGridInstance = useRef(null);
  const boardGraphicsInstance = useRef(null);
  const soundManager = useRef(new SoundManager());
  const timerInterval = useRef(null);
  const startTime = useRef(null);

  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [playerName, setPlayerName] = useState(() => {
    return authUser?.username || localStorage.getItem("username") || "";
  });

  useEffect(() => {
    const name = authUser?.username || localStorage.getItem("username") || "";
    if (name) {
      setPlayerName(name);
    }
  }, [authUser]);

  const handleExitGame = () => {
    stopTimer();
    navigate("/");
  };

  // Theme Change Effect
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.remove("theme-dark");
    }
    // Cleanup function
    return () => document.body.classList.remove("theme-dark");
  }, [isDarkMode]);

  useEffect(() => {
    if (screen === "game" && gridRef.current && svgRef.current) {
      boardGridInstance.current = new BoardGrid(gridRef.current);
      boardGraphicsInstance.current = new BoardGraphics(svgRef.current);

      // Auto start game logic
      handleNewGame();
    }
  }, [screen]);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  // HELPER FUNCTIONS

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.log(err));
    }
  };

  const startTimer = () => {
    stopTimer();
    startTime.current = Date.now();
    timerInterval.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime.current;
      updateTimerDisplay(elapsedTime);
      soundManager.current.play("tick");
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
  };

  const updateTimerDisplay = (elapsedTime) => {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formatted =
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds < 10 ? "0" + seconds : seconds);
    setTimer(formatted);
  };

  // EVENT HANDLERS (Buttons Clicks)

  const handlePlayClick = () => {
    if (!playerName.trim()) {
      soundManager.current.play("error");
      setNameError("Please enter your name!");
      setIsShake(true);
      setTimeout(() => setIsShake(false), 400); // Remove animation class
      return;
    }

    setNameError("");
    enterFullScreen();
    setScreen("game"); // Switch to Game Screen
  };

  const handleHomeClick = () => {
    stopTimer();
    setScreen("menu");
    setResultMessage({ text: "", type: "" });
  };

  const handleNewGame = async () => {
    setIsLoading(true);
    setResultMessage({ text: "", type: "" });
    setChoices([]);
    setTimer("00:00");
    stopTimer();

    soundManager.current.play("start");

    try {
      // Node.js Backend API URL (Port 3001)
      const response = await fetch(
        `http://localhost:3001/api/snake-game/start?n=${boardSize}`
      );

      if (!response.ok) throw new Error("Server Error");
      const data = await response.json();

      setGameRoundId(data.gameRoundId);
      setGameStatus(
        `Game #${data.gameRoundId} (Size ${boardSize}x${boardSize})`
      );

      // Draw the Board
      if (boardGridInstance.current && boardGraphicsInstance.current) {
        // 1. Draw Grid
        boardGridInstance.current.drawGrid(parseInt(boardSize));
        // 2. Clear SVG
        boardGraphicsInstance.current.clear();

        // 3. Draw Snakes & Ladders (Delayed slightly to ensure DOM is ready)
        setTimeout(() => {
          const board = data.board;

          for (const fromCellStr in board) {
            const fromCell = parseInt(fromCellStr);
            const toCell = board[fromCell];

            if (fromCell !== toCell) {
              const coords1 =
                boardGridInstance.current.getCellCenterCoordinates(fromCell);
              const coords2 =
                boardGridInstance.current.getCellCenterCoordinates(toCell);

              if (coords1 && coords2) {
                if (toCell > fromCell) {
                  boardGraphicsInstance.current.drawLadder(
                    coords1.x,
                    coords1.y,
                    coords2.x,
                    coords2.y
                  );
                } else {
                  boardGraphicsInstance.current.drawSnake(
                    coords1.x,
                    coords1.y,
                    coords2.x,
                    coords2.y
                  );
                }
              }
            }
          }
          // Start Timer after board is drawn
          startTimer();
        }, 100);
      }

      // Show choices after drawing
      setChoices(data.choices);
    } catch (error) {
      console.error("Start Game Error:", error);
      alert("Failed to start game. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const submitGuess = async (guess) => {
    stopTimer();

    try {
      const response = await fetch(
        "http://localhost:3001/api/snake-game/guess",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameRoundId: gameRoundId,
            userName: playerName,
            guessAnswer: guess,
          }),
        }
      );

      if (!response.ok) throw new Error("Server Error");
      const result = await response.json();

      // Hide buttons
      setChoices([]);

      if (result.isCorrect) {
        soundManager.current.play("correct");
        setResultMessage({
          text: `Correct! Well done! You solved it in ${timer}.`,
          type: "correct",
        });
      } else {
        soundManager.current.play("wrong");
        // Use correctAnswer from backend if available
        const msg = result.correctAnswer
          ? `Oops! The minimum rolls needed was ${result.correctAnswer}. Try again!`
          : "Oops! Not the shortest path. Try again!";
        setResultMessage({ text: msg, type: "wrong" });
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting guess");
    }
  };

  // JSX RENDER (HTML Structure)
  return (
    <div className="snake-game-wrapper">
      {/* SVG Filters (Hidden) */}
      <svg width="0" height="0" style={{ position: "absolute", zIndex: -1 }}>
        <defs>
          <filter id="drop-shadow-filter">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="2" dy="3" result="offsetblur" />
            <feMerge>
              <feMergeNode in="offsetblur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/*  MENU SCREEN  */}
      {screen === "menu" && (
        <div className="screen menu-screen">
          <button
            className="icon-button top-left"
            onClick={handleExitGame}
            title="Exit to Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className="icon-button theme-toggle-button top-right"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? (
              <svg
                className="icon-sun"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.899 6.101a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.839 17.839a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.161 17.839a.75.75 0 00-1.06-1.06l-1.59 1.591a.75.75 0 101.06 1.06l1.59-1.591zM6.101 5.041a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 101.06-1.06l-1.59-1.591zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12z" />
              </svg>
            ) : (
              <svg
                className="icon-moon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.833 2.067-7.17 5.163-9.049a.75.75 0 01.819.162z"
                  clip-rule="evenodd"
                />
              </svg>
            )}
          </button>

          <div className="relative z-10 w-full max-w-md p-8 bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl text-center">
            {/* Title with Blue-White Gradient */}
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-white mb-8 drop-shadow-lg tracking-wide font-[Fredoka One]">
              Snakes & Ladders
            </h1>

            <div className="animate-fade-in">
              <div className="mb-8">
                {/* Welcome Message */}
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  Welcome,{" "}
                  <span className="text-blue-400 drop-shadow-md">
                    {playerName || "Gamer"}
                  </span>
                  !
                </h2>
                <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
                  Let's roll the dice & win! 🎲
                </p>
              </div>

              {/* Board Size Selection - Black & Blue Theme */}
              <div className="mb-8 text-left">
                <label className="block text-blue-300 text-xs font-bold mb-2 ml-1 uppercase tracking-wider">
                  Select Board Size
                </label>
                <div className="relative group">
                  <select
                    value={boardSize}
                    onChange={(e) => setBoardSize(e.target.value)}
                    className="w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer hover:bg-black/60 hover:border-blue-500/30"
                  >
                    <option value="6" className="bg-gray-900 text-gray-300">
                      6 x 6 (Quick Game)
                    </option>
                    <option value="7" className="bg-gray-900 text-gray-300">
                      7 x 7 (Size 49)
                    </option>
                    <option value="8" className="bg-gray-900 text-gray-300">
                      8 x 8 (Standard)
                    </option>
                    <option value="9" className="bg-gray-900 text-gray-300">
                      9 x 9 (Size 81)
                    </option>
                    <option value="10" className="bg-gray-900 text-gray-300">
                      10 x 10 (Classic)
                    </option>
                    <option value="11" className="bg-gray-900 text-gray-300">
                      11 x 11 (Size 121)
                    </option>
                    <option value="12" className="bg-gray-900 text-gray-300">
                      12 x 12 (Long Game)
                    </option>
                  </select>
                </div>
              </div>

              {/* Start Button - Professional Blue Gradient */}
              <button
                onClick={handlePlayClick}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-lg tracking-wider rounded-xl shadow-lg shadow-blue-900/30 transform transition-all duration-200 hover:-translate-y-1 active:scale-95 focus:ring-4 focus:ring-blue-500/40 border border-blue-500/20"
              >
                START GAME
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  GAME SCREEN */}
      {screen === "game" && (
        <div className="screen game-container " style={{ display: "flex" }}>
          <div className="game-header glass-panel">
            <button className="icon-button" onClick={handleHomeClick}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.69-8.69a2.25 2.25 0 00-3.18 0l-8.69 8.69a.75.75 0 101.06 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875h-3.125a.75.75 0 01-.75-.75V19.5h-3a.75.75 0 01-.75-.75v-2.625a.75.75 0 01.75-.75h3V13.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v3.375c0 .621-.504 1.125-1.125 1.125h-1.5v2.625a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75V19.5h-3a.75.75 0 01-.75-.75v-6.198c.031-.028.061-.056.091-.086L12 5.432z" />
              </svg>
            </button>

            <h2 className="game-header-title">Snakes & Ladders</h2>

            <div className="header-icon-group">
              {/* Timer */}
              <div className="game-timer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="timer-icon"
                >
                  <path d="M20 12c0-2.54-1.19-4.81-3.04-6.27L16 0H8l-.96 5.73C5.19 7.19 4 9.45 4 12s1.19 4.81 3.04 6.27L8 24h8l.96-5.73C18.81 16.81 20 14.54 20 12zM6 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6zm8 3h-4v-4h2v2h2v2z" />
                </svg>
                <span>{timer}</span>
              </div>

              {/* Theme Button */}
              <button
                className="icon-button theme-toggle-button"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? (
                  <svg
                    className="icon-sun"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.899 6.101a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.839 17.839a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.161 17.839a.75.75 0 00-1.06-1.06l-1.59 1.591a.75.75 0 101.06 1.06l1.59-1.591zM6.101 5.041a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 101.06-1.06l-1.59-1.591zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12z" />
                  </svg>
                ) : (
                  <svg
                    className="icon-moon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.833 2.067-7.17 5.163-9.049a.75.75 0 01.819.162z"
                      clip-rule="evenodd"
                    />
                  </svg>
                )}
              </button>

              {/* Sound Button */}
              <button
                className="icon-button"
                onClick={() => setIsMuted(soundManager.current.toggleMute())}
              >
                {isMuted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="game-body">
            <div className="controls-panel glass-panel ">
              <div className="player-info">
                <span className="player-avatar">
                  <img
                    src="/profile.png"
                    alt="Profile"
                    className="avatar-icon"
                  />
                </span>
                <h3 className="player-name">{playerName}</h3>
              </div>

              <div className="setup-group">
                <h3>Game Setup</h3>
                <label>Board Size (N x N):</label>
                <select
                  value={boardSize}
                  onChange={(e) => setBoardSize(e.target.value)}
                >
                  <option value="6">6 x 6 (Size 36)</option>
                  <option value="7">7 x 7 (Size 49)</option>
                  <option value="8">8 x 8 (Size 64)</option>
                  <option value="9">9 x 9 (Size 81)</option>
                  <option value="10">10 x 10 (Size 100)</option>
                  <option value="11">11 x 11 (Size 121)</option>
                  <option value="12">12 x 12 (Size 144)</option>
                </select>
                <button
                  className="btn btn-secondary"
                  onClick={handleNewGame}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Start New Game"}
                </button>
              </div>

              <hr />

              {/* Choices Area - Show only if choices exist */}
              {choices.length > 0 && (
                <div className="quiz-group">
                  <h2 id="gameStatus">{gameStatus}</h2>
                  <p>
                    What is the <strong className="text-blue-400 text-lg">minimum</strong> number of dice rolls to
                    win?
                  </p>
                  <div className="choices-container">
                    {choices.map((choice, index) => (
                      <button
                        key={index}
                        className="choice-button"
                        onClick={() => submitGuess(choice)}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Result Message */}
              {resultMessage.text && (
                <p id="resultMessage" className={resultMessage.type}>
                  {resultMessage.text}
                </p>
              )}
            </div>

            <div className="board-panel">
              <div id="board-container">
                {/* React Refs used here instead of IDs */}
                <div ref={gridRef} id="board-grid"></div>
                <svg
                  ref={svgRef}
                  id="board-graphics"
                  width="100%"
                  height="100%"
                ></svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeAndLadder;
