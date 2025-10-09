/**
 * WebSocket Client for Real-time Updates
 * Handles order tracking, notifications, and real-time events
 */

import { io, Socket } from 'socket.io-client'

export interface OrderUpdateEvent {
  orderId: string
  status: string
  message: string
  timestamp: string
  location?: string
}

export interface NotificationEvent {
  id: string
  type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'SYSTEM'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export type SocketEventHandler<T = any> = (data: T) => void

class SocketClient {
  private socket: Socket | null = null
  private connected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private handlers: Map<string, Set<SocketEventHandler>> = new Map()

  /**
   * Initialize WebSocket connection
   */
  connect(token?: string): void {
    if (this.socket && this.connected) {
      console.log('[WebSocket] Already connected')
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'

    this.socket = io(wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    })

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected')
      this.connected = true
      this.reconnectAttempts = 0
      this.emit('socket:connected', {})
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason)
      this.connected = false
      this.emit('socket:disconnected', { reason })
    })

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error)
      this.reconnectAttempts++
      this.emit('socket:error', { error: error.message })

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached')
        this.disconnect()
      }
    })

    // Order tracking events
    this.socket.on('order:update', (data: OrderUpdateEvent) => {
      console.log('[WebSocket] Order update:', data)
      this.emit('order:update', data)
    })

    // Notification events
    this.socket.on('notification:new', (data: NotificationEvent) => {
      console.log('[WebSocket] New notification:', data)
      this.emit('notification:new', data)
    })

    // Payment events
    this.socket.on('payment:update', (data: any) => {
      console.log('[WebSocket] Payment update:', data)
      this.emit('payment:update', data)
    })
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[WebSocket] Disconnecting...')
      this.socket.disconnect()
      this.socket = null
      this.connected = false
      this.handlers.clear()
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrder(orderId: string): void {
    if (!this.socket || !this.connected) {
      console.warn('[WebSocket] Not connected, cannot subscribe to order')
      return
    }

    console.log('[WebSocket] Subscribing to order:', orderId)
    this.socket.emit('order:subscribe', { orderId })
  }

  /**
   * Unsubscribe from order updates
   */
  unsubscribeFromOrder(orderId: string): void {
    if (!this.socket || !this.connected) {
      return
    }

    console.log('[WebSocket] Unsubscribing from order:', orderId)
    this.socket.emit('order:unsubscribe', { orderId })
  }

  /**
   * Register event handler
   */
  on<T = any>(event: string, handler: SocketEventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  /**
   * Unregister event handler
   */
  off<T = any>(event: string, handler: SocketEventHandler<T>): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  /**
   * Emit event to registered handlers
   */
  private emit<T = any>(event: string, data: T): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (error) {
          console.error(`[WebSocket] Error in handler for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Send message to server
   */
  send(event: string, data?: any): void {
    if (!this.socket || !this.connected) {
      console.warn('[WebSocket] Not connected, cannot send message')
      return
    }

    this.socket.emit(event, data)
  }
}

// Export singleton instance
export const socketClient = new SocketClient()
