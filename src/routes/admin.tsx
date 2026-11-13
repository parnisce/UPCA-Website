import { createFileRoute } from "@tanstack/react-router";

import { AdminApp } from "@/components/admin/admin-app";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Dashboard | UPCA Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminApp,
});
