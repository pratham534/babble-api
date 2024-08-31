import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody('room') room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    const messages = await this.chatService.getMessages(room);
    return { event: 'history', data: messages };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody('room') room: string,
    @MessageBody('message') message: string,
    @ConnectedSocket() client: Socket,
  ) {
    const newMessage = await this.chatService.saveMessage(
      room,
      message,
      client.id,
    );
    client.to(room).emit('newMessage', newMessage);
  }
}
