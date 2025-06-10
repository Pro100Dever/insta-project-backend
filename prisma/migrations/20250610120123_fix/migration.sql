/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `fromUserId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `toUserId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `chatId` on the `chat_participants` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `chatId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `mediaUrl` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExp` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,chat_id]` on the table `chat_participants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,post_id]` on the table `likes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `from_user_id` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_user_id` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chat_id` to the `chat_participants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chat_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `media_url` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_toUserId_fkey";

-- DropForeignKey
ALTER TABLE "chat_participants" DROP CONSTRAINT "chat_participants_chatId_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_chatId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropIndex
DROP INDEX "Notification_toUserId_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_toUserId_isRead_idx";

-- DropIndex
DROP INDEX "chat_participants_userId_chatId_key";

-- DropIndex
DROP INDEX "likes_user_id_post_id_key";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "createdAt",
DROP COLUMN "entityId",
DROP COLUMN "entityType",
DROP COLUMN "fromUserId",
DROP COLUMN "isRead",
DROP COLUMN "toUserId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "entity_id" TEXT,
ADD COLUMN     "entity_type" "EntityType",
ADD COLUMN     "from_user_id" TEXT NOT NULL,
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "to_user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "chat_participants" DROP COLUMN "chatId",
ADD COLUMN     "chat_id" TEXT NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_message_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "user_id",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "chatId",
DROP COLUMN "createdAt",
DROP COLUMN "isRead",
DROP COLUMN "senderId",
ADD COLUMN     "chat_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sender_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "mediaUrl",
ADD COLUMN     "media_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExp",
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_exp" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Notification_to_user_id_is_read_idx" ON "Notification"("to_user_id", "is_read");

-- CreateIndex
CREATE INDEX "Notification_to_user_id_created_at_idx" ON "Notification"("to_user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_userId_chat_id_key" ON "chat_participants"("userId", "chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_userId_post_id_key" ON "likes"("userId", "post_id");

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
