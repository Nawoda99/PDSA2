import React from "react";
import { useTheme } from "../../Providers/ThemeProvider";
import ChessBoard from "../../components/Board/ChessBoard";

const EightQueens = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div
          className="lg:col-span-1 h-[90vh] flex items-center justify-center rounded-2xl p-6"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.primary}20`,
          }}
        >
          <div className="flex flex-col items-stretch w-full max-w-xs space-y-6">
            <div
              className="p-4 space-y-2 rounded-lg"
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
                  Board Size:
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: theme.primary }}
                >
                  8 × 8
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.textSecondary }}
                >
                  Total Queens:
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: theme.primary }}
                >
                  8
                </span>
              </div>
            </div>

            <div
              className="p-4 space-y-2 rounded-lg"
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
                <li>• Place 8 queens on the board</li>
                <li>• No two queens can attack each other</li>
              </ul>
            </div>
          </div>
        </div>

        <div
          className="lg:col-span-3 flex items-center justify-center rounded-2xl p-6 min-h-[90vh]"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.primary}20`,
          }}
        >
          <ChessBoard bordsize={8} />
        </div>
      </div>
    </div>
  );
};

export default EightQueens;
