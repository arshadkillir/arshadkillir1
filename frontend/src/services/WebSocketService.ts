type MessageListener = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: MessageListener[] = [];
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('✅ WebSocket Connected');
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.listeners.forEach((listener) => listener(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('❌ WebSocket Disconnected. Reconnecting in 3s...');
      this.socket = null;
      this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
    };

    this.socket.onerror = (error: Event) => {
      console.error('WebSocket Error:', error);
      this.socket?.close();
    };
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not open. Message not sent.');
    }
  }

  subscribe(listener: MessageListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

// Use ws:// for native WebSockets
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:4000";
export const wsService = new WebSocketService(WS_URL);
