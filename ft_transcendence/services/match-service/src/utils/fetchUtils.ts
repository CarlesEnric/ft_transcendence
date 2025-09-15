import { Agent } from 'undici';

const INSECURE_TLS = (process.env.ALLOW_SELF_SIGNED ?? '1') === '1';
export const insecureAgent = INSECURE_TLS ? new Agent({ connect: { rejectUnauthorized: false } }) : undefined;

type FetchInitLike = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  dispatcher?: any;
  [k: string]: any;
};

export async function fetchJson<T = any>(url: string, init?: FetchInitLike) : Promise<{ ok: boolean; status: number; data?: T }>
{
  try
  {
    const r = await fetch(url, { ...(init ?? {}), dispatcher: insecureAgent });
    if (!r.ok) return { ok: false, status: r.status };
    const data = (await r.json()) as T;
    return { ok: true, status: r.status, data };
  }
  catch
  {
    return { ok: false, status: 599 };
  }
}

export function forwardAuth(initHeaders?: Record<string, string> | Array<[string, string]>, bearer?: string): Record<string, string>
{
  const h = new Headers();
  if (Array.isArray(initHeaders))
  {
    for (const [k, v] of initHeaders) h.set(k, String(v));
  }
  else if (initHeaders)
  {
    for (const k of Object.keys(initHeaders)) h.set(k, String(initHeaders[k]));
  }
  if (bearer && !h.has('authorization')) h.set('authorization', `Bearer ${bearer}`);
  if (!h.has('accept')) h.set('accept', 'application/json');
  return Object.fromEntries(h.entries());
}