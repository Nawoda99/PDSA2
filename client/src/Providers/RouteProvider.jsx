import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Applayout from "../Layouts/applayout";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "../Layouts/authLayout";
import HanoiGame from "../pages/HanoiTower/game";

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
          <Route path="/" element={<Home />} />
          <Route path="/hanoi" element={<HanoiGame/>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
