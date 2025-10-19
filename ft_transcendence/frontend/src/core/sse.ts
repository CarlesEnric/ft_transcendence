export type SseMessage = { type: string;[k: string]: any };

type Unsub = () => void;

export function listenSSE(url: string, onMessage: (ev: SseMessage) => void): Unsub {
    let es: EventSource | null = null;
    let closed = false;
    let retry = 1000;
    const connect = () =>
    {
        if (closed) return;
        es = new EventSource(url, { withCredentials: true });
        es.onmessage = (e: MessageEvent<string>) => {
            try
            {
                const data = JSON.parse(e.data);
                onMessage(data);
            }
            catch { }
        };
        es.addEventListener('ping', () => { });
        es.onerror = () => {
            if (closed) return;
            es?.close();
            es = null;
            setTimeout(connect, retry);
            retry = Math.min(retry * 2, 15000);
        };
    };
    connect();
    return () => {
        closed = true;
        es?.close();
        es = null;
    };
}
export const openSse = listenSSE;