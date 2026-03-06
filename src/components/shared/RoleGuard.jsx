import { useAuthStore } from "@/store/authStore";

export function RoleGuard({ roles, children, fallback = null }) {
  const user = useAuthStore((s) => s.user);

  if (!user || !roles.includes(user.role)) {
    return fallback;
  }

  return children;
}
