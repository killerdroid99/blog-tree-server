/*
  Warnings:

  - You are about to drop the column `upvotes` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "upvotes",
ADD COLUMN     "votes" INTEGER NOT NULL DEFAULT 0;
