-- AlterTable
ALTER TABLE "MaintenanceRequest" ADD COLUMN     "completionDate" TIMESTAMP(3),
ADD COLUMN     "contractor" TEXT,
ADD COLUMN     "photos" JSONB,
ADD COLUMN     "priority" TEXT;
