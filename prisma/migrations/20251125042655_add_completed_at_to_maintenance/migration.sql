/*
  Warnings:

  - The `status` column on the `Lease` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `completionDate` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `contractor` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `photos` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - The `priority` column on the `MaintenanceRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "status",
ADD COLUMN     "status" "LeaseStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "MaintenanceRequest" DROP COLUMN "completionDate",
DROP COLUMN "contractor",
DROP COLUMN "photos",
ADD COLUMN     "completedAt" TIMESTAMP(3),
DROP COLUMN "priority",
ADD COLUMN     "priority" "MaintenancePriority" NOT NULL DEFAULT 'MEDIUM';
