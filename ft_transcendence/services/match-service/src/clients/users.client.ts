export type UserDTO = { id: number; username: string };
export type UsersMap = Record<number, UserDTO>;

export function makeUsersClient(baseURL: string) {
  const base = baseURL.replace(/\/+$/, '');

  return {
    async fetchUsersMap(ids: number[], jwt?: string): Promise<UsersMap> {
      if (!ids.length) return {};
      const url = `${base}/users/bulk?ids=${encodeURIComponent(ids.join(','))}`;
      const res = await fetch(url, {
        headers: {
          accept: 'application/json',
          ...(jwt ? { cookie: `jwt=${jwt}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`UserService error ${res.status}`);
      const data = (await res.json()) as UserDTO[];
      return Object.fromEntries(data.map(u => [u.id, u]));
    },
    async getUser(id: number, jwt?: string): Promise<UserDTO | null> {
      const res = await fetch(`${base}/users/${id}`, {
        headers: {
          accept: 'application/json',
          ...(jwt ? { cookie: `jwt=${jwt}` } : {}),
        },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`UserService error ${res.status}`);
      return (await res.json()) as UserDTO;
    },
  };
}

export type UsersClient = ReturnType<typeof makeUsersClient>;