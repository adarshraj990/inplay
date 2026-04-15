import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterDTO, LoginDTO, AuthResponseDTO } from '../dtos/AuthDTOs';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { MongoUserRepository } from '../../infrastructure/repositories/UserRepository';
import { AppConfig } from '../../shared/config/AppConfig';
import { UnauthorizedError, ConflictError } from '../../shared/errors/AppError';

export class AuthService {
  private userRepository: IUserRepository;
  private config: AppConfig;

  constructor() {
    this.userRepository = new MongoUserRepository();
    this.config = AppConfig.getInstance();
  }

  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) throw new ConflictError('Email already in use');

    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) throw new ConflictError('Username already taken');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await this.userRepository.create({
      username: data.username,
      email: data.email,
      passwordHash,
      displayName: data.displayName,
    });

    return this.generateAuthResponse(user);
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');

    return this.generateAuthResponse(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDTO> {
    try {
      const decoded = jwt.verify(refreshToken, this.config.jwtRefreshSecret) as { sub: string };
      const user = await this.userRepository.findById(decoded.sub);
      if (!user) throw new UnauthorizedError('User not found');
      
      return this.generateAuthResponse(user);
    } catch (e) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  private generateAuthResponse(user: any): AuthResponseDTO {
    const accessToken = jwt.sign({ sub: user.id }, this.config.jwtSecret as string, {
      expiresIn: this.config.jwtExpiresIn as any,
    });

    const refreshToken = jwt.sign({ sub: user.id }, this.config.jwtRefreshSecret as string, {
      expiresIn: this.config.jwtRefreshExpiresIn as any,
    });

    const publicProfile = {
      id: user.id || user._id?.toString(),
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      status: user.status,
      level: user.level,
    };

    return {
      accessToken,
      refreshToken,
      user: publicProfile,
    };
  }
}
