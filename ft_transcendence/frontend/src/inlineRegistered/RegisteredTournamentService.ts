const BASE_MATCHES = `/api/matches`;
const BASE_USERS   = `/api/users`;

async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init
  });
  if (!res.ok) {
    try {
      const j = await res.json();
      throw new Error(j?.error || `${res.status} ${res.statusText}`);
    } catch {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  }
  return res.json() as Promise<T>;
}

export async function fetchRegisteredUsers(): Promise<Array<{id:number; username:string; avatar_url?:string}>> {
  return api(`${BASE_USERS}`);
}

export async function saveMatchHistory(payload: {
  player1Id: number;
  player2Id: number;
  player1Name: string;
  player2Name: string;
  score1: number;
  score2: number;
  mode?: string;
  played_at?: string;
  tournament_id?: number | null;
}): Promise<{ ok: true; id: number }> {
  return api(`${BASE_MATCHES}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}