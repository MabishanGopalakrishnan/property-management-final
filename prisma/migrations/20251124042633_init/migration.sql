/*
  Warnings:

  - You are about to drop the column `description` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `landlordId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `bathrooms` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `bedrooms` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `rentAmount` on the `Unit` table. All the data in the column will be lost.
  - Added the required column `rent` to the `Lease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_landlordId_fkey";

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "rent" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "description",
DROP COLUMN "landlordId",
DROP COLUMN "postalCode",
DROP COLUMN "province",
DROP COLUMN "title",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "bathrooms",
DROP COLUMN "bedrooms",
DROP COLUMN "isAvailable",
DROP COLUMN "rentAmount";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
