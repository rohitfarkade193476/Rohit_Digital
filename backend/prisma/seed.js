import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import prisma from "../src/config/prisma.js";
import { registerSuperAdmin } from "../src/modules/auth/super-admin.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME?.trim() || "System";
  const lastName = process.env.SUPER_ADMIN_LAST_NAME?.trim() || "Administrator";
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in backend/.env"
    );
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Super admin already exists: ${email} (${existing.role})`);
    return;
  }

  const user = await registerSuperAdmin({ firstName, lastName, email, password });

  console.log(
    `Super admin created: ${user.firstName} ${user.lastName} <${user.email}>`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
