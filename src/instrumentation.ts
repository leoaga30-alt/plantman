// Runs once when the Next.js server starts.
export async function register() {
  // Node only: the scheduler needs Prisma, which cannot run in the edge runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startDigestScheduler } = await import("@/lib/digest-scheduler");
    startDigestScheduler();
  }
}
