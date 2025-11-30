ALTER TABLE "MaintenanceRequest" ADD COLUMN IF NOT EXISTS contractor TEXT;
ALTER TABLE "MaintenanceRequest" ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
