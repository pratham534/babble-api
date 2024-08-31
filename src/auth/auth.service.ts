import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateOrRegisterUser(
    email: string,
    password: string,
  ): Promise<string> {
    let user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      // User exists, validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else {
      // User does not exist, create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      user = this.userRepository.create({ email, password: hashedPassword });
      await this.userRepository.save(user);
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
