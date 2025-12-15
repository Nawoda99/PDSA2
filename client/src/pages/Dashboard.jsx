import React, { useState, useEffect } from "react";
import { useTheme } from "../Providers/ThemeProvider";
import { useAuth } from "../Providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Award,
  Activity,
  ChevronRight,
  Zap,
  Cpu,
  Timer,
} from "lucide-react";

const Dashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hanoi: { played: 0, solved: 0, avgMoves: 0, bestTime: 0 },
    queens: { played: 0, solved: 0, avgTime: 0, totalSolutions: 0 },
    traffic: { played: 0, correct: 0, avgTime: 0, accuracy: 0 },
    tsp: { played: 0, avgCost: 0, bestCost: 0, totalCities: 0 },
    snake: { played: 0, won: 0, avgRolls: 0, bestRolls: 0 },
    overall: { totalGames: 0, totalCorrect: 0, totalTime: 0, successRate: 0 },
  });

  // New state for algorithm performance
  const [algoPerformance, setAlgoPerformance] = useState({
    queens: { sequential: null, threaded: null },
    hanoi: { recursive: null, iterative: null },
    traffic: { fordFulkerson: null, edmondsKarp: null },
    tsp: { primMST: null, dijkstraSPT: null, greedyTSP: null },
    snake: { bfs: null, dijkstra: null },
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchAlgorithmPerformance();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [hanoiRes, queensRes, trafficRes, tspRes, snakeRes] =
        await Promise.allSettled([
          api.get(`/hanoi/stats/${user.username}`),
          api.get(`/eightQueens/player/${user.id}`),
          api.get(`/traffic/history/${user.id}`),
          api.get(`/tsp/stats/${user.username}`),
          api.get(`/snake-game/${user.username}`),
        ]);

      let hanoiData = { played: 0, solved: 0, avgMoves: 0, bestTime: 0 };
      if (hanoiRes.status === "fulfilled" && hanoiRes.value.data.success) {
        const games = Array.isArray(hanoiRes.value.data.data)
          ? hanoiRes.value.data.data
          : [];
        hanoiData.played = games.length;
        hanoiData.solved = games.filter((g) => g.isCorrect).length;
        hanoiData.avgMoves =
          games.length > 0
            ? games.reduce((sum, g) => sum + (g.playerMoves || 0), 0) /
              games.length
            : 0;
        hanoiData.bestTime =
          games.length > 0
            ? Math.min(...games.map((g) => g.playerTime || Infinity))
            : 0;
      }

      let queensData = { played: 0, solved: 0, avgTime: 0, totalSolutions: 0 };
      if (queensRes.status === "fulfilled" && queensRes.value.data.success) {
        // Fix: access the solutions array directly
        const games = Array.isArray(queensRes.value.data.data?.solutions)
          ? queensRes.value.data.data.solutions
          : [];
        queensData.played = games.length;
        queensData.solved = games.length;
        queensData.totalSolutions = games.length;
        queensData.avgTime =
          games.length > 0
            ? games.reduce((sum, g) => sum + (g.timeSpent || 0), 0) /
              games.length
            : 0;
      }

      let trafficData = { played: 0, correct: 0, avgTime: 0, accuracy: 0 };
      if (trafficRes.status === "fulfilled" && trafficRes.value.data.success) {
        const games = Array.isArray(trafficRes.value.data.data)
          ? trafficRes.value.data.data
          : [];
        trafficData.played = games.length;
        trafficData.correct = games.filter((g) => g.isCorrect).length;
        trafficData.avgTime =
          games.length > 0
            ? games.reduce((sum, g) => sum + (g.timeTaken || 0), 0) /
              games.length
            : 0;
        trafficData.accuracy =
          games.length > 0 ? (trafficData.correct / games.length) * 100 : 0;
      }

      let tspData = { played: 0, avgCost: 0, bestCost: 0, totalCities: 0 };
      if (tspRes.status === "fulfilled" && tspRes.value.data.success) {
        const data = tspRes.value.data.data?.data || tspRes.value.data.data;

        if (data && typeof data === "object" && !Array.isArray(data)) {
          tspData.played = data.totalGames || 0;
          tspData.avgCost = Math.round(data.avgDistance || 0);
          tspData.bestCost = data.bestDistance || 0;
          tspData.totalCities = data.numberOfCities || 0;
        } else if (Array.isArray(data)) {
          tspData.played = data.length;
          tspData.avgCost =
            data.length > 0
              ? Math.round(
                  data.reduce((sum, g) => sum + (g.totalCost || 0), 0) /
                    data.length
                )
              : 0;
          tspData.bestCost =
            data.length > 0
              ? Math.min(...data.map((g) => g.totalCost || Infinity))
              : 0;
          tspData.totalCities =
            data.length > 0
              ? data.reduce((sum, g) => sum + (g.citiesVisited || 0), 0)
              : 0;
        }
      }

      let snakeData = { played: 0, won: 0, avgRolls: 0, bestRolls: 0 };
      if (snakeRes.status === "fulfilled" && snakeRes.value.data.success) {
        const games = Array.isArray(snakeRes.value.data.data.games)
          ? snakeRes.value.data.data.games
          : [];
        snakeData.played = games.length;
        snakeData.won = games.filter((g) => g.isCorrect).length;
      }

      const totalGames =
        hanoiData.played +
        queensData.played +
        trafficData.played +
        tspData.played +
        snakeData.played;

      const totalCorrect =
        hanoiData.solved +
        queensData.solved +
        trafficData.correct +
        tspData.played +
        snakeData.won;

      const successRate =
        totalGames > 0 ? (totalCorrect / totalGames) * 100 : 0;

      setStats({
        hanoi: hanoiData,
        queens: queensData,
        traffic: trafficData,
        tsp: tspData,
        snake: snakeData,
        overall: {
          totalGames,
          totalCorrect,
          successRate,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchAlgorithmPerformance = async () => {
    try {
      const [queensRes, hanoiRes, trafficRes, tspRes, snakeRes] =
        await Promise.allSettled([
          api.get("/eightQueens/performance"),
          api.get(`/hanoi/stats/${user.username}`),
          api.get(`/traffic/history/${user.id}`),
          api.get(`/tsp/stats/${user.username}`),
          api.get(`/snake-game/${user.username}`),
        ]);
      let queensPerf = { sequential: null, threaded: null };
      if (queensRes.status === "fulfilled" && queensRes.value.data.success) {
        const data = queensRes.value.data.data || [];
        const sequential = data.filter((d) => d.algorithmType === "sequential");
        const threaded = data.filter((d) => d.algorithmType === "threaded");

        if (sequential.length > 0) {
          queensPerf.sequential = {
            avgTime: (
              sequential.reduce((sum, d) => sum + d.executionTime, 0) /
              sequential.length
            ).toFixed(2),
            runs: sequential.length,
          };
        }
        if (threaded.length > 0) {
          queensPerf.threaded = {
            avgTime: (
              threaded.reduce((sum, d) => sum + d.executionTime, 0) /
              threaded.length
            ).toFixed(2),
            runs: threaded.length,
            threads: threaded[0]?.threadCount || 4,
          };
        }
      }

      let hanoiPerf = { recursive: null, iterative: null };
      if (hanoiRes.status === "fulfilled" && hanoiRes.value.data.success) {
        const games = Array.isArray(hanoiRes.value.data.data)
          ? hanoiRes.value.data.data
          : [];
        if (games.length > 0) {
          const recursiveTimes = games
            .filter((g) => g.recursiveTimeMs)
            .map((g) => g.recursiveTimeMs);
          const iterativeTimes = games
            .filter((g) => g.iterativeTimeMs)
            .map((g) => g.iterativeTimeMs);

          if (recursiveTimes.length > 0) {
            hanoiPerf.recursive = {
              avgTime: (
                recursiveTimes.reduce((a, b) => a + b, 0) /
                recursiveTimes.length
              ).toFixed(2),
              runs: recursiveTimes.length,
            };
          }
          if (iterativeTimes.length > 0) {
            hanoiPerf.iterative = {
              avgTime: (
                iterativeTimes.reduce((a, b) => a + b, 0) /
                iterativeTimes.length
              ).toFixed(2),
              runs: iterativeTimes.length,
            };
          }
        }
      }

      let trafficPerf = { fordFulkerson: null, edmondsKarp: null };
      if (trafficRes.status === "fulfilled" && trafficRes.value.data.success) {
        const games = Array.isArray(trafficRes.value.data.data)
          ? trafficRes.value.data.data
          : [];
        if (games.length > 0) {
          const algo1Times = games
            .filter((g) => g.algorithm1Time)
            .map((g) => g.algorithm1Time);
          const algo2Times = games
            .filter((g) => g.algorithm2Time)
            .map((g) => g.algorithm2Time);

          if (algo1Times.length > 0) {
            trafficPerf.fordFulkerson = {
              avgTime: (
                algo1Times.reduce((a, b) => a + b, 0) / algo1Times.length
              ).toFixed(2),
              runs: algo1Times.length,
            };
          }
          if (algo2Times.length > 0) {
            trafficPerf.edmondsKarp = {
              avgTime: (
                algo2Times.reduce((a, b) => a + b, 0) / algo2Times.length
              ).toFixed(2),
              runs: algo2Times.length,
            };
          }
        }
      }

      let tspPerf = { primMST: null, dijkstraSPT: null, greedyTSP: null };
      if (tspRes.status === "fulfilled" && tspRes.value.data.success) {
        const data = tspRes.value.data.data || tspRes.value.data.data;

        if (data) {
          tspPerf = {
            primMST:
              data.primMSTTimeMs !== undefined
                ? { avgTime: data.primMSTTimeMs }
                : null,
            dijkstraSPT:
              data.dijkstraSPTTimeMs !== undefined
                ? { avgTime: data.dijkstraSPTTimeMs }
                : null,
            greedyTSP:
              data.greedyTSTimeMs !== undefined
                ? { avgTime: data.greedyTSTimeMs }
                : null,
          };
        }
      }

      let snakePerf = { bfs: null, dijkstra: null };
      if (snakeRes.status === "fulfilled" && snakeRes.value.data.success) {
        const performance = Array.isArray(snakeRes.value.data.data.performance)
          ? snakeRes.value.data.data.performance
          : [];
        const bfsTimes = performance
          .filter((p) => p.algorithmName === "BFS")
          .map((p) => p.timeTakenNanos);
        const dijkstraTimes = performance
          .filter((p) => p.algorithmName === "Dijkstra")
          .map((p) => p.timeTakenNanos);
        if (bfsTimes.length > 0) {
          snakePerf.bfs = {
            avgTime: (
              bfsTimes.reduce((a, b) => a + b, 0) / bfsTimes.length
            ).toFixed(0),
            runs: bfsTimes.length,
          };
        }
        if (dijkstraTimes.length > 0) {
          snakePerf.dijkstra = {
            avgTime: (
              dijkstraTimes.reduce((a, b) => a + b, 0) / dijkstraTimes.length
            ).toFixed(0),
            runs: dijkstraTimes.length,
          };
        }
      }

      setAlgoPerformance({
        queens: queensPerf,
        hanoi: hanoiPerf,
        traffic: trafficPerf,
        tsp: tspPerf,
        snake: snakePerf,
      });
    } catch (error) {
      console.error("Error fetching algorithm performance:", error);
    }
  };

  const gameCards = [
    {
      id: "hanoi",
      title: "Tower of Hanoi",
      icon: "🗼",
      color: "#f39c12",
      path: "/hanoi",
      stats: [
        { label: "Games Played", value: stats.hanoi.played, icon: Activity },
        { label: "Puzzles Solved", value: stats.hanoi.solved, icon: Trophy },
        {
          label: "Avg Moves",
          value: stats.hanoi.avgMoves.toFixed(0),
          icon: Target,
        },
        {
          label: "Best Time",
          value:
            stats.hanoi.bestTime === Infinity || stats.hanoi.bestTime === 0
              ? "-"
              : `${stats.hanoi.bestTime}s`,
          icon: Clock,
        },
      ],
    },
    {
      id: "queens",
      title: "8-Queens Puzzle",
      icon: "♛",
      color: "#9b59b6",
      path: "/eight-queens",
      stats: [
        { label: "Games Played", value: stats.queens.played, icon: Activity },
        {
          label: "Solutions Found",
          value: stats.queens.totalSolutions,
          icon: Trophy,
        },
        {
          label: "Avg Time",
          value: `${stats.queens.avgTime.toFixed(0)}s`,
          icon: Clock,
        },
      ],
    },
    {
      id: "traffic",
      title: "Traffic Simulation",
      icon: "🚦",
      color: "#3498db",
      path: "/traffic-simulation",
      stats: [
        { label: "Games Played", value: stats.traffic.played, icon: Activity },
        {
          label: "Correct Answers",
          value: stats.traffic.correct,
          icon: Target,
        },
        {
          label: "Accuracy",
          value: `${stats.traffic.accuracy.toFixed(0)}%`,
          icon: TrendingUp,
        },
      ],
    },
    {
      id: "tsp",
      title: "Traveling Salesman",
      icon: "🗺️",
      color: "#e67e22",
      path: "/traveling-salesman",
      stats: [
        { label: "Games Played", value: stats.tsp.played, icon: Activity },
        {
          label: "Avg Cost",
          value: stats.tsp.avgCost.toFixed(0),
          icon: Target,
        },
        {
          label: "Best Cost",
          value:
            stats.tsp.bestCost === Infinity || stats.tsp.bestCost === 0
              ? "-"
              : stats.tsp.bestCost.toFixed(0),
          icon: Trophy,
        },
      ],
    },

    {
      id: "snake",
      title: "Snakes & Ladders",
      icon: "🐍",
      color: "#27ae60",
      path: "/snake-ladder",
      stats: [
        { label: "Games Played", value: stats.snake.played, icon: Activity },
        {
          label: "Games Won",
          value: stats.snake.won,
          icon: Trophy,
        },
        {
          label: "Win Rate",
          value:
            stats.snake.played > 0
              ? `${((stats.snake.won / stats.snake.played) * 100).toFixed(0)}%`
              : "0%",
          icon: TrendingUp,
        },
      ],
    },
  ];

  const overallStats = [
    {
      label: "Total Games",
      value: stats.overall.totalGames,
      icon: Activity,
      color: "#3498db",
    },
    {
      label: "Success Rate",
      value: `${stats.overall.successRate.toFixed(0)}%`,
      icon: TrendingUp,
      color: "#2ecc71",
    },
    {
      label: "Total Wins",
      value: stats.overall.totalCorrect,
      icon: Trophy,
      color: "#f39c12",
    },
    {
      label: "Achievements",
      value: Math.floor(stats.overall.totalCorrect / 5),
      icon: Award,
      color: "#9b59b6",
    },
  ];

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: theme.background }}
      >
        <div
          className="text-xl font-semibold"
          style={{ color: theme.textPrimary }}
        >
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6"
      style={{ background: theme.background, minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          className="mb-2 text-4xl font-bold"
          style={{ color: theme.textPrimary }}
        >
          Welcome back, {user?.username}! 👋
        </h1>
        <p style={{ color: theme.textSecondary }}>
          Here's your gaming progress and statistics
        </p>
      </div>
      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {overallStats.map((stat, index) => (
          <div
            key={index}
            className="p-6 transition-all duration-300 rounded-xl hover:shadow-lg"
            style={{
              background: theme.surface,
              border: `1px solid ${theme.primary}20`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="p-3 rounded-lg"
                style={{
                  background: `${stat.color}20`,
                }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
            </div>
            <h3
              className="mb-1 text-3xl font-bold"
              style={{ color: theme.textPrimary }}
            >
              {stat.value}
            </h3>
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      {/* Game Stats */}
      <h2
        className="mb-4 text-2xl font-bold"
        style={{ color: theme.textPrimary }}
      >
        Game Statistics
      </h2>
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
        {gameCards.map((game) => (
          <div
            key={game.id}
            onClick={() => navigate(game.path)}
            className="p-6 transition-all duration-300 cursor-pointer rounded-xl hover:shadow-xl"
            style={{
              background: theme.surface,
              border: `2px solid ${theme.primary}20`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = game.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = `${theme.primary}20`;
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{game.icon}</div>
                <div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    {game.title}
                  </h3>
                </div>
              </div>
              <ChevronRight size={24} style={{ color: theme.textSecondary }} />
            </div>

            <div className="space-y-3">
              {game.stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    background: `${game.color}10`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <stat.icon size={18} style={{ color: game.color }} />
                    <span
                      className="text-sm font-medium"
                      style={{ color: theme.textSecondary }}
                    >
                      {stat.label}
                    </span>
                  </div>
                  <span
                    className="text-lg font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <h2
        className="mb-4 text-2xl font-bold"
        style={{ color: theme.textPrimary }}
      >
        Algorithm Performance Comparison ⚡
      </h2>
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          className="p-6 rounded-xl"
          style={{
            background: theme.surface,
            border: `2px solid #9b59b620`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">♛</div>
            <h3
              className="text-lg font-bold"
              style={{ color: theme.textPrimary }}
            >
              8-Queens Algorithms
            </h3>
          </div>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#9b59b615" }}
            >
              <div className="flex items-center gap-2">
                <Cpu size={18} style={{ color: "#9b59b6" }} />
                <span style={{ color: theme.textSecondary }}>Sequential</span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.queens.sequential?.avgTime || "-"} ms
                </span>
                {algoPerformance.queens.sequential?.runs && (
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    {algoPerformance.queens.sequential.runs} runs
                  </p>
                )}
              </div>
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#9b59b615" }}
            >
              <div className="flex items-center gap-2">
                <Zap size={18} style={{ color: "#e74c3c" }} />
                <span style={{ color: theme.textSecondary }}>
                  Threaded (4 threads)
                </span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.queens.threaded?.avgTime || "-"} ms
                </span>
                {algoPerformance.queens.threaded?.runs && (
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    {algoPerformance.queens.threaded.runs} runs
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tower of Hanoi Algorithms */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: theme.surface,
            border: `2px solid #f39c1220`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">🗼</div>
            <h3
              className="text-lg font-bold"
              style={{ color: theme.textPrimary }}
            >
              Hanoi Algorithms
            </h3>
          </div>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#f39c1215" }}
            >
              <div className="flex items-center gap-2">
                <Timer size={18} style={{ color: "#f39c12" }} />
                <span style={{ color: theme.textSecondary }}>Recursive</span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.hanoi.recursive?.avgTime || "-"} ms
                </span>
                {algoPerformance.hanoi.recursive?.runs && (
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    {algoPerformance.hanoi.recursive.runs} runs
                  </p>
                )}
              </div>
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#f39c1215" }}
            >
              <div className="flex items-center gap-2">
                <Cpu size={18} style={{ color: "#27ae60" }} />
                <span style={{ color: theme.textSecondary }}>Iterative</span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.hanoi.iterative?.avgTime || "-"} ms
                </span>
                {algoPerformance.hanoi.iterative?.runs && (
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    {algoPerformance.hanoi.iterative.runs} runs
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Simulation Algorithms */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: theme.surface,
            border: `2px solid #3498db20`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">🚦</div>
            <h3
              className="text-lg font-bold"
              style={{ color: theme.textPrimary }}
            >
              Max Flow Algorithms
            </h3>
          </div>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#3498db15" }}
            >
              <div className="flex items-center gap-2">
                <Activity size={18} style={{ color: "#3498db" }} />
                <span style={{ color: theme.textSecondary }}>
                  Ford-Fulkerson
                </span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.traffic.fordFulkerson?.avgTime || "-"} ms
                </span>
                {algoPerformance.traffic.fordFulkerson?.runs && (
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    {algoPerformance.traffic.fordFulkerson.runs} runs
                  </p>
                )}
              </div>
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#3498db15" }}
            >
              <div className="flex items-center gap-2">
                <Zap size={18} style={{ color: "#e67e22" }} />
                <span style={{ color: theme.textSecondary }}>Edmonds-Karp</span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.traffic.edmondsKarp?.avgTime || "-"} ms
                </span>
                {algoPerformance.traffic.edmondsKarp?.runs && (
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    {algoPerformance.traffic.edmondsKarp.runs} runs
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TSP Algorithms */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: theme.surface,
            border: `2px solid #e67e2220`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">🗺️</div>
            <h3
              className="text-lg font-bold"
              style={{ color: theme.textPrimary }}
            >
              TSP Algorithms
            </h3>
          </div>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#e67e2215" }}
            >
              <div className="flex items-center gap-2">
                <Activity size={18} style={{ color: "#27ae60" }} />
                <span style={{ color: theme.textSecondary }}>Prim's MST</span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.tsp.primMST?.avgTime} ms
                </span>
              </div>
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#e67e2215" }}
            >
              <div className="flex items-center gap-2">
                <Target size={18} style={{ color: "#3498db" }} />
                <span style={{ color: theme.textSecondary }}>Dijkstra SPT</span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.tsp.dijkstraSPT?.avgTime} ms
                </span>
              </div>
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#e67e2215" }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={18} style={{ color: "#9b59b6" }} />
                <span style={{ color: theme.textSecondary }}>Greedy TSP</span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.tsp.greedyTSP?.avgTime} ms
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-xl"
          style={{
            background: theme.surface,
            border: `2px solid #27ae6020`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">🐍</div>
            <h3
              className="text-lg font-bold"
              style={{ color: theme.textPrimary }}
            >
              Snake and Ladder
            </h3>
          </div>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#27ae6015" }}
            >

              <div className="flex items-center gap-2">
                <Activity size={18} style={{ color: "#27ae60" }} />
                <span style={{ color: theme.textSecondary }}>BFS</span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.snake.bfs?.avgTime || "-"} ns
                </span>
              </div>
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "#27ae6015" }}
            >
              <div className="flex items-center gap-2">
                <Zap size={18} style={{ color: "#e74c3c" }} />
                <span style={{ color: theme.textSecondary }}>Dijkstra</span>
              </div>
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {algoPerformance.snake.dijkstra?.avgTime || "-"} ns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {stats.overall.totalCorrect >= 5 && (
        <div className="mt-8">
          <h2
            className="mb-4 text-2xl font-bold"
            style={{ color: theme.textPrimary }}
          >
            Recent Achievements 🏆
          </h2>
          <div
            className="p-6 rounded-xl"
            style={{
              background: theme.surface,
              border: `1px solid ${theme.primary}20`,
            }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {stats.overall.totalGames >= 10 && (
                <div
                  className="p-4 text-center rounded-lg"
                  style={{ background: `${theme.primary}10` }}
                >
                  <div className="mb-2 text-4xl">🎮</div>
                  <p className="font-bold" style={{ color: theme.textPrimary }}>
                    Game Enthusiast
                  </p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    Played 10+ games
                  </p>
                </div>
              )}
              {stats.overall.successRate >= 80 && (
                <div
                  className="p-4 text-center rounded-lg"
                  style={{ background: `${theme.primary}10` }}
                >
                  <div className="mb-2 text-4xl">⭐</div>
                  <p className="font-bold" style={{ color: theme.textPrimary }}>
                    High Achiever
                  </p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    80%+ success rate
                  </p>
                </div>
              )}
              {stats.queens.totalSolutions >= 5 && (
                <div
                  className="p-4 text-center rounded-lg"
                  style={{ background: `${theme.primary}10` }}
                >
                  <div className="mb-2 text-4xl">♛</div>
                  <p className="font-bold" style={{ color: theme.textPrimary }}>
                    Queens Master
                  </p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    Found 5+ solutions
                  </p>
                </div>
              )}
              {stats.hanoi.solved >= 5 && (
                <div
                  className="p-4 text-center rounded-lg"
                  style={{ background: `${theme.primary}10` }}
                >
                  <div className="mb-2 text-4xl">🗼</div>
                  <p className="font-bold" style={{ color: theme.textPrimary }}>
                    Tower Master
                  </p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    Solved 5+ Hanoi puzzles
                  </p>
                </div>
              )}
              {stats.tsp.played >= 5 && (
                <div
                  className="p-4 text-center rounded-lg"
                  style={{ background: `${theme.primary}10` }}
                >
                  <div className="mb-2 text-4xl">🗺️</div>
                  <p className="font-bold" style={{ color: theme.textPrimary }}>
                    Route Optimizer
                  </p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    Completed 5+ TSP routes
                  </p>
                </div>
              )}

              {stats.snake.played >= 5 && (
                <div
                  className="p-4 text-center rounded-lg"
                  style={{ background: `${theme.primary}10` }}
                >
                  <div className="mb-2 text-4xl">🎲</div>
                  <p className="font-bold" style={{ color: theme.textPrimary }}>
                    Luck Master
                  </p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    Played 5+ Snake games
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
