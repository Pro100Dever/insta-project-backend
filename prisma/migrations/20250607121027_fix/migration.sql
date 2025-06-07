/*
  Warnings:

  - You are about to drop the column `resetToken` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExp` on the `likes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "likes" DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExp";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExp" TIMESTAMP(3);
