import React, { useState, useEffect } from "react";
import { useTheme } from "../../Providers/ThemeProvider";
import { useAuth } from "../../Providers/AuthProvider";
import { useNotification } from "../../Providers/NotificationProvider";
import api from "../../services/api";
import CitySelector from "../../components/CitySelector";
import CityMap from "../../components/CityMap";

const CITY_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function TravelingSalesman() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [matrix, setMatrix] = useState(null);
  const [home, setHome] = useState(null);
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState(null);
  const [warning, setWarning] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    startNewRound();
  }, []);

  async function startNewRound() {
    try {
      const response = await api.post("/tsp/generate", {
        size: 10,
        minDist: 50,
        maxDist: 100,
      });

      if (response.data.success) {
        setMatrix(response.data.data.matrix);
        setHome(response.data.data.homeCity);
        setSelected([]);
        setResults(null);
        setWarning("");
        setSaveStatus("");
        showNotification("New game started!", "success");
      }
    } catch (error) {
      showNotification(error.message || "Failed to generate matrix", "error");
    }
  }

  function validateRun() {
    if (selected.length === 0) {
      setWarning("Select at least one city to visit.");
      return false;
    }
    setWarning("");
    return true;
  }

  async function runAlgorithms() {
    if (!matrix) return;
    if (!validateRun()) return;

    setIsRunning(true);

    try {
      const response = await api.post("/tsp/compute", {
        matrix,
        home,
        selected,
      });
      console.log(response);

      if (response.data.success) {
        setResults(response.data.data);
        await saveToDatabase(response.data.data);
      }
    } catch (error) {
      showNotification(error.message || "Failed to compute routes", "error");
    } finally {
      setIsRunning(false);
    }
  }

  async function saveToDatabase(resultsData) {
    try {
      console.log(resultsData);

      setSaveStatus("Saving...");
      const response = await api.post("/tsp/sessions", {
        playerName: user.username || user.name,
        homeCity: home,
        selectedCities: selected,
        distanceMatrix: matrix,
        results: resultsData,
      });

      if (response.data.success) {
        setSaveStatus("Saved!");
        setTimeout(() => setSaveStatus(""), 3000);
        showNotification("Results saved successfully!", "success");
      } else {
        setSaveStatus("Save failed");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      setSaveStatus("Connection error");
      setTimeout(() => setSaveStatus(""), 3000);
      showNotification(error.message || "Failed to save results", "error");
    }
  }

  return (
    <div
      className="h-screen p-2 overflow-hidden sm:p-3"
      style={{ background: theme.background }}
    >
      <div className="h-full flex flex-col max-w-[1600px] mx-auto">
        <header className="mb-2 text-center">
          <h1
            className="mb-1 text-2xl font-bold sm:text-3xl"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Traveling Salesman Problem
          </h1>
          <div className="flex flex-wrap justify-center gap-1.5">
            <span
              className="px-2 py-0.5 text-[10px] rounded-full"
              style={{
                background: `${theme.primary}20`,
                color: theme.primary,
                border: `1px solid ${theme.primary}30`,
              }}
            >
              Prim's MST
            </span>
            <span
              className="px-2 py-0.5 text-[10px] rounded-full"
              style={{
                background: `${theme.secondary}20`,
                color: theme.secondary,
                border: `1px solid ${theme.secondary}30`,
              }}
            >
              Dijkstra's SPT
            </span>
            <span
              className="px-2 py-0.5 text-[10px] rounded-full"
              style={{
                background: `${theme.accent}20`,
                color: theme.accent,
                border: `1px solid ${theme.accent}30`,
              }}
            >
              Greedy TSP
            </span>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-2 overflow-hidden lg:grid-cols-12">
          <div className="overflow-y-auto lg:col-span-3">
            <div
              className="h-full p-3 rounded-xl"
              style={{
                background: theme.surface,
                border: `1px solid ${theme.primary}20`,
              }}
            >
              <h3
                className="flex items-center gap-1 mb-2 text-sm font-bold"
                style={{ color: theme.textPrimary }}
              >
                Control
              </h3>

              <div className="mb-2">
                <div
                  className="mb-1 text-xs"
                  style={{ color: theme.textSecondary }}
                >
                  Home Base
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center px-3 py-1 rounded-lg font-bold text-sm min-w-[50px]"
                    style={{
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
                      color: "#fff",
                    }}
                  >
                    {home === null ? "—" : CITY_NAMES[home]}
                  </span>
                  <button
                    className="flex-1 px-3 py-1 text-xs font-semibold transition-all rounded-lg hover:scale-105"
                    onClick={startNewRound}
                    style={{
                      background: theme.button.primaryBgGradient,
                      color: theme.button.primaryText,
                    }}
                  >
                    New
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <div
                  className="mb-1 text-xs font-medium"
                  style={{ color: theme.textSecondary }}
                >
                  Target Cities
                </div>
                <CitySelector
                  cityNames={CITY_NAMES}
                  selected={selected}
                  setSelected={setSelected}
                  home={home}
                  theme={theme}
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={runAlgorithms}
                  disabled={isRunning}
                  className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-bold transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  style={{
                    background: theme.button.successBgGradient,
                    color: theme.button.successText,
                  }}
                >
                  {isRunning ? (
                    <>
                      <div
                        className="w-4 h-4 border-2 border-t-2 rounded-full animate-spin"
                        style={{
                          borderColor: `${theme.button.successText}20`,
                          borderTopColor: theme.button.successText,
                        }}
                      ></div>
                      Computing...
                    </>
                  ) : (
                    <>⚡ Run Algorithms</>
                  )}
                </button>

                {saveStatus && (
                  <div
                    className="text-xs font-semibold text-center"
                    style={{ color: theme.button.successBg }}
                  >
                    {saveStatus}
                  </div>
                )}
              </div>

              {warning && (
                <div
                  className="p-2 mt-2 text-xs rounded-lg"
                  style={{
                    background: `${theme.button.dangerBg}20`,
                    border: `1px solid ${theme.button.dangerBg}50`,
                    color: theme.button.dangerBg,
                  }}
                >
                  {warning}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 overflow-hidden lg:col-span-5">
            <div
              className="flex-1 p-3 overflow-hidden rounded-xl"
              style={{
                background: theme.surface,
                border: `1px solid ${theme.primary}20`,
              }}
            >
              <h2
                className="flex items-center gap-1 mb-2 text-sm font-bold"
                style={{ color: theme.textPrimary }}
              >
                🗺️ Visualizer
              </h2>
              {matrix && home !== null ? (
                <div
                  className="h-[calc(100%-28px)] p-2 rounded-lg overflow-hidden"
                  style={{
                    background: `${theme.background}aa`,
                    border: `1px solid ${theme.primary}20`,
                  }}
                >
                  <CityMap
                    cityNames={CITY_NAMES}
                    matrix={matrix}
                    home={home}
                    selected={selected}
                    results={results}
                    theme={theme}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center justify-center h-full"
                  style={{ color: theme.textSecondary }}
                >
                  <div className="text-center">
                    <div className="mb-2 text-3xl">🎯</div>
                    <div className="text-xs">Starting...</div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="p-3 rounded-xl"
              style={{
                background: theme.surface,
                border: `1px solid ${theme.primary}20`,
                maxHeight: "45%",
              }}
            >
              <h3
                className="flex items-center gap-1 mb-2 text-sm font-bold"
                style={{ color: theme.textPrimary }}
              >
                Matrix
              </h3>
              <div
                className="overflow-auto rounded-lg"
                style={{
                  background: `${theme.background}aa`,
                  border: `1px solid ${theme.primary}20`,
                  maxHeight: "calc(100% - 28px)",
                }}
              >
                {matrix ? (
                  <table className="w-full text-[10px]">
                    <thead
                      className="sticky top-0"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      }}
                    >
                      <tr>
                        <th className="p-1"></th>
                        {CITY_NAMES.map((c) => (
                          <th key={c} className="p-1 font-bold text-white">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.map((row, i) => (
                        <tr key={i}>
                          <td
                            className="p-1 font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                            }}
                          >
                            {CITY_NAMES[i]}
                          </td>
                          {row.map((val, j) => {
                            const isHome = i === home || j === home;
                            const isSelected =
                              selected.includes(i) || selected.includes(j);
                            const cellBg = isHome
                              ? `${theme.accent}30`
                              : isSelected
                                ? `${theme.primary}30`
                                : `${theme.surface}aa`;
                            return (
                              <td
                                key={j}
                                className="p-1 text-center transition-all hover:scale-110"
                                style={{
                                  background: cellBg,
                                  color: theme.textPrimary,
                                }}
                              >
                                {i === j ? "—" : val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div
                    className="p-2 text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    Loading...
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-y-auto lg:col-span-4">
            <div
              className="p-3 rounded-xl"
              style={{
                background: theme.surface,
                border: `1px solid ${theme.primary}20`,
              }}
            >
              <h3
                className="flex items-center gap-1 mb-2 text-sm font-bold"
                style={{ color: theme.textPrimary }}
              >
                🏆 Results
              </h3>
              {results ? (
                <div className="space-y-2">
                  {Object.entries(results).map(([k, v], idx) => {
                    const colors = [
                      { from: theme.primary, to: theme.accent },
                      { from: theme.secondary, to: theme.primary },
                      { from: theme.button.successBg, to: theme.secondary },
                    ];
                    const icons = ["🧠", "⚡", "🔥"];

                    return (
                      <div
                        key={k}
                        className="p-2 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${colors[idx].from}10, ${colors[idx].to}10)`,
                          border: `1px solid ${colors[idx].from}20`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <span className="text-lg">{icons[idx]}</span>
                            <div>
                              <div
                                className="text-xs font-bold"
                                style={{ color: colors[idx].from }}
                              >
                                {k.replace(/([A-Z])/g, " $1")}
                              </div>
                              <div
                                className="text-[10px]"
                                style={{ color: theme.textSecondary }}
                              >
                                ⏱️ {v.timeMs ?? "—"} ms
                              </div>
                            </div>
                          </div>
                          {idx === 0 && !v.error && (
                            <span
                              className="px-1.5 py-0.5 text-[9px] font-bold rounded-full"
                              style={{
                                background: theme.accent,
                                color: "#000",
                              }}
                            >
                              BEST
                            </span>
                          )}
                        </div>
                        {v.error ? (
                          <div
                            className="p-1.5 text-[10px] rounded"
                            style={{
                              background: `${theme.button.dangerBg}10`,
                              border: `1px solid ${theme.button.dangerBg}30`,
                              color: theme.button.dangerBg,
                            }}
                          >
                            {v.error}
                          </div>
                        ) : (
                          <>
                            <div
                              className="p-2 mb-1.5 rounded"
                              style={{
                                background: `${theme.background}aa`,
                                border: `1px solid ${colors[idx].from}20`,
                              }}
                            >
                              <div
                                className="mb-0.5 text-[10px]"
                                style={{ color: theme.textSecondary }}
                              >
                                Distance
                              </div>
                              <div
                                className="text-lg font-bold"
                                style={{ color: theme.textPrimary }}
                              >
                                {v.distance}{" "}
                                <span
                                  className="text-xs"
                                  style={{ color: theme.textSecondary }}
                                >
                                  km
                                </span>
                              </div>
                            </div>
                            <div
                              className="p-1.5 text-[10px] rounded"
                              style={{
                                color: theme.textSecondary,
                                background: `${theme.primary}10`,
                                border: `1px solid ${theme.primary}20`,
                              }}
                            >
                              🛣️{" "}
                              {v.route
                                .map((idx) => CITY_NAMES[idx])
                                .join(" → ")}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="mb-2 text-4xl">🎮</div>
                  <div
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    Select cities and run algorithms
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
