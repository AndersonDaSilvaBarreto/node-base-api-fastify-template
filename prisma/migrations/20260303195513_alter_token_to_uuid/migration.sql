/*
  Warnings:

  - Changed the type of `token` on the `refresh_tokens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "token",
ADD COLUMN     "token" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
