import React, { useState, useEffect } from "react";
import { useTheme } from "../../Providers/ThemeProvider";
import { useAuth } from "../../Providers/AuthProvider";
import TrafficNetworkGraph from "../../components/Graph/TrafficNetworkGraph";
import { useNotification } from "../../Providers/NotificationProvider";
import api from "../../services/api";

const TrafficSimulation = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [network, setNetwork] = useState(null);
  const [playerAnswer, setPlayerAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let interval;
    if (startTime && !showResult) {
      interval = setInterval(() => {
        setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, showResult]);

  const handleGenerateNetwork = async () => {
    try {
      const response = await api.post("/traffic/generate", {
        minCapacity: 5,
        maxCapacity: 15,
      });

      if (response.data.success) {
        setNetwork(response.data.data);
        setPlayerAnswer("");
        setGameResult(null);
        setShowResult(false);
        setStartTime(Date.now());
        setTimeTaken(0);
        showNotification("New traffic network generated!", "success");
      }
    } catch (error) {
      showNotification(error.message || "Failed to generate network", "error");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!playerAnswer || isNaN(playerAnswer) || parseInt(playerAnswer) < 0) {
      showNotification("Please enter a valid positive number", "error");
      return;
    }

    if (!network) {
      showNotification("Please generate a network first", "error");
      return;
    }

    setIsSubmitting(true);
    console.log(user);

    try {
      const response = await api.post("/traffic/submit", {
        playerId: user.id,
        playerName: user.username,
        network: network,
        playerAnswer: parseInt(playerAnswer),
        timeTaken: timeTaken,
      });

      if (response.data.success) {
        setGameResult(response.data.data);
        setShowResult(true);

        if (response.data.data.isCorrect) {
          showNotification("Correct! Well done!", "success");
        } else {
          showNotification("Incorrect. Try again!", "warning");
        }
      }
    } catch (error) {
      showNotification(error.message || "Failed to submit answer", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setNetwork(null);
    setPlayerAnswer("");
    setGameResult(null);
    setShowResult(false);
    setStartTime(null);
    setTimeTaken(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div
          className="lg:col-span-1 h-[90vh] flex flex-col rounded-2xl p-6 overflow-y-auto"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.primary}20`,
          }}
        >
          <h2
            className="mb-6 text-2xl font-bold"
            style={{ color: theme.textPrimary }}
          >
            Traffic Simulation
          </h2>

          {network && !showResult && (
            <div
              className="p-4 mb-4 rounded-lg"
              style={{
                background: `${theme.primary}10`,
                border: `1px solid ${theme.primary}30`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.textSecondary }}
                >
                  Time:
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: theme.primary }}
                >
                  {formatTime(timeTaken)}
                </span>
              </div>
            </div>
          )}

          {!network && (
            <button
              onClick={handleGenerateNetwork}
              className="w-full px-6 py-3 mb-4 font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2"
              style={{
                background: theme.button.primaryBgGradient,
                color: theme.button.primaryText,
                boxShadow: `0 4px 15px ${theme.primary}40`,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = `0 6px 20px ${theme.primary}50`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 4px 15px ${theme.primary}40`;
              }}
            >
              Generate Network
            </button>
          )}

          {network && !showResult && (
            <div className="mb-4 space-y-4">
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium"
                  style={{ color: theme.textSecondary }}
                >
                  Maximum Flow (vehicles/min)
                </label>
                <input
                  type="number"
                  value={playerAnswer}
                  onChange={(e) => setPlayerAnswer(e.target.value)}
                  min="0"
                  placeholder="Enter your answer"
                  className="w-full px-4 py-3 text-lg font-semibold text-center transition-all duration-200 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    background: theme.input.background,
                    color: theme.input.text,
                    border: `2px solid ${theme.input.border}`,
                  }}
                />
              </div>

              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !playerAnswer}
                className="w-full px-6 py-3 font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: theme.button.primaryBgGradient,
                  color: theme.button.primaryText,
                  boxShadow: `0 4px 15px ${theme.primary}40`,
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          )}

          {showResult && gameResult && (
            <div className="mb-4 space-y-4">
              <div
                className="p-4 rounded-lg"
                style={{
                  background: gameResult.isCorrect
                    ? `${theme.primary}10`
                    : `#e1705510`,
                  border: `2px solid ${gameResult.isCorrect ? theme.primary : "#e17055"}`,
                }}
              >
                <h3
                  className="mb-3 text-lg font-bold"
                  style={{
                    color: gameResult.isCorrect ? theme.primary : "#e17055",
                  }}
                >
                  {gameResult.isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>
                      Your Answer:
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: theme.textPrimary }}
                    >
                      {gameResult.playerAnswer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>
                      Correct Answer:
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: theme.primary }}
                    >
                      {gameResult.correctAnswer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>
                      Time Taken:
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: theme.textPrimary }}
                    >
                      {formatTime(timeTaken)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{
                  background: `${theme.secondary}10`,
                  border: `1px solid ${theme.secondary}30`,
                }}
              >
                <h3
                  className="mb-3 text-sm font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  Algorithm Performance
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>
                      Ford-Fulkerson:
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: theme.textPrimary }}
                    >
                      {gameResult.fordFulkersonTime?.toFixed(4)} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>
                      Edmonds-Karp:
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: theme.textPrimary }}
                    >
                      {gameResult.edmondsKarpTime?.toFixed(4)} ms
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full px-6 py-3 font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  background: theme.button.secondaryBgGradient,
                  color: theme.button.secondaryText,
                  boxShadow: `0 4px 15px ${theme.secondary}40`,
                }}
              >
                Play Again
              </button>
            </div>
          )}

          <div
            className="p-4 mt-auto space-y-2 rounded-lg"
            style={{
              background: `${theme.secondary}10`,
              border: `1px solid ${theme.secondary}30`,
            }}
          >
            <h3
              className="mb-2 text-sm font-bold"
              style={{ color: theme.textPrimary }}
            >
              Instructions:
            </h3>
            <ul
              className="space-y-1 text-xs"
              style={{ color: theme.textSecondary }}
            >
              <li>• Click "Generate Network" to start</li>
              <li>• Calculate the maximum flow from A to T</li>
              <li>• Enter your answer in vehicles/minute</li>
              <li>• Submit to check if you're correct</li>
              <li>• Correct answers are saved to leaderboard</li>
            </ul>
          </div>
        </div>

        <div
          className="lg:col-span-3 flex items-center justify-center rounded-2xl p-6 min-h-[90vh]"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.primary}20`,
          }}
        >
          {network ? (
            <TrafficNetworkGraph network={network} />
          ) : (
            <div className="text-center">
              <p className="text-lg" style={{ color: theme.textSecondary }}>
                Click "Generate Network" to start the game
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficSimulation;
