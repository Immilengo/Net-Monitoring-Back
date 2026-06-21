-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('ROUTER', 'SWITCH', 'SERVER', 'FIREWALL', 'ACCESS_POINT', 'CAMERA', 'PRINTER', 'WORKSTATION', 'NAS', 'OTHER');

-- CreateEnum
CREATE TYPE "MonitoringStatus" AS ENUM ('ONLINE', 'OFFLINE', 'WARNING');

-- CreateEnum
CREATE TYPE "AlertLevel" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('HTTP', 'HTTPS', 'SSH', 'DNS', 'MYSQL', 'POSTGRESQL', 'SMTP', 'SMIME', 'FTP', 'TCP');

-- CreateTable
CREATE TABLE "sites" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "description" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "hostname" TEXT,
    "ipAddress" TEXT NOT NULL,
    "macAddress" TEXT,
    "type" "DeviceType" NOT NULL,
    "description" TEXT,
    "currentStatus" "MonitoringStatus" NOT NULL DEFAULT 'OFFLINE',
    "siteId" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_groups" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_group_items" (
    "deviceId" UUID NOT NULL,
    "groupId" UUID NOT NULL,

    CONSTRAINT "device_group_items_pkey" PRIMARY KEY ("deviceId","groupId")
);

-- CreateTable
CREATE TABLE "device_metrics" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "cpuUsage" DOUBLE PRECISION,
    "memoryUsage" DOUBLE PRECISION,
    "diskUsage" DOUBLE PRECISION,
    "networkIn" DOUBLE PRECISION,
    "networkOut" DOUBLE PRECISION,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_logs" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "status" "MonitoringStatus" NOT NULL,
    "responseTime" INTEGER,
    "packetLoss" DOUBLE PRECISION,
    "message" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitoring_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "level" "AlertLevel" NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedById" UUID,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_monitors" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "port" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_monitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_ipAddress_key" ON "devices"("ipAddress");

-- CreateIndex
CREATE INDEX "devices_siteId_idx" ON "devices"("siteId");

-- CreateIndex
CREATE INDEX "devices_currentStatus_idx" ON "devices"("currentStatus");

-- CreateIndex
CREATE INDEX "device_metrics_deviceId_idx" ON "device_metrics"("deviceId");

-- CreateIndex
CREATE INDEX "device_metrics_collectedAt_idx" ON "device_metrics"("collectedAt");

-- CreateIndex
CREATE INDEX "monitoring_logs_deviceId_idx" ON "monitoring_logs"("deviceId");

-- CreateIndex
CREATE INDEX "monitoring_logs_checkedAt_idx" ON "monitoring_logs"("checkedAt");

-- CreateIndex
CREATE INDEX "alerts_deviceId_idx" ON "alerts"("deviceId");

-- CreateIndex
CREATE INDEX "alerts_level_idx" ON "alerts"("level");

-- CreateIndex
CREATE INDEX "alerts_acknowledged_idx" ON "alerts"("acknowledged");

-- CreateIndex
CREATE INDEX "alerts_resolved_idx" ON "alerts"("resolved");

-- CreateIndex
CREATE INDEX "service_monitors_deviceId_idx" ON "service_monitors"("deviceId");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_group_items" ADD CONSTRAINT "device_group_items_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_group_items" ADD CONSTRAINT "device_group_items_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "device_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_metrics" ADD CONSTRAINT "device_metrics_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_logs" ADD CONSTRAINT "monitoring_logs_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_monitors" ADD CONSTRAINT "service_monitors_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
