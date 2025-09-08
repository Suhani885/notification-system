import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import api from "~/utils/axios";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    try {
      const response = await api.get("login");
      const user = response.data.user;
      const currentPath = window.location.pathname;

      if (!user) {
        return redirect({ to: "/" });
      }

      if (user.is_superuser) {
        if (currentPath !== "/admin") {
          return redirect({ to: "/admin" });
        }
        return null;
      }

      if (currentPath !== "/dashboard") {
        return redirect({ to: "/dashboard" });
      }
      return null;
    } catch (error) {
      return redirect({ to: "/" });
    }
  },
  component: AuthWrapper,
});

function AuthWrapper() {
  return <Outlet />;
}
