import type { FastifyRequest } from 'fastify';
import { fetchJson, forwardAuth } from '../utils/fetchUtils.js';

export type AuthProfile = { id: number; username: string; email?: string };
export type PublicUser = { id: number; username: string; email?: string };

const AUTH_BASE = process.env.AUTH_SERVICE_URL || 'https://auth:3001';
const USERS_BASE = process.env.USER_SERVICE_URL || 'https://user:3002';
const SERVICE_JWT = process.env.SERVICE_JWT || '';

export function bearerFrom(req: FastifyRequest): string | undefined {
  const ah = req.headers['authorization'];
  if (typeof ah === 'string' && ah.toLowerCase().startsWith('bearer ')) {
    return ah.slice(7).trim();
  }
  return undefined;
}

export async function getAuthUser(req: FastifyRequest): Promise<AuthProfile | null> {
  // 1) Cabeceras x-user-* (si algún día el gateway las inyecta)
  {
    const xid = req.headers['x-user-id'];
    const xname = req.headers['x-username'];
    const xmail = req.headers['x-email'];
    const idNum =
      typeof xid === 'string' ? Number(xid)
      : Array.isArray(xid) ? Number(xid[0])
      : NaN;

    if (!Number.isNaN(idNum) && idNum > 0 && typeof xname === 'string' && xname.length > 0) {
      return { id: idNum, username: xname, email: typeof xmail === 'string' ? xmail : undefined };
    }
  }

  // 2) Bearer
  const bearer = bearerFrom(req);
  if (bearer) {
    const r = await fetchJson<any>(`${AUTH_BASE}/profile`, {
      headers: forwardAuth(undefined, bearer),
    });
    if (r.ok && r.data) {
      const prof = extractProfile(r.data);
      if (prof) return prof;
    }
  }

  // 3) Cookie (jwt) -> Auth Service
  const cookie = req.headers.cookie;
  if (typeof cookie === 'string' && cookie.length > 0) {
    const r = await fetchJson<any>(`${AUTH_BASE}/profile`, {
      headers: { cookie },
    });
    if (r.ok && r.data) {
      const prof = extractProfile(r.data);
      if (prof) return prof;
    }
  }

  return null;
}

function extractProfile(raw: any): AuthProfile | null {
  const data = raw?.profile ?? raw?.user ?? raw?.data ?? raw;

  const idAny = data?.id ?? data?.userId ?? data?.sub ?? data?.uid;
  const usernameAny = data?.username ?? data?.name;
  if (idAny == null || usernameAny == null) return null;

  const id = Number(idAny);
  const username = String(usernameAny);
  const email = typeof data?.email === 'string' ? data.email : undefined;

  return (Number.isFinite(id) && id > 0 && username)
    ? { id, username, email }
    : null;
}

export async function getUserById(userId: number, req: FastifyRequest): Promise<PublicUser | null> {
  const token = bearerFrom(req) || SERVICE_JWT || undefined;
  const headers = forwardAuth(undefined, token);
  const r = await fetchJson<any>(`${USERS_BASE}/users/${userId}`, { headers });
  if (r.ok && r.data) {
    const u = r.data as any;
    const id = Number(u.id ?? u.userId ?? u.uid);
    const username = String(u.username ?? u.name ?? '');
    if (id > 0 && username) return { id, username, email: u.email };
  } else if (r.status === 401) {
    throw new Error('USER_SERVICE_UNAUTHORIZED');
  }
  return null;
}