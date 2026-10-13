"use client";

import React from "react";
import { ApiClient } from "@vidya/api-client";
import type { UserRole } from "@vidya/auth";

const api = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
});

export default function AdminDashboardPage() {
  const [role] = React.useState<UserRole>("ADMIN");
  const [status, setStatus] = React.useState<string>("Checking API health...");

  React.useEffect(() => {
    api
      .get<{ ok: boolean }>("/api/admin/ping")
      .then((data) => setStatus(data.ok ? "Backend reachable as admin." : "Unexpected admin response."))
      .catch(() => setStatus("Admin endpoint not reachable. Check auth headers and API."));
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Vidya Admin Dashboard</h1>
      <p>Role: {role}</p>
      <p>{status}</p>
    </main>
  );
}
