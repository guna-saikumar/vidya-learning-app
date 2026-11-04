// k6 load test for the Vidya API (apps/api, NestJS on Fastify).
// SCENARIO: health | classes | me | login (all under /api/v1)
import http from "k6/http";
import { check } from "k6";

const BASE = __ENV.BASE_URL || "http://127.0.0.1:4100";
const SCENARIO = __ENV.SCENARIO || "classes";
const CREDS = JSON.stringify({ email: "student@vidya.test", password: "StudentDemo1!" }); // packages/db seed user
const JSON_H = { "Content-Type": "application/json" };

export const options = {
  vus: Number(__ENV.VUS || 50),
  duration: __ENV.DURATION || "30s",
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "p(99)", "max"],
};

export function setup() {
  return { token: http.post(`${BASE}/api/v1/auth/login`, CREDS, { headers: JSON_H }).json("accessToken") };
}

export default function (data) {
  let res;
  if (SCENARIO === "health") res = http.get(`${BASE}/health`);
  else if (SCENARIO === "classes") res = http.get(`${BASE}/api/v1/curriculum/classes`, { headers: { Authorization: `Bearer ${data.token}` } });
  else if (SCENARIO === "me") res = http.get(`${BASE}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${data.token}` } });
  else res = http.post(`${BASE}/api/v1/auth/login`, CREDS, { headers: JSON_H });
  check(res, { "status 2xx": (r) => r.status >= 200 && r.status < 300 });
}
