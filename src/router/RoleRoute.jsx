import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function RoleRoute({ roles, children }) {
  const user = useAuthStore((s) => s.user);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
