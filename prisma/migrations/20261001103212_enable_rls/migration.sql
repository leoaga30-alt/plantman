-- Enable Row Level Security on all tables
-- No policies: only Prisma (server-side) can access data via service_role key

ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
