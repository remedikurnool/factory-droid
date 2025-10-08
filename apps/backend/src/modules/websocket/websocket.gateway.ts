import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
})
export class OrderTrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrderTrackingGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      // Store socket connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(client.id);

      client.data.userId = userId;

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      client.emit('connected', { message: 'Connected to order tracking' });
    } catch (error) {
      this.logger.error('Connection error', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToOrder')
  handleSubscribeToOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string }
  ) {
    client.join(`order:${data.orderId}`);
    this.logger.log(`Client ${client.id} subscribed to order ${data.orderId}`);
    return { event: 'subscribed', data: { orderId: data.orderId } };
  }

  @SubscribeMessage('unsubscribeFromOrder')
  handleUnsubscribeFromOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string }
  ) {
    client.leave(`order:${data.orderId}`);
    this.logger.log(`Client ${client.id} unsubscribed from order ${data.orderId}`);
    return { event: 'unsubscribed', data: { orderId: data.orderId } };
  }

  // Emit order status update to all subscribers
  emitOrderStatusUpdate(orderId: string, status: string, metadata?: any) {
    this.server.to(`order:${orderId}`).emit('orderStatusUpdate', {
      orderId,
      status,
      timestamp: new Date(),
      ...metadata,
    });
    this.logger.log(`Order ${orderId} status updated to ${status}`);
  }

  // Emit order location update
  emitOrderLocationUpdate(orderId: string, location: any) {
    this.server.to(`order:${orderId}`).emit('orderLocationUpdate', {
      orderId,
      location,
      timestamp: new Date(),
    });
  }

  // Emit delivery agent assigned
  emitDeliveryAgentAssigned(orderId: string, agent: any) {
    this.server.to(`order:${orderId}`).emit('deliveryAgentAssigned', {
      orderId,
      agent,
      timestamp: new Date(),
    });
  }

  // Emit order out for delivery
  emitOrderOutForDelivery(orderId: string, estimatedTime: Date) {
    this.server.to(`order:${orderId}`).emit('orderOutForDelivery', {
      orderId,
      estimatedTime,
      timestamp: new Date(),
    });
  }

  // Emit order delivered
  emitOrderDelivered(orderId: string) {
    this.server.to(`order:${orderId}`).emit('orderDelivered', {
      orderId,
      timestamp: new Date(),
    });
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
      this.logger.log(`Notification sent to user ${userId}`);
    }
  }

  // Broadcast message to all connected clients
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Broadcast: ${event}`);
  }
}
