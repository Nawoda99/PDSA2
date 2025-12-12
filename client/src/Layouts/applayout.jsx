import { Outlet } from "react-router-dom";
import { TopBar } from "../components/Global/TopBar";
import { useTheme } from "../Providers/ThemeProvider";

const Applayout = () => {
  const { theme } = useTheme();
  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: theme.background }}
    >
      <div className="px-4 pt-4" style={{ background: theme.background }}>
        <TopBar />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Applayout;
