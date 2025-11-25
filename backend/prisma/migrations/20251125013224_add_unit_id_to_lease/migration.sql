/*
  Warnings:

  - The `status` column on the `Lease` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `rent` on the `Lease` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "rent" DROP NOT NULL,
ALTER COLUMN "rent" SET DATA TYPE INTEGER;
