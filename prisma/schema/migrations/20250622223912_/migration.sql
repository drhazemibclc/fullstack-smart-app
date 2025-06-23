-- AlterTable
ALTER TABLE "session" ADD COLUMN     "deletedAt" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deletedAt" TEXT;

-- CreateTable
CREATE TABLE "rateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT,
    "count" INTEGER,
    "lastRequest" BIGINT,

    CONSTRAINT "rateLimit_pkey" PRIMARY KEY ("id")
);
