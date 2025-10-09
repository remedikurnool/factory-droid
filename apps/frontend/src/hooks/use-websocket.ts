/**
 * WebSocket Hooks
 * React hooks for WebSocket functionality
 */

import { useEffect, useState, useCallback } from 'react'
import {
  socketClient,
  type OrderUpdateEvent,
  type NotificationEvent,
  type SocketEventHandler,
} from '@/lib/websocket/socket-client'

/**
 * Hook to manage WebSocket connection
 */
export function useWebSocket(token?: string) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socketClient.connect(token)

    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)

    socketClient.on('socket:connected', handleConnect)
    socketClient.on('socket:disconnected', handleDisconnect)

    return () => {
      socketClient.off('socket:connected', handleConnect)
      socketClient.off('socket:disconnected', handleDisconnect)
      socketClient.disconnect()
    }
  }, [token])

  return { connected }
}

/**
 * Hook to subscribe to order updates
 */
export function useOrderTracking(orderId: string | null) {
  const [orderUpdate, setOrderUpdate] = useState<OrderUpdateEvent | null>(null)
  const [updates, setUpdates] = useState<OrderUpdateEvent[]>([])

  useEffect(() => {
    if (!orderId) return

    const handleOrderUpdate: SocketEventHandler<OrderUpdateEvent> = (data) => {
      if (data.orderId === orderId) {
        setOrderUpdate(data)
        setUpdates((prev) => [...prev, data])
      }
    }

    socketClient.on('order:update', handleOrderUpdate)
    socketClient.subscribeToOrder(orderId)

    return () => {
      socketClient.off('order:update', handleOrderUpdate)
      socketClient.unsubscribeFromOrder(orderId)
    }
  }, [orderId])

  return { orderUpdate, updates }
}

/**
 * Hook to receive notifications
 */
export function useNotifications() {
  const [notification, setNotification] = useState<NotificationEvent | null>(null)
  const [notifications, setNotifications] = useState<NotificationEvent[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const handleNotification: SocketEventHandler<NotificationEvent> = (data) => {
      setNotification(data)
      setNotifications((prev) => [data, ...prev])
      if (!data.read) {
        setUnreadCount((prev) => prev + 1)
      }
    }

    socketClient.on('notification:new', handleNotification)

    return () => {
      socketClient.off('notification:new', handleNotification)
    }
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    socketClient.send('notification:read', { notificationId })
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    socketClient.send('notification:read-all')
  }, [])

  return {
    notification,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}

/**
 * Hook to track payment updates
 */
export function usePaymentTracking(orderId: string | null) {
  const [paymentUpdate, setPaymentUpdate] = useState<any>(null)

  useEffect(() => {
    if (!orderId) return

    const handlePaymentUpdate: SocketEventHandler = (data) => {
      if (data.orderId === orderId) {
        setPaymentUpdate(data)
      }
    }

    socketClient.on('payment:update', handlePaymentUpdate)

    return () => {
      socketClient.off('payment:update', handlePaymentUpdate)
    }
  }, [orderId])

  return { paymentUpdate }
}
