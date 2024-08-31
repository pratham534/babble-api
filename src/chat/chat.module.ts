import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { Message } from '../entity/message.entity';
import { Room } from '../entity/room.entity';
import { RedisModule } from 'nestjs-redis';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Room])],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
