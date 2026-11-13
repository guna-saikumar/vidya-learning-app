const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"]);

export function isLoopbackHost(host: string): boolean {
  return LOOPBACK_HOSTS.has(host.trim().toLowerCase());
}

export function isLanHost(host: string): boolean {
  const h = host.trim().toLowerCase();
  if (isLoopbackHost(h)) return true;
  if (h.endsWith(".local")) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  return false;
}

/**
 * Pick an API origin that works for web, emulators, and Expo Go on LAN devices.
 * Loopback EXPO_PUBLIC_API_URL values are ignored on native — phones cannot reach
 * the developer machine via localhost.
 * On web in a browser, prefers the active browser hostname (e.g. localhost or current LAN host)
 * unless an external production (HTTPS) URL is specified.
 */
export function resolveApiBaseUrl(options: {
  envUrl?: string | null;
  platformOS: string;
  expoDevHost?: string | null;
  port?: number;
}): string {
  const port = options.port ?? 4000;
  const envUrl = options.envUrl?.trim();
  const isWeb = options.platformOS === "web";
  const isNative = options.platformOS === "ios" || options.platformOS === "android";

  // When running in a browser environment on web, prefer the active browser hostname
  // (e.g. localhost or current LAN host) unless an external production (HTTPS) URL is specified.
  if (isWeb && typeof window !== "undefined" && window.location?.hostname) {
    if (envUrl) {
      try {
        const parsed = new URL(envUrl);
        if (parsed.protocol === "https:" && !isLanHost(parsed.hostname)) {
          return envUrl.replace(/\/$/, "");
        }
      } catch {
        // invalid URL, continue to fallback
      }
    }
    const hostname = window.location.hostname;
    return `http://${hostname}:${port}`;
  }

  if (envUrl) {
    try {
      const parsed = new URL(envUrl);
      if (!(isNative && isLoopbackHost(parsed.hostname))) {
        return envUrl.replace(/\/$/, "");
      }
    } catch {
      return envUrl.replace(/\/$/, "");
    }
  }

  if (isWeb) {
    return `http://localhost:${port}`;
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
