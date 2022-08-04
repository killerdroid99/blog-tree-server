/*
  Warnings:

  - You are about to drop the column `voted` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `votes` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "voted",
DROP COLUMN "votes";

-- CreateTable
CREATE TABLE "Votes" (
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "voted" BOOLEAN NOT NULL DEFAULT false,
    "postId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("postId","voterId")
);

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
