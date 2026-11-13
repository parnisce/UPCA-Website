import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/components/admin/login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in | UPCA Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LoginPage,
});
