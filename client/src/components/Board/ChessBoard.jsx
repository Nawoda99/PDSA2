import { Lightbulb, RotateCcw, Zap } from "lucide-react";
import axios from "axios";
import React, { useLayoutEffect, useState } from "react";
import { useTheme } from "../../Providers/ThemeProvider";
import { useNotification } from "../../Providers/NotificationProvider";
import InValQueen from "../../assets/crowinvalid.png";
import Queen from "../../assets/crown.png";
import { numberToLetter } from "../../utils/helper-Function";

// Configure axios base URL
const api = axios.create({
  baseURL: "/api",
});

const ChessBoard = ({ bordsize }) => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const [board, setBoard] = useState([[]]);
  const [isHint, setIsHint] = useState(false);
  const [hints, setHints] = useState([]);
  const [maxQueens, setMaxQueens] = useState(0);
  const [hoveredCell, setHoveredCell] = useState(null);

  const createNewBoard = async () => {
    try {
      const res = await api.post("/eightQueens/createboard", {
        size: bordsize,
      });
      setBoard(res.data);
      setMaxQueens(0);
      setHints([]);
      setIsHint(false);
    } catch (err) {
      console.error("Error creating board:", err);
      showNotification("Failed to create board. Please try again.", "error");
    }
  };

  const onUserInput = async (row, col) => {
    if (maxQueens === bordsize && board[row][col] === 0) {
      showNotification("You have already placed all the queens!", "warning");
      return;
    }

    hints.forEach((hint) => {
      if (hint.cord.row === row && hint.cord.col === col) {
        hints.splice(hints.indexOf(hint), 1);
      }
    });

    try {
      const res = await api.post("/eightQueens/placequeen", {
        hints,
        board,
        row,
        col,
      });
      setHints(res.data.hints);
      setBoard(res.data.board);
      setMaxQueens(res.data.board.flat().filter((queen) => queen === 1).length);
    } catch (err) {
      console.error("Error placing queen:", err);
      showNotification("Failed to place queen. Please try again.", "error");
    }
  };

  const onanswerSubmit = async () => {
    if (maxQueens !== bordsize) {
      showNotification(
        `Please place all ${bordsize} queens before submitting!`,
        "warning"
      );
      return;
    }

    try {
      const checkRes = await api.post("/eightQueens/checksolution", {
        board,
      });

      if (checkRes.data) {
        // Correct answer
        showNotification(
          "🎉 Congratulations! You solved the puzzle correctly!",
          "success",
          3000,
          async () => {
            try {
              // Save solution
              const saveRes = await api.post("/eightQueens/saveSolution", {
                board: board,
                player: localStorage.getItem("username"),
              });

              if (saveRes.data.status === "error") {
                showNotification(saveRes.data.message, "warning");
              } else {
                showNotification("Solution saved successfully!", "success");
              }

              // Create new board
              await createNewBoard();
            } catch (err) {
              console.error("Error saving solution:", err);
            }
          }
        );
      } else {
        // Incorrect answer
        showNotification(
          "❌ Incorrect solution. Try again!",
          "error",
          3000,
          async () => {
            await createNewBoard();
          }
        );
      }
    } catch (err) {
      console.error("Error checking solution:", err);
      showNotification(
        "Something went wrong. Creating a new board...",
        "error",
        3000,
        async () => {
          await createNewBoard();
        }
      );
    }
  };

  const handleRestart = () => {
    showNotification("Restarting game...", "info", 1500);
    createNewBoard();
  };

  useLayoutEffect(() => {
    createNewBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bordsize]);

  const getHintMessages = (rowIndex, colIndex) => {
    if (!isHint) return "";
    return hints
      .filter(
        (hint) => hint.cause.row === rowIndex && hint.cause.col === colIndex
      )
      .map((hint) => hint.message)
      .join(" and ");
  };

  const isInvalidQueen = (rowIndex, colIndex) => {
    return (
      hints.some(
        (hint) => hint.cord.row === rowIndex && hint.cord.col === colIndex
      ) && isHint
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* Control Buttons */}
      <div className="flex items-center justify-end w-full gap-3 mb-4">
        <button
          onClick={() => {
            setIsHint(!isHint);
            showNotification(
              isHint ? "Hints hidden" : "Hints enabled",
              "info",
              1500
            );
          }}
          className="p-3 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2"
          style={{
            background: isHint
              ? `linear-gradient(135deg, ${theme.accent}30, ${theme.secondary}20)`
              : `${theme.primary}20`,
            color: isHint ? theme.accent : theme.primary,
            border: `1px solid ${isHint ? theme.accent : theme.primary}40`,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = `0 4px 15px ${
              isHint ? theme.accent : theme.primary
            }40`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
          title={isHint ? "Hide Hints" : "Show Hints"}
        >
          {isHint ? (
            <Zap className="w-5 h-5" />
          ) : (
            <Lightbulb className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={handleRestart}
          className="p-3 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2"
          style={{
            background: `${theme.primary}20`,
            color: theme.primary,
            border: `1px solid ${theme.primary}40`,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = `0 4px 15px ${theme.primary}40`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
          title="Restart Game"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Chess Board */}
      <div
        className="inline-grid overflow-hidden shadow-2xl rounded-xl"
        style={{
          gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))`,
          gap: "1px",
          background: theme.input.border,
          border: `2px solid ${theme.primary}30`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((col, colIndex) => {
            const hintMessage = getHintMessages(rowIndex, colIndex);
            const isInvalid = isInvalidQueen(rowIndex, colIndex);
            const isHovered =
              hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                id={numberToLetter(rowIndex) + colIndex}
                className="w-[60px] h-[60px] flex items-center justify-center cursor-pointer transition-all duration-200 relative group"
                style={{
                  backgroundColor:
                    (rowIndex + colIndex) % 2 === 0 ? "#f3f4f6" : "#5d5d5d",
                }}
                onClick={() => onUserInput(rowIndex, colIndex)}
                onMouseEnter={() =>
                  setHoveredCell({ row: rowIndex, col: colIndex })
                }
                onMouseLeave={() => setHoveredCell(null)}
                title={hintMessage}
              >
                {/* Hover Effect */}
                <div
                  className={`absolute inset-0 transition-opacity duration-200 ${
                    isHovered ? "opacity-20" : "opacity-0"
                  }`}
                  style={{
                    background: theme.primary,
                  }}
                />

                {/* Queen Image */}
                {board[rowIndex][colIndex] === 1 && (
                  <img
                    src={isInvalid ? InValQueen : Queen}
                    alt="Queen"
                    className="z-10 max-w-full max-h-full transition-transform duration-200 group-hover:scale-110"
                  />
                )}

                {/* Hint Indicator */}
                {isHint && hintMessage && (
                  <div
                    className="absolute w-2 h-2 rounded-full top-1 right-1 animate-pulse"
                    style={{
                      background: isInvalid ? "#e17055" : theme.accent,
                      boxShadow: `0 0 8px ${
                        isInvalid ? "#e17055" : theme.accent
                      }`,
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Queen Counter */}
      <div
        className="px-6 py-3 mt-4 rounded-lg"
        style={{
          background: `${theme.primary}10`,
          border: `1px solid ${theme.primary}30`,
        }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: theme.textSecondary }}
        >
          Queens Placed:{" "}
          <span
            className="ml-2 text-lg font-bold"
            style={{ color: theme.primary }}
          >
            {maxQueens} / {bordsize}
          </span>
        </span>
      </div>

      {/* Submit Button */}
      <button
        onClick={onanswerSubmit}
        disabled={maxQueens !== bordsize}
        className="px-8 py-3 mt-4 font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background:
            maxQueens !== bordsize
              ? theme.input.border
              : theme.button.primaryBgGradient,
          color: theme.button.primaryText,
          boxShadow:
            maxQueens !== bordsize ? "none" : `0 4px 15px ${theme.primary}40`,
        }}
        onMouseEnter={(e) => {
          if (maxQueens === bordsize) {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = `0 6px 20px ${theme.primary}50`;
          }
        }}
        onMouseLeave={(e) => {
          if (maxQueens === bordsize) {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = `0 4px 15px ${theme.primary}40`;
          }
        }}
      >
        Submit Solution
      </button>
    </div>
  );
};

export default ChessBoard;
