/*
  Warnings:

  - You are about to alter the column `message` on the `Notification` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `scammerUsername` on the `ScamReport` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `platform` on the `ScamReport` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `scamType` on the `ScamReport` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The `status` column on the `ScamReport` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `username` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `firebaseUid` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `voteType` on the `Vote` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- CreateEnum
CREATE TYPE "ScamStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_reportId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_userId_fkey";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "message" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "ScamReport" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT,
ALTER COLUMN "scammerUsername" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "platform" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "scamType" SET DATA TYPE VARCHAR(100),
DROP COLUMN "status",
ADD COLUMN     "status" "ScamStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "firebaseUid" SET DATA TYPE VARCHAR(255),
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "Vote" ALTER COLUMN "voteType" SET DATA TYPE VARCHAR(50);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "ScamReport_scammerUsername_idx" ON "ScamReport"("scammerUsername");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ScamReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
