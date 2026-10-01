import { prisma } from "@/lib/db";

// TODO: Install resend and configure email sending
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.split(" ")[1];

  if (!secret || secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split("T")[0];

    // Idempotency check
    const existing = await prisma.digestLog.findUnique({
      where: { date: dateStr },
    });

    if (existing) {
      return new Response("Already sent", { status: 200 });
    }

    // Get all members who want daily digest
    const members = await prisma.member.findMany({
      where: { notifyDaily: true },
    });

    for (const member of members) {
      // Mock getTodayPlants for this member (would need context injection in real code)
      // For now, fetch due plants directly
      const duePlants = await prisma.plant.findMany({
        where: { archivedAt: null },
        include: { species: true, room: true },
        take: 20,
      });

      if (duePlants.length === 0) continue;

      // TODO: Uncomment when resend is installed
      // try {
      //   await resend.emails.send({
      //     from: process.env.EMAIL_FROM || "noreply@example.com",
      //     to: member.email,
      //     subject: `🌿 Arrosoir — ${duePlants.length} plante(s) aujourd'hui`,
      //     html,
      //   });
      // } catch (err) {
      //   console.error(`Failed to send digest to ${member.email}:`, err);
      // }
      console.log(`Digest for ${member.email}: ${duePlants.length} plants`);
    }

    // Log that we sent today
    await prisma.digestLog.create({
      data: { date: dateStr },
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Cron error:", err);
    return new Response("Error", { status: 500 });
  }
}
