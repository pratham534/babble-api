import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/entity/message.entity';
import { Room } from 'src/entity/room.entity';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private redisService: RedisService,
  ) {}

  async getMessages(roomName: string): Promise<Message[]> {
    const client = this.redisService.getClient();
    const cachedMessages = await client.lrange(`room:${roomName}`, 0, -1);

    if (cachedMessages.length > 0) {
      return cachedMessages.map((msg) => JSON.parse(msg));
    }

    const room = await this.roomRepository.findOne({
      where: { name: roomName },
      relations: ['messages'],
    });
    const messages = room ? room.messages : [];

    if (messages.length > 0) {
      await client.rpush(
        `room:${roomName}`,
        ...messages.map((msg) => JSON.stringify(msg)),
      );
    }

    return messages;
  }

  async saveMessage(
    roomName: string,
    text: string,
    userId: string,
  ): Promise<Message> {
    let room = await this.roomRepository.findOne({ where: { name: roomName } });

    if (!room) {
      room = this.roomRepository.create({ name: roomName });
      await this.roomRepository.save(room);
    }

    const message = this.messageRepository.create({ text, room, userId });
    await this.messageRepository.save(message);

    const client = this.redisService.getClient();
    await client.rpush(`room:${roomName}`, JSON.stringify(message));

    return message;
  }

  async createRoom(roomName: string): Promise<Room> {
    // Check if the room already exists in the database
    let room = await this.roomRepository.findOne({ where: { name: roomName } });

    if (room) {
      throw new Error('Room already exists');
    }

    // Create and save the new room in the database
    room = this.roomRepository.create({ name: roomName });
    await this.roomRepository.save(room);

    // Cache the new room in Redis
    const client = this.redisService.getClient();
    await client.set(`room:${roomName}`, JSON.stringify(room));

    return room;
  }
}
