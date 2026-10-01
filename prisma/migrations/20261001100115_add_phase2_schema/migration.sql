-- CreateEnum
CREATE TYPE "LightLevel" AS ENUM ('LOW', 'MEDIUM', 'BRIGHT', 'DIRECT_SUN');

-- CreateEnum
CREATE TYPE "Humidity" AS ENUM ('DRY', 'NORMAL', 'HUMID');

-- CreateEnum
CREATE TYPE "PotMaterial" AS ENUM ('PLASTIC', 'TERRACOTTA', 'GLAZED_CERAMIC', 'OTHER');

-- CreateEnum
CREATE TYPE "WaterNeed" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "CareType" AS ENUM ('WATER', 'SKIP', 'FERTILIZE', 'REPOT');

-- CreateEnum
CREATE TYPE "PhotoKind" AS ENUM ('PROFILE', 'PROGRESS', 'DIAGNOSIS');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('AI', 'MANUAL');

-- CreateEnum
CREATE TYPE "AiKind" AS ENUM ('PROFILE', 'DIAGNOSIS');

-- CreateEnum
CREATE TYPE "ReadingSource" AS ENUM ('WEBHOOK', 'POLL');

-- CreateEnum
CREATE TYPE "AlertKind" AS ENUM ('COLD', 'HEAT');

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "light" "LightLevel" NOT NULL DEFAULT 'MEDIUM',
    "humidity" "Humidity" NOT NULL DEFAULT 'NORMAL',
    "tempSummer" DOUBLE PRECISION NOT NULL DEFAULT 22,
    "tempWinter" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "nearHeater" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT,
    "aliases" TEXT[],
    "waterNeed" "WaterNeed" NOT NULL,
    "intervalSpring" INTEGER NOT NULL,
    "intervalSummer" INTEGER NOT NULL,
    "intervalAutumn" INTEGER NOT NULL,
    "intervalWinter" INTEGER NOT NULL,
    "minTemp" DOUBLE PRECISION,
    "lightPref" "LightLevel" NOT NULL,
    "humidityPref" "Humidity" NOT NULL,
    "winterRest" BOOLEAN NOT NULL DEFAULT false,
    "care" JSONB NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'AI',
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "speciesId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "potDiameterCm" INTEGER,
    "potMaterial" "PotMaterial" NOT NULL DEFAULT 'PLASTIC',
    "intervalAdjust" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "intervalOverride" INTEGER,
    "acquiredAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "coverPhotoPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareEvent" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "CareType" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "CareEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "kind" "PhotoKind" NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosisId" TEXT,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "symptoms" TEXT[],
    "description" TEXT,
    "result" JSONB NOT NULL,
    "suggestedAdjust" DOUBLE PRECISION,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsage" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "kind" "AiKind" NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigestLog" (
    "date" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigestLog_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'switchbot',
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roomId" TEXT,
    "battery" INTEGER,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "source" "ReadingSource" NOT NULL,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertLog" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "kind" "AlertKind" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Species_scientificName_key" ON "Species"("scientificName");

-- CreateIndex
CREATE INDEX "CareEvent_plantId_at_idx" ON "CareEvent"("plantId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_externalId_key" ON "Sensor"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_roomId_key" ON "Sensor"("roomId");

-- CreateIndex
CREATE INDEX "SensorReading_sensorId_at_idx" ON "SensorReading"("sensorId", "at");

-- CreateIndex
CREATE INDEX "AlertLog_roomId_kind_sentAt_idx" ON "AlertLog"("roomId", "kind", "sentAt");

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareEvent" ADD CONSTRAINT "CareEvent_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareEvent" ADD CONSTRAINT "CareEvent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "Diagnosis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
