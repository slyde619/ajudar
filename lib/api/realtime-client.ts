import { socketMessageSchema } from "@/lib/schemas/realtime";
import type {
  RealtimeBatch,
  RealtimeEvent,
  RealtimeSubscription,
  RealtimeTopic,
  Result,
} from "@/lib/types";

export interface RealtimeListener {
  onEvent: (event: RealtimeEvent) => void;
  onResync: () => void;
}

interface TopicState {
  cursor: number;
  listeners: Map<RealtimeListener, { since: number }>;
}

export interface RealtimeTransport {
  sync(): void;
  stop(): void;
}

export type TransportFactory = (
  deliver: (batch: RealtimeBatch) => void,
  current: () => RealtimeSubscription[],
) => RealtimeTransport;

export class RealtimeHub {
  private topics = new Map<RealtimeTopic, TopicState>();
  private transport: RealtimeTransport | null = null;

  constructor(private readonly createTransport: TransportFactory) {}

  subscribe(topic: RealtimeTopic, since: number, listener: RealtimeListener): () => void {
    let state = this.topics.get(topic);
    if (!state) {
      state = { cursor: since, listeners: new Map() };
      this.topics.set(topic, state);
    } else if (since < state.cursor) {
      queueMicrotask(listener.onResync);
    }
    state.listeners.set(listener, { since: Math.max(since, state.cursor) });
    this.sync();

    return () => {
      const current = this.topics.get(topic);
      if (!current) return;
      current.listeners.delete(listener);
      if (current.listeners.size === 0) this.topics.delete(topic);
      this.sync();
    };
  }

  private current(): RealtimeSubscription[] {
    return [...this.topics].map(([topic, state]) => ({ topic, since: state.cursor }));
  }

  private sync(): void {
    if (this.topics.size === 0) {
      this.transport?.stop();
      this.transport = null;
      return;
    }
    this.transport ??= this.createTransport(
      (batch) => this.deliver(batch),
      () => this.current(),
    );
    this.transport.sync();
  }

  private deliver(batch: RealtimeBatch): void {
    for (const event of batch.events) {
      const state = this.topics.get(event.topic);
      if (!state) continue;
      for (const [listener, seen] of state.listeners) {
        if (event.seq <= seen.since) continue;
        seen.since = event.seq;
        listener.onEvent(event);
      }
      state.cursor = Math.max(state.cursor, event.seq);
    }
    for (const topic of batch.resync) {
      this.topics.get(topic)?.listeners.forEach((_, listener) => listener.onResync());
    }
    for (const [topic, cursor] of Object.entries(batch.cursors) as [RealtimeTopic, number][]) {
      const state = this.topics.get(topic);
      if (!state || cursor <= state.cursor) continue;
      state.cursor = cursor;
      state.listeners.forEach((seen) => (seen.since = Math.max(seen.since, cursor)));
    }
  }
}

function whileVisible(onVisible: () => void, onHidden: () => void): () => void {
  const handle = () => (document.visibilityState === "visible" ? onVisible() : onHidden());
  document.addEventListener("visibilitychange", handle);
  return () => document.removeEventListener("visibilitychange", handle);
}

export function pollingTransport(
  pull: (subscriptions: RealtimeSubscription[]) => Promise<Result<RealtimeBatch>>,
  intervalMs = 1500,
): TransportFactory {
  return (deliver, current) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inFlight = false;
    let again = false;
    let stopped = false;

    const tick = async () => {
      clearTimeout(timer);
      const subscriptions = current();
      if (stopped || subscriptions.length === 0) return;
      if (inFlight) {
        again = true;
        return;
      }
      inFlight = true;
      const result = await pull(subscriptions).catch(() => null);
      inFlight = false;
      if (stopped) return;
      if (result?.ok) deliver(result.data);
      if (again) {
        again = false;
        void tick();
      } else if (document.visibilityState === "visible") {
        timer = setTimeout(tick, intervalMs);
      }
    };
    const unwatch = whileVisible(() => void tick(), () => clearTimeout(timer));

    return {
      sync() {
        void tick();
      },
      stop() {
        stopped = true;
        clearTimeout(timer);
        unwatch();
      },
    };
  };
}

export function socketTransport(url: string): TransportFactory {
  return (deliver, current) => {
    let sent = new Set<RealtimeTopic>();
    let socket: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let stopped = false;

    const send = (message: unknown) => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
    };

    const reconcile = () => {
      const subscriptions = current();
      const wanted = new Set(subscriptions.map((entry) => entry.topic));
      const added = subscriptions.filter((entry) => !sent.has(entry.topic));
      const removed = [...sent].filter((topic) => !wanted.has(topic));
      if (added.length > 0) send({ type: "subscribe", topics: added });
      if (removed.length > 0) send({ type: "unsubscribe", topics: removed });
      if (socket?.readyState === WebSocket.OPEN) sent = wanted;
    };

    const onMessage = (raw: MessageEvent) => {
      let payload: unknown;
      try {
        payload = JSON.parse(String(raw.data));
      } catch {
        return;
      }
      const parsed = socketMessageSchema.safeParse(payload);
      if (!parsed.success) return;
      const message = parsed.data;
      if (message.type === "event") {
        deliver({ events: [message.event], cursors: {}, resync: [] });
      } else {
        deliver({
          events: [],
          cursors: { [message.topic]: message.cursor },
          resync: message.type === "resync" ? [message.topic] : [],
        });
      }
    };

    const connect = () => {
      clearTimeout(retry);
      if (stopped || socket || document.visibilityState !== "visible" || current().length === 0) return;
      const next = new WebSocket(url);
      socket = next;
      next.onopen = () => {
        attempt = 0;
        sent = new Set();
        reconcile();
      };
      next.onmessage = onMessage;
      next.onclose = () => {
        if (socket !== next) return;
        socket = null;
        sent = new Set();
        if (stopped || document.visibilityState !== "visible") return;
        const delay = Math.min(30_000, 1000 * 2 ** attempt) * (0.5 + Math.random() / 2);
        attempt += 1;
        retry = setTimeout(connect, delay);
      };
    };

    const disconnect = () => {
      clearTimeout(retry);
      const current = socket;
      socket = null;
      sent = new Set();
      current?.close(1000, "hidden");
    };

    const unwatch = whileVisible(connect, disconnect);

    return {
      sync() {
        if (socket) reconcile();
        else connect();
      },
      stop() {
        stopped = true;
        unwatch();
        disconnect();
      },
    };
  };
}
