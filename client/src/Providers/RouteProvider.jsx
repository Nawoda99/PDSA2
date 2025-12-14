import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Applayout from "../Layouts/applayout";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "../Layouts/authLayout";
import HanoiGame from "../pages/HanoiTower/HanoiTower";
import NQueens from "../pages/Eight-Queens/EightQueens";
import EightQueens from "../pages/Eight-Queens/EightQueens";
import TrafficSimulation from "../pages/TrafficSimulation/TrafficSimulation";
import Dashboard from "../pages/Dashboard";
import TravelingSalesman from "../pages/TravelingSalesman/TravelingSalesman";
import SnakeGame from "../pages/SanakeAndLadder/snakeAndLadder"

export default function RouteProvider() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <Applayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/hanoi" element={<HanoiGame />} />
          <Route path="/eight-queens" element={<EightQueens />} />
          <Route path="/traffic-simulation" element={<TrafficSimulation />} />
          <Route path="/traveling-salesman" element={<TravelingSalesman />} />
          <Route path="/snake-ladder" element={<SnakeGame/>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
