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
    overall: { totalGames: 0, totalCorrect: 0, totalTime: 0, successRate: 0 },
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [hanoiRes, queensRes, trafficRes, tspRes] =
        await Promise.allSettled([
          api.get(`/hanoi/stats/${user.username}`),
          api.get(`/eightQueens/player/${user.id}`),
          api.get(`/traffic/history/${user.id}`),
          api.get(`/tsp/stats/${user.username}`),
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
        const games = Array.isArray(queensRes.value.data.data)
          ? queensRes.value.data.data
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
        const data = tspRes.value.data.data;

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

      const totalGames =
        hanoiData.played +
        queensData.played +
        trafficData.played +
        tspData.played;
      const totalCorrect =
        hanoiData.solved +
        queensData.solved +
        trafficData.correct +
        tspData.played;
      const successRate =
        totalGames > 0 ? (totalCorrect / totalGames) * 100 : 0;

      setStats({
        hanoi: hanoiData,
        queens: queensData,
        traffic: trafficData,
        tsp: tspData,
        overall: {
          totalGames,
          totalCorrect,
          successRate,
        },
      });
      console.log(user.username);

      console.log(tspData);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
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
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-2">
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

      {/* Quick Actions */}
      <h2
        className="mb-4 text-2xl font-bold"
        style={{ color: theme.textPrimary }}
      >
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {gameCards.map((game) => (
          <button
            key={game.id}
            onClick={() => navigate(game.path)}
            className="p-4 transition-all duration-300 rounded-xl"
            style={{
              background: `${game.color}20`,
              border: `2px solid ${game.color}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.borderColor = game.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.borderColor = `${game.color}40`;
            }}
          >
            <div className="mb-2 text-3xl">{game.icon}</div>
            <p
              className="text-sm font-semibold"
              style={{ color: theme.textPrimary }}
            >
              Play Now
            </p>
          </button>
        ))}
      </div>

      {/* Achievements Section */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
