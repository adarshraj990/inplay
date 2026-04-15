import { z } from 'zod';

export const RegisterDTOSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2).max(30),
});

export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;

export const LoginDTOSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;

export const RefreshTokenDTOSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenDTO = z.infer<typeof RefreshTokenDTOSchema>;

export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: any; // UserPublicProfile
}
