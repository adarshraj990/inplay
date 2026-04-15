import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '../../domain/repositories/IUserRepository';
import { User, UserPublicProfile } from '../../domain/entities/User';
import { UserModel } from '../database/schemas/UserSchema';

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return UserModel.findById(id).lean() as Promise<User | null>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email }).lean() as Promise<User | null>;
  }

  async findByUsername(username: string): Promise<User | null> {
    return UserModel.findOne({ username }).lean() as Promise<User | null>;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const user = new UserModel(data);
    await user.save();
    return user.toJSON() as User;
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!user) throw new Error('User not found');
    return user as User;
  }

  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  async searchByUsername(query: string, limit = 20): Promise<UserPublicProfile[]> {
    const users = await UserModel.find({ username: new RegExp(query, 'i') })
      .select('id username displayName avatarUrl bio status level')
      .limit(limit)
      .lean();
    
    return users.map(u => {
      const publicProfile: any = { ...u, id: (u as any)._id.toString() };
      delete publicProfile._id;
      return publicProfile as UserPublicProfile;
    });
  }

  async addXp(id: string, amount: number): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $inc: { xp: amount } },
      { new: true }
    ).lean();
    if (!user) throw new Error('User not found');
    return user as User;
  }
}
