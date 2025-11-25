/*
  Warnings:

  - You are about to drop the column `name` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Property` table. All the data in the column will be lost.
  - Added the required column `landlordId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_ownerId_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "name",
DROP COLUMN "ownerId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "landlordId" INTEGER NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
