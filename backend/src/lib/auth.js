import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";

import prisma from "../config/prisma.js";
import { env } from "../config/env.js";
import { sendPasswordSetupEmail } from "./mailer.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 60 * 60 * 72,
    sendResetPassword: async ({ user, token }) => {
      const activationUrl = `${env.FRONTEND_URL}/activate-account?token=${token}`;

      try {
        await sendPasswordSetupEmail({
          email: user.email,
          name: user.name,
          activationUrl,
        });
      } catch (error) {
        console.error(
          `Failed to send password setup email to ${user.email}:`,
          error
        );
      }
    },
    onPasswordReset: async ({ user }) => {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
      } catch (error) {
        console.error(
          `Failed to mark email as verified after password reset for user ${user.id}:`,
          error
        );
      }
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 5,
    },
  },

  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: true,
      },
      societyId: {
        type: "string",
        required: false,
      },
      image: {
        type: "string",
        required: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
    },
  },

  trustedOrigins: [
    env.FRONTEND_URL,
  ],
});
