import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTheme } from "../../Providers/ThemeProvider";
import {
  Menu,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  GamepadIcon,
  Crown,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Providers/AuthProvider";

export const TopBar = ({ onToggleSidebar }) => {
  const { theme } = useTheme();
  const { user: authUser, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isGamesDropdownOpen, setIsGamesDropdownOpen] = useState(false);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const gamesDropdownRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const [username, setUsername] = useState(() => {
    return authUser?.username || localStorage.getItem("username") || "";
  });

  useEffect(() => {
    setUsername(authUser?.username || localStorage.getItem("username") || "");
  }, [authUser]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "username" || e.key === "user") {
        setUsername(
          authUser?.username || localStorage.getItem("username") || ""
        );
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [authUser]);

  const isLoggedIn = !!username;

  const games = [
    { name: "Home", path: "/", icon: Home },
    {
      name: "N Queens",
      //path: "/n-queens",
      icon: Crown,
    },
    { name: "Tower of Hanoi", path: "/hanoi", icon: GamepadIcon },
  ];

  const displayUser = useMemo(
    () => ({
      name: username || "Guest",
      id: authUser?.id || "PDSAGamer01",
    }),
    [username, authUser]
  );

  const dateTimeOptions = useMemo(
    () => ({
      dateOptions: {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      },
      timeOptions: {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      },
    }),
    []
  );

  function handleLogout() {
    try {
      if (logout) logout();
    } catch (e) {}
    localStorage.removeItem("username");
    navigate("/login");
    setIsProfileDropdownOpen(false);
  }

  const dropdownMenuItems = useMemo(
    () => [
      {
        id: "profile",
        label: "View Profile",
        icon: User,
        onClick: () => setIsProfileDropdownOpen(false),
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        onClick: () => setIsProfileDropdownOpen(false),
      },
      {
        id: "help",
        label: "Help & Support",
        icon: HelpCircle,
        onClick: () => setIsProfileDropdownOpen(false),
      },
      {
        id: "divider",
        type: "divider",
      },
      {
        id: "logout",
        label: "Logout",
        icon: LogOut,
        onClick: handleLogout,
        variant: "danger",
      },
    ],
    []
  );

  const updateDateTime = useCallback(() => {
    const date = new Date();
    setCurrentTime(
      date.toLocaleTimeString("en-US", dateTimeOptions.timeOptions)
    );
    setCurrentDate(
      date.toLocaleDateString("en-US", dateTimeOptions.dateOptions)
    );
  }, [dateTimeOptions]);

  const toggleDropdown = useCallback(() => {
    setIsProfileDropdownOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsProfileDropdownOpen(false);
  }, []);

  const toggleGamesDropdown = useCallback(() => {
    setIsGamesDropdownOpen((prev) => !prev);
  }, []);

  const closeGamesDropdown = useCallback(() => {
    setIsGamesDropdownOpen(false);
  }, []);

  const handleClickOutside = useCallback(
    (event) => {
      const isClickedOutsideDesktop =
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target);
      const isClickedOutsideMobile =
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target);
      const isClickedOutsideGames =
        gamesDropdownRef.current &&
        !gamesDropdownRef.current.contains(event.target);

      if (isClickedOutsideDesktop && isClickedOutsideMobile) {
        closeDropdown();
      }
      if (isClickedOutsideGames) {
        closeGamesDropdown();
      }
    },
    [closeDropdown, closeGamesDropdown]
  );

  const renderMenuItem = useCallback(
    (item) => {
      if (item.type === "divider") {
        return (
          <hr
            key={item.id}
            className="my-2"
            style={{ borderColor: `${theme.input.border}40` }}
          />
        );
      }

      const IconComponent = item.icon;
      const isDanger = item.variant === "danger";

      return (
        <button
          key={item.id}
          onClick={item.onClick}
          className="flex items-center w-full px-4 py-2.5 text-sm transition-all duration-200 rounded-lg focus:outline-none"
          style={{
            color: isDanger ? "#e17055" : theme.input.text,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = isDanger
              ? "#e1705515"
              : `${theme.primary}15`;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
          }}
        >
          <IconComponent className="w-4 h-4 mr-3" />
          {item.label}
        </button>
      );
    },
    [theme.input.text, theme.input.border, theme.primary]
  );

  useEffect(() => {
    updateDateTime();
    intervalRef.current = setInterval(updateDateTime, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateDateTime]);

  useEffect(() => {
    if (isProfileDropdownOpen || isGamesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen, isGamesDropdownOpen, handleClickOutside]);

  const UserInfo = useMemo(
    () => (
      <div className="flex items-center">
        <div
          className="flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-full"
          style={{
            background: theme.button.primaryBgGradient,
            color: theme.button.primaryText,
          }}
        >
          {displayUser.name.charAt(0)}
        </div>
        <div className="flex flex-col ml-3">
          <span
            className="text-sm font-medium"
            style={{ color: theme.topBarText }}
          >
            {displayUser.name}
          </span>
          <span className="text-xs" style={{ color: `${theme.topBarText}90` }}>
            {displayUser.id}
          </span>
        </div>
      </div>
    ),
    [displayUser, theme]
  );

  const DesktopDropdownContent = useMemo(
    () => (
      <div
        className="absolute right-0 w-64 mt-2 shadow-lg rounded-xl backdrop-blur-sm"
        style={{
          background: theme.modal.background,
          border: `1px solid ${theme.modal.border}40`,
          zIndex: 1000,
        }}
      >
        <div className="p-2">{dropdownMenuItems.map(renderMenuItem)}</div>
      </div>
    ),
    [theme, dropdownMenuItems, renderMenuItem]
  );

  const MobileDropdownContent = useMemo(
    () => (
      <div
        className="absolute right-0 mt-2 shadow-lg w-72 rounded-xl backdrop-blur-sm"
        style={{
          background: theme.modal.background,
          border: `1px solid ${theme.modal.border}40`,
          zIndex: 1000,
        }}
      >
        <div
          className="p-4 border-b"
          style={{ borderColor: `${theme.input.border}30` }}
        >
          {isLoggedIn && (
            <div className="flex items-center mb-3">
              <div
                className="flex items-center justify-center w-12 h-12 text-lg font-semibold rounded-full"
                style={{
                  background: theme.button.primaryBgGradient,
                  color: theme.button.primaryText,
                }}
              >
                {displayUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 ml-3">
                <span
                  className="block text-base font-semibold"
                  style={{ color: theme.modal.text }}
                >
                  {displayUser.name}
                </span>
                <span
                  className="block text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  {displayUser.id}
                </span>
              </div>
            </div>
          )}
          <div
            className="space-y-2 text-xs"
            style={{ color: theme.textSecondary }}
          >
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🕐</span>
              <span className="font-mono">{currentTime}</span>
            </div>
          </div>
        </div>
        <div className="p-2">{dropdownMenuItems.map(renderMenuItem)}</div>
      </div>
    ),
    [
      displayUser,
      isLoggedIn,
      currentDate,
      currentTime,
      theme,
      dropdownMenuItems,
      renderMenuItem,
    ]
  );

  const GamesDropdownContent = useMemo(
    () => (
      <div
        className="absolute left-0 w-64 mt-2 shadow-lg rounded-xl backdrop-blur-sm"
        style={{
          background: theme.modal.background,
          border: `1px solid ${theme.modal.border}40`,
          zIndex: 1000,
        }}
      >
        <div className="p-2">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <a
                key={game.name}
                href={game.path}
                className="flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg"
                style={{ color: theme.input.text }}
                onMouseEnter={(e) => {
                  e.target.style.background = `${theme.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
                onClick={closeGamesDropdown}
              >
                <div
                  className="flex items-center justify-center rounded-lg w-9 h-9"
                  style={{
                    background: `${theme.primary}20`,
                    color: theme.primary,
                  }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{game.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    ),
    [games, theme, closeGamesDropdown]
  );

  return (
    <header
      className="sticky top-0 z-50 shadow-md rounded-xl backdrop-blur-sm"
      style={{
        background: `${theme.bar}f5`,
        border: `1px solid ${theme.primary}25`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3.5">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <div ref={gamesDropdownRef} className="relative">
            <button
              onClick={toggleGamesDropdown}
              className="p-2 transition-all duration-200 rounded-lg"
              style={{ color: theme.topBarText }}
              onMouseEnter={(e) => {
                e.target.style.background = `${theme.primary}20`;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
              disabled={!isLoggedIn}
            >
              <Menu className="w-5 h-5" />
            </button>
            {isGamesDropdownOpen && isLoggedIn && GamesDropdownContent}
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{
                background: theme.button.primaryBgGradient,
                color: theme.button.primaryText,
              }}
            >
              <GamepadIcon className="w-5 h-5" />
            </div>
            <div>
              <h1
                className="hidden text-lg font-bold sm:block"
                style={{ color: theme.topBarText }}
              >
                Gaming Platform
              </h1>
              <span
                className="text-base font-bold sm:hidden"
                style={{ color: theme.topBarText }}
              >
                Gaming Platform
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex sm:items-center sm:gap-3">
            <div className="mr-2 text-right">
              <div
                className="text-sm font-medium"
                style={{ color: theme.topBarText }}
              >
                {displayUser.name}
              </div>
              <div
                className="font-mono text-xs"
                style={{ color: `${theme.topBarText}80` }}
              >
                {currentTime}
              </div>
            </div>

            <div ref={desktopDropdownRef} className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 p-2 transition-all duration-200 rounded-lg"
                style={{ color: theme.topBarText }}
                onMouseEnter={(e) => {
                  e.target.style.background = `${theme.primary}20`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                <div
                  className="flex items-center justify-center text-sm font-semibold rounded-full w-9 h-9"
                  style={{
                    background: theme.button.primaryBgGradient,
                    color: theme.button.primaryText,
                  }}
                >
                  {displayUser.name.charAt(0)}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isProfileDropdownOpen && DesktopDropdownContent}
            </div>
          </div>

          <div ref={mobileDropdownRef} className="relative sm:hidden">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 p-2 transition-all duration-200 rounded-lg"
              style={{ color: theme.topBarText }}
            >
              <div
                className="flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full"
                style={{
                  background: theme.button.primaryBgGradient,
                  color: theme.button.primaryText,
                }}
              >
                {displayUser.name.charAt(0)}
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isProfileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isProfileDropdownOpen && MobileDropdownContent}
          </div>
        </div>
      </div>
    </header>
  );
};
