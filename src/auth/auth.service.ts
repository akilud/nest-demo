import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { SignUpDto, SignInDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: signUpDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

    // Create user
    const user = this.userRepository.create({
      name: signUpDto.name,
      email: signUpDto.email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async signIn(signInDto: SignInDto) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(signInDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async validateUser(userId: number) {
    return this.userRepository.findOne({
      where: { id: userId }
    });
  }
}
