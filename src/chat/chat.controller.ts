import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('createRoom')
  async createRoom(@Body('roomName') roomName: string) {
    return this.chatService.createRoom(roomName);
  }
}
