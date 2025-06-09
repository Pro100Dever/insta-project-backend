/*
  Warnings:

  - The `entityType` column on the `Notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'COMMENT', 'REPLY', 'FOLLOW');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('POST', 'COMMENT', 'NONE');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL,
DROP COLUMN "entityType",
ADD COLUMN     "entityType" "EntityType";
