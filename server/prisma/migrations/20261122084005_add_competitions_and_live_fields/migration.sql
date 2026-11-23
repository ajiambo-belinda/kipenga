/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "competitionId" INTEGER,
ADD COLUMN     "externalId" INTEGER,
ADD COLUMN     "kickoffAt" TIMESTAMP(3),
ADD COLUMN     "minute" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'FINISHED',
ADD COLUMN     "statusShort" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "country" TEXT,
ADD COLUMN     "externalId" INTEGER;

-- CreateTable
CREATE TABLE "Competition" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'League',
    "tier" INTEGER NOT NULL DEFAULT 3,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Competition_externalId_key" ON "Competition"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_externalId_key" ON "Match"("externalId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_competitionId_matchDate_idx" ON "Match"("competitionId", "matchDate");

-- CreateIndex
CREATE UNIQUE INDEX "Team_externalId_key" ON "Team"("externalId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
