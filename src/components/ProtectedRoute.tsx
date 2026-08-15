import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/authStore";

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);

  return token === null ? <Navigate to="/login" replace /> : <Outlet />;
}
