const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"]);

export function isLoopbackHost(host: string): boolean {
  return LOOPBACK_HOSTS.has(host.trim().toLowerCase());
}

/**
 * Pick an API origin that works for web, emulators, and Expo Go on LAN devices.
 * Loopback EXPO_PUBLIC_API_URL values are ignored on native — phones cannot reach
 * the developer machine via localhost.
 */
export function resolveApiBaseUrl(options: {
  envUrl?: string | null;
  platformOS: string;
  expoDevHost?: string | null;
  port?: number;
}): string {
  const port = options.port ?? 4000;
  const envUrl = options.envUrl?.trim();

  if (envUrl) {
    try {
      const parsed = new URL(envUrl);
      const isNative = options.platformOS === "ios" || options.platformOS === "android";
      if (!(isNative && isLoopbackHost(parsed.hostname))) {
        return envUrl.replace(/\/$/, "");
      }
    } catch {
      return envUrl.replace(/\/$/, "");
    }
  }

  const expoHost = options.expoDevHost?.trim();
  if (expoHost && !isLoopbackHost(expoHost)) {
    return `http://${expoHost}:${port}`;
  }

  if (options.platformOS === "android") {
    return `http://10.0.2.2:${port}`;
  }

  return `http://localhost:${port}`;
}

/** Extract host from Expo hostUri / linking URLs like `192.168.0.1:8081` or `exp://192.168.0.1:8081`. */
export function hostFromExpoUri(uri: string | null | undefined): string | null {
  if (!uri) return null;
  const cleaned = uri.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").split("/")[0] ?? "";
  const host = cleaned.split(":")[0]?.trim();
  if (!host || isLoopbackHost(host)) return null;
  return host;
}
