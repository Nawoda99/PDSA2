import React, { useState } from "react";
import { useTheme } from "../Providers/ThemeProvider";
import { useNotification } from "../Providers/NotificationProvider";
import { useAuth } from "../Providers/AuthProvider";
import { User, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmed = username.trim();
    if (!trimmed) {
      showNotification("Please enter a username", "warning");
      return;
    }

    if (trimmed.length < 3) {
      showNotification(
        "Username must be at least 3 characters long",
        "warning"
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(trimmed);
      if (result.success) {
        //showNotification(`Welcome, ${result.user.username}!`, "success");
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
          } else if (document.documentElement.msRequestFullscreen) {
            await document.documentElement.msRequestFullscreen();
          }
        } catch (fullscreenErr) {
          console.log("Fullscreen request failed:", fullscreenErr);
        }
        navigate("/");
      } else {
        showNotification(result.message || "Login failed", "error");
      }
    } catch (err) {
      showNotification(err.message || "Login error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^a-zA-Z0-9_]/g, "");
    setUsername(cleanValue);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle, ${theme.primary} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div
        className="relative w-full max-w-md p-8 shadow-2xl rounded-2xl backdrop-blur-sm"
        style={{
          background: `${theme.surface}f0`,
          border: `1px solid ${theme.primary}30`,
          boxShadow: `0 20px 40px ${theme.primary}20`,
        }}
      >
        <div className="mb-8 text-center">
          <div
            className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
          >
            <User className="w-8 h-8 text-white" />
          </div>

          <h1
            className="mb-2 text-3xl font-bold"
            style={{ color: theme.textPrimary }}
          >
            Welcome
          </h1>

          <p
            className="text-sm opacity-70"
            style={{ color: theme.textSecondary }}
          >
            Enter your username to get started
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-semibold"
              style={{ color: theme.textPrimary }}
            >
              Username
            </label>

            <div className="relative">
              <div className="absolute left-0 flex items-center pointer-events-none top-3 pl-80">
                <User
                  className="w-5 h-5 opacity-50"
                  style={{ color: theme.textSecondary }}
                />
              </div>

              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your username"
                maxLength={20}
                className="w-full py-3 pl-12 pr-4 text-sm transition-all duration-200 border-2 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  background: theme.input.background,
                  border: `2px solid ${theme.input.border}`,
                  color: theme.textPrimary,
                  "--placeholder-color": theme.textSecondary + "80",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.input.border;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span
                className="opacity-60"
                style={{ color: theme.textSecondary }}
              >
                Only letters, numbers, and underscores
              </span>
              <span
                className="opacity-60"
                style={{ color: theme.textSecondary }}
              >
                {username.length}/20
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isLoading || !username.trim() || username.trim().length < 3
            }
            className="w-full px-4 py-3 text-sm font-semibold transition-all duration-200 transform rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{
              background: theme.button.primaryBgGradient,
              color: theme.button.primaryText,
              boxShadow: `0 4px 15px ${theme.primary}40`,
            }}
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Continue</span>
                </>
              )}
            </div>
          </button>
        </form>

        <div
          className="pt-6 mt-6 text-center border-t"
          style={{ borderColor: `${theme.primary}20` }}
        >
          <p
            className="text-xs opacity-60"
            style={{ color: theme.textSecondary }}
          >
            Your session will be saved securely
          </p>
        </div>

        <div
          className="absolute w-20 h-20 rounded-full -top-2 -right-2 opacity-10"
          style={{ background: theme.primary }}
        />
        <div
          className="absolute w-16 h-16 rounded-full -bottom-2 -left-2 opacity-10"
          style={{ background: theme.secondary }}
        />
      </div>
    </div>
  );
};

export default Login;
