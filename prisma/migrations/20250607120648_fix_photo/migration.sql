-- AlterTable
ALTER TABLE "likes" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExp" TIMESTAMP(3);
