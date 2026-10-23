import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  loginStudent,
  validateSession,
  logoutStudent,
  refreshAccessToken,
  getStoredToken,
  getStoredRefreshToken,
  getStoredUser,
  getApiClient,
  resetClientInstances,
  setStorageProvider,
  memoryStorage,
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_USER_KEY,
} from '../src/services/authService';
import { ApiError } from '@vidya/api-client';
import { LoginResponse, MeResponse, RefreshResponse } from '@vidya/auth';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('authService Integration Tests', () => {
  beforeEach(() => {
    resetClientInstances();
    setStorageProvider(memoryStorage);
  });

  it('loginStudent: saves tokens, updates ApiClient accessToken, and stores user', async () => {
    const calledUrls: string[] = [];
    let calledBody: any = null;

    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = url.toString();
      calledUrls.push(path);

      if (path.endsWith('/api/v1/auth/login')) {
        calledBody = init?.body ? JSON.parse(init.body as string) : null;
        const mockRes: LoginResponse = {
          accessToken: 'jwt-student-token-abc',
          refreshToken: 'refresh-student-token-abc',
          user: { id: 'student-99', email: 'priya@vidya.test' },
        };
        return json(mockRes);
      }

      if (path.endsWith('/api/v1/auth/me')) {
        const mockMe: MeResponse = {
          user: { id: 'student-99', email: 'priya@vidya.test' },
          isOnboarded: false,
        };
        return json(mockMe);
      }

      return json({ error: 'Not found' }, 404);
    };

    const result = await loginStudent('priya@vidya.test', 'SecretPass123!');

    assert.deepStrictEqual(calledUrls, [
      'http://localhost:4000/api/v1/auth/login',
      'http://localhost:4000/api/v1/auth/me',
    ]);
    assert.deepStrictEqual(calledBody, {
      email: 'priya@vidya.test',
      password: 'SecretPass123!',
    });
    assert.strictEqual(result.token, 'jwt-student-token-abc');
    assert.strictEqual(result.refreshToken, 'refresh-student-token-abc');
    assert.strictEqual(result.user.email, 'priya@vidya.test');
    assert.strictEqual(result.isOnboarded, false);

    // Storage and client assertions
    assert.strictEqual(await getStoredToken(), 'jwt-student-token-abc');
    assert.strictEqual(await getStoredRefreshToken(), 'refresh-student-token-abc');
    const storedUser = await getStoredUser();
    assert.strictEqual(storedUser?.id, 'student-99');
    assert.strictEqual(getApiClient().getAuthToken(), 'jwt-student-token-abc');
  });

  it('loginStudent: throws ApiError on 401 invalid credentials', async () => {
    globalThis.fetch = async () => json({ error: 'Invalid email or password' }, 401);

    await assert.rejects(
      async () => {
        await loginStudent('priya@vidya.test', 'BadPassword');
      },
      (err: any) => {
        assert(err instanceof ApiError);
        assert.strictEqual(err.status, 401);
        assert.strictEqual(err.message, 'Invalid email or password');
        return true;
      }
    );

    assert.strictEqual(await getStoredToken(), null);
    assert.strictEqual(await getStoredRefreshToken(), null);
    assert.strictEqual(getApiClient().getAuthToken(), null);
  });

  it('validateSession: restores valid session via GET /api/v1/auth/me', async () => {
    await memoryStorage.setItem(AUTH_TOKEN_KEY, 'restored-token-xyz');

    let authHeader = '';
    globalThis.fetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
      authHeader = new Headers(init?.headers).get('Authorization') || '';
      const mockMe: MeResponse = {
        user: { id: 'student-100', email: 'rahul@vidya.test' },
        isOnboarded: true,
      };
      return json(mockMe);
    };

    const user = await validateSession();

    assert.strictEqual(authHeader, 'Bearer restored-token-xyz');
    assert.strictEqual(user?.id, 'student-100');
    assert.strictEqual(user?.email, 'rahul@vidya.test');
    assert.strictEqual(getApiClient().getAuthToken(), 'restored-token-xyz');
  });

  it('validateSession: renews an expired access token via POST /api/v1/auth/refresh', async () => {
    await memoryStorage.setItem(AUTH_TOKEN_KEY, 'expired-access');
    await memoryStorage.setItem(AUTH_REFRESH_TOKEN_KEY, 'valid-refresh');

    const calls: string[] = [];
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = url.toString();
      calls.push(`${init?.method ?? 'GET'} ${path.replace('http://localhost:4000', '')}`);

      if (path.endsWith('/api/v1/auth/refresh')) {
        const body = JSON.parse(init?.body as string);
        assert.deepStrictEqual(body, { refreshToken: 'valid-refresh' });
        const res: RefreshResponse = {
          accessToken: 'fresh-access',
          refreshToken: 'rotated-refresh',
        };
        return json(res);
      }

      const bearer = new Headers(init?.headers).get('Authorization');
      if (bearer === 'Bearer expired-access') {
        return json({ error: 'Unauthorized' }, 401);
      }
      assert.strictEqual(bearer, 'Bearer fresh-access');
      const me: MeResponse = {
        user: { id: 'student-7', email: 'asha@vidya.test' },
        isOnboarded: true,
      };
      return json(me);
    };

    const user = await validateSession();

    assert.deepStrictEqual(calls, [
      'GET /api/v1/auth/me',
      'POST /api/v1/auth/refresh',
      'GET /api/v1/auth/me',
    ]);
    assert.strictEqual(user?.id, 'student-7');
    assert.strictEqual(await getStoredToken(), 'fresh-access');
    assert.strictEqual(await getStoredRefreshToken(), 'rotated-refresh');
    assert.strictEqual(getApiClient().getAuthToken(), 'fresh-access');
  });

  it('validateSession: handles 401 with no usable refresh token by clearing session', async () => {
    await memoryStorage.setItem(AUTH_TOKEN_KEY, 'expired-token');
    await memoryStorage.setItem(AUTH_USER_KEY, JSON.stringify({ email: 'old@vidya.test' }));

    globalThis.fetch = async () => json({ error: 'Unauthorized' }, 401);

    const user = await validateSession();

    assert.strictEqual(user, null);
    assert.strictEqual(await getStoredToken(), null);
    assert.strictEqual(await getStoredUser(), null);
    assert.strictEqual(getApiClient().getAuthToken(), null);
  });

  it('validateSession: clears session when the refresh token is rejected', async () => {
    await memoryStorage.setItem(AUTH_TOKEN_KEY, 'expired-token');
    await memoryStorage.setItem(AUTH_REFRESH_TOKEN_KEY, 'revoked-refresh');

    globalThis.fetch = async () => json({ error: 'Invalid or expired refresh token' }, 401);

    const user = await validateSession();

    assert.strictEqual(user, null);
    assert.strictEqual(await getStoredToken(), null);
    assert.strictEqual(await getStoredRefreshToken(), null);
  });

  it('refreshAccessToken: returns null without a stored refresh token', async () => {
    globalThis.fetch = async () => {
      throw new Error('fetch should not be called');
    };
    assert.strictEqual(await refreshAccessToken(), null);
  });

  it('logoutStudent: revokes refresh token via POST /api/v1/auth/logout and clears local auth', async () => {
    await memoryStorage.setItem(AUTH_TOKEN_KEY, 'active-token');
    await memoryStorage.setItem(AUTH_REFRESH_TOKEN_KEY, 'active-refresh');
    await memoryStorage.setItem(AUTH_USER_KEY, JSON.stringify({ email: 'user@vidya.test' }));
    getApiClient().setAccessToken('active-token');

    let loggedOutUrl = '';
    let loggedOutBody: any = null;
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      loggedOutUrl = url.toString();
      loggedOutBody = JSON.parse(init?.body as string);
      return json({ success: true });
    };

    await logoutStudent();

    assert.strictEqual(loggedOutUrl, 'http://localhost:4000/api/v1/auth/logout');
    assert.deepStrictEqual(loggedOutBody, { refreshToken: 'active-refresh' });
    assert.strictEqual(await getStoredToken(), null);
    assert.strictEqual(await getStoredRefreshToken(), null);
    assert.strictEqual(await getStoredUser(), null);
    assert.strictEqual(getApiClient().getAuthToken(), null);
  });

  it('logoutStudent: still clears local auth when the server call fails', async () => {
    await memoryStorage.setItem(AUTH_TOKEN_KEY, 'active-token');
    await memoryStorage.setItem(AUTH_REFRESH_TOKEN_KEY, 'active-refresh');
    globalThis.fetch = async () => {
      throw new Error('network down');
    };

    await logoutStudent();

    assert.strictEqual(await getStoredToken(), null);
    assert.strictEqual(await getStoredRefreshToken(), null);
  });
});
