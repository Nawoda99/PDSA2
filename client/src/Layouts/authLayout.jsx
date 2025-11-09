import { Outlet } from "react-router-dom";
import { useTheme } from "../Providers/ThemeProvider";

const AuthLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen p-1 transition-colors duration-300 flex items-center justify-center"
      style={{
        background: `${theme.background}`,
      }}
    >
      <div
        className="flex-1 "
        style={{
          background: `${theme.surface}f8`,
          border: `1px solid ${theme.primary}30`,
          boxShadow: `0 10px 30px ${theme.primary}20`,
        }}
      >
        {children ?? <Outlet />}
      </div>
    </div>
  );
};

export default AuthLayout;
