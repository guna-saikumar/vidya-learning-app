/** Resolve the API base URL. In dev, set EXPO_PUBLIC_CONTACT_API_URL in mobile/.env
 *  to your machine's LAN IP (e.g. http://192.168.x.x:4100). */
const getBaseUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_CONTACT_API_URL;
  return url ? url.replace(/\/$/, '') : 'http://localhost:4100';
};

export const apiBaseUrl = getBaseUrl();

export type ComplaintCategory =
  | 'technical_issue'
  | 'textbook_access'
  | 'recorded_classes'
  | 'attendance'
  | 'login_account'
  | 'content_issue'
  | 'billing_fees'
  | 'feedback'
  | 'other';

export type ComplaintPayload = {
  full_name: string;
  class_grade: number;
  section?: string;
  roll_number?: string;
  email?: string;
  phone?: string;
  category: ComplaintCategory;
  subject: string;
  message: string;
};

export type SupportConfig = {
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
};

export type ComplaintResponse = {
  id: string;
  ticket_ref: string;
  status: ComplaintStatus;
  created_at: string;
};

export type ComplaintStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'escalated';

export type ComplaintSummary = {
  id: string;
  ticket_ref: string;
  full_name: string;
  class_grade: number;
  section: string | null;
  roll_number: string | null;
  email: string | null;
  phone: string | null;
  category: ComplaintCategory;
  subject: string;
  message: string;
  status: ComplaintStatus;
  source: string;
  created_at: string;
  updated_at: string;
};

const adminHeaders = (token: string) => ({
  'x-admin-token': token,
  Accept: 'application/json',
});

async function adminFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { ...adminHeaders(token), ...(init?.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid admin token');
    throw new Error(body?.error || body?.message || 'Request failed');
  }
  return body;
}

export async function listComplaints(token: string): Promise<ComplaintSummary[]> {
  return adminFetch('/api/v1/support/complaints', token);
}

export async function updateComplaintStatus(
  token: string,
  ticketRef: string,
  status: ComplaintStatus
): Promise<ComplaintSummary> {
  return adminFetch(
    `/api/v1/support/complaints/${encodeURIComponent(ticketRef)}/status`,
    token,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }
  );
}

export async function fetchSupportConfig(): Promise<SupportConfig | null> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/support/config`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as SupportConfig;
  } catch {
    return null;
  }
}

export async function fileComplaint(
  payload: ComplaintPayload
): Promise<ComplaintResponse> {
  const res = await fetch(`${apiBaseUrl}/api/v1/support/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = Array.isArray(body?.details)
      ? body.details.map((d: { message: string }) => d.message).join(' ')
      : null;
    throw new Error(detail || body?.error || body?.message || 'Could not file complaint.');
  }
  return body as ComplaintResponse;
}
