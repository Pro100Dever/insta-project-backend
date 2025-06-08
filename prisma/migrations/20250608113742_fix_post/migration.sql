/*
  Warnings:

  - Made the column `mediaUrl` on table `posts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "mediaUrl" SET NOT NULL,
ALTER COLUMN "text" DROP NOT NULL;
