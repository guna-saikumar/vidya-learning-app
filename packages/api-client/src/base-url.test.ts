import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hostFromExpoUri,
  isLoopbackHost,
  resolveApiBaseUrl,
} from "./base-url";

describe("resolveApiBaseUrl", () => {
  it("uses localhost for web", () => {
    assert.equal(
      resolveApiBaseUrl({ platformOS: "web" }),
      "http://localhost:4000"
    );
  });

  it("ignores loopback env URL on native and uses Expo LAN host", () => {
    assert.equal(
      resolveApiBaseUrl({
        envUrl: "http://localhost:4000",
        platformOS: "ios",
        expoDevHost: "192.168.0.126",
      }),
      "http://192.168.0.126:4000"
    );
  });

  it("keeps explicit non-loopback env URL", () => {
    assert.equal(
      resolveApiBaseUrl({
        envUrl: "http://192.168.0.126:4000",
        platformOS: "android",
        expoDevHost: "10.0.0.5",
      }),
      "http://192.168.0.126:4000"
    );
  });

  it("falls back to Android emulator loopback", () => {
    assert.equal(
      resolveApiBaseUrl({ platformOS: "android" }),
      "http://10.0.2.2:4000"
    );
  });
});

describe("hostFromExpoUri", () => {
  it("parses host from Expo URIs", () => {
    assert.equal(hostFromExpoUri("192.168.0.126:8081"), "192.168.0.126");
    assert.equal(hostFromExpoUri("exp://192.168.0.126:8081"), "192.168.0.126");
    assert.equal(hostFromExpoUri("http://localhost:8081"), null);
    assert.equal(isLoopbackHost("127.0.0.1"), true);
  });
});
