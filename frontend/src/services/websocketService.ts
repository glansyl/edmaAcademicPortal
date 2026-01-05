import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { logger } from '@/lib/logger';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

export class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private subscriptions: Map<string, any> = new Map();

  connect(token: string, onConnected?: () => void, onError?: (error: Error | unknown) => void): void {
    if (this.connected) {
      logger.log('WebSocket already connected');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        logger.debug('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        logger.log('WebSocket connected');
        this.connected = true;
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        logger.error('STOMP error:', frame);
        this.connected = false;
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        logger.log('WebSocket connection closed');
        this.connected = false;
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
      logger.log('WebSocket disconnected');
    }
  }

  subscribe<T = unknown>(destination: string, callback: (message: T) => void): void {
    if (!this.client || !this.connected) {
      logger.error('Cannot subscribe - WebSocket not connected');
      return;
    }

    if (this.subscriptions.has(destination)) {
      logger.log('Already subscribed to', destination);
      return;
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const body = JSON.parse(message.body);
        callback(body);
      } catch (error) {
        logger.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    logger.log('Subscribed to', destination);
  }

  unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      logger.log('Unsubscribed from', destination);
    }
  }

  send<T = unknown>(destination: string, body: T): void {
    if (!this.client || !this.connected) {
      logger.error('Cannot send message - WebSocket not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const webSocketService = new WebSocketService();
