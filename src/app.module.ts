import { Module, forwardRef } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'babbleuser',
      password: 'babblepassword',
      database: 'babbledb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    RedisModule.register({
      url: 'redis://localhost:6379',
    }),
  ],
})
export class AppModule {}
