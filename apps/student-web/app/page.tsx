"use client";

import React from "react";
import { ApiClient } from "@vidya/api-client";
import type { UserRole } from "@vidya/auth";

const api = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
});

export default function StudentHomePage() {
  const [role] = React.useState<UserRole>("STUDENT");

  // Example client-side call – real implementation should handle loading and errors.
  const [status, setStatus] = React.useState<string>("Loading classes...");
  React.useEffect(() => {
    api
      .get<{ stats: { totalClasses: number } }>("/api/classes")
      .then((data) => setStatus(`You have ${data.stats.totalClasses} classes available.`))
      .catch(() => setStatus("Unable to reach API. Is the backend running?"));
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Vidya Student Portal</h1>
      <p>Role: {role}</p>
      <p>{status}</p>
    </main>
  );
}
