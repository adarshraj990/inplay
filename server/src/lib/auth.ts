import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { dash } from "@better-auth/infra";
import { admin } from "better-auth/plugins";
import { DatabaseService } from "../infrastructure/database/DatabaseService.js";
import { AppConfig } from "../shared/config/AppConfig.js";
import { prisma } from "../infrastructure/database/prisma.js";

const config = AppConfig.getInstance();

// We use the central Prisma singleton to prevent connection pool exhaustion.

const resend = new Resend(config.resendApiKey);

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET || config.betterAuthSecret,
    baseURL: config.betterAuthUrl || 'https://indplay-backend-v3-ac9j.onrender.com/api/auth/',
    trustedOrigins: [
        'https://inplay-gamma.vercel.app',
        'http://localhost:3001',
        'http://localhost:5173', // Common Vite port
    ],
    emailAndPassword: {
        enabled: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            const { error } = await resend.emails.send({
                from: "Indplay <auth@indplay.social>",
                to: user.email,
                subject: "Verify your Email Address",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #6200ee;">Welcome to Indplay!</h2>
                        <p>Verify your email to start gaming with friends.</p>
                        <a href="${url}" style="display: inline-block; background: #6200ee; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Verify Email</a>
                        <p style="margin-top: 20px; font-size: 0.8em; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                `,
            });
            if (error) console.error("Resend Verification Email Error:", error);
        },
    },
    // Adding forgot password support
    emailAndPasswordOptions: {
        sendForgotPasswordEmail: async ({ user, url }) => {
            const { error } = await resend.emails.send({
                from: "Indplay Support <support@indplay.social>",
                to: user.email,
                subject: "Reset your Password",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #6200ee;">Reset Password</h2>
                        <p>Click the button below to reset your Indplay account password.</p>
                        <a href="${url}" style="display: inline-block; background: #6200ee; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
                        <p style="margin-top: 20px; font-size: 0.8em; color: #666;">This link will expire in 1 hour.</p>
                    </div>
                `,
            });
            if (error) console.error("Resend Forgot Password Email Error:", error);
        },
    },
    plugins: [
        admin(),
        dash({
            apiKey: process.env.BETTER_AUTH_API_KEY || config.betterAuthApiKey
        }),
    ],
});
