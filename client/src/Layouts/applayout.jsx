import { Outlet } from "react-router-dom";
import { TopBar } from "../components/Global/TopBar";
import { useTheme } from "../Providers/ThemeProvider";

const Applayout = () => {
  const { theme } = useTheme();
  return (
    <div
      className="min-h-screen p-4 transition-colors duration-300"
      style={{ background: theme.background }}
    >
      <div style={{ background: theme.background }}>
        <TopBar />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Applayout;
