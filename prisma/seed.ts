import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function main() {
  const allowedEmails = (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!allowedEmails.length) {
    console.log("✓ Seed complete (no emails in ALLOWED_EMAILS)");
    return;
  }

  console.log(`Creating ${allowedEmails.length} members…`);

  for (const email of allowedEmails) {
    try {
      // Create Auth user (OTP-only, no password)
      const randomPassword = Math.random().toString(36).slice(2) + Date.now();
      const { error } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: { setup_complete: false },
      });

      if (error && error.status !== 422) {
        throw new Error(`Auth error for ${email}: ${error.message}`);
      }

      // Create or update Member entry
      await prisma.member.upsert({
        where: { email },
        create: {
          email,
          name: email.split("@")[0] || email,
        },
        update: {},
      });

      console.log(`  ✓ ${email}`);
    } catch (e) {
      console.error(`  ✗ ${email}:`, (e as Error).message);
      throw e;
    }
  }

  console.log("✓ Seed complete");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
