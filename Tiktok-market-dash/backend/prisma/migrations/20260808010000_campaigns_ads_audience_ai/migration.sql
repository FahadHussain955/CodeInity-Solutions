-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'UNDER_REVIEW', 'DRAFT');
CREATE TYPE "CampaignObjective" AS ENUM ('CONVERSIONS', 'TRAFFIC', 'AWARENESS');
CREATE TYPE "CreativeStatus" AS ENUM ('ACTIVE', 'PAUSED', 'UNDER_REVIEW', 'REJECTED');
CREATE TYPE "AudienceStatus" AS ENUM ('READY', 'POPULATING', 'ARCHIVED');
CREATE TYPE "AudienceType" AS ENUM ('INTEREST', 'LOOKALIKE', 'CUSTOM');

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "objective" "CampaignObjective" NOT NULL DEFAULT 'CONVERSIONS',
    "platform" TEXT NOT NULL DEFAULT 'TikTok',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "budget" DECIMAL(14,2) NOT NULL,
    "dailyBudget" DECIMAL(14,2),
    "totalSpend" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "cpc" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "cpm" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "roas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "adGroups" INTEGER NOT NULL DEFAULT 0,
    "targeting" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ad_creatives" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'In-Feed Video',
    "duration" TEXT,
    "thumbnail" TEXT,
    "caption" TEXT,
    "adGroup" TEXT,
    "reviewStatus" "CreativeStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "roas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ad_creatives_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audiences" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "audienceName" TEXT NOT NULL,
    "type" "AudienceType" NOT NULL DEFAULT 'INTEREST',
    "gender" TEXT,
    "ageRange" TEXT,
    "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedReach" TEXT,
    "reachMin" INTEGER,
    "reachMax" INTEGER,
    "status" "AudienceStatus" NOT NULL DEFAULT 'READY',
    "source" TEXT,
    "matchScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "audiences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "campaign_audiences" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "audienceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campaign_audiences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_insight_caches" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "cacheKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_insight_caches_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "campaigns_code_key" ON "campaigns"("code");
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");
CREATE INDEX "campaigns_platform_idx" ON "campaigns"("platform");
CREATE INDEX "campaigns_campaignName_idx" ON "campaigns"("campaignName");
CREATE INDEX "campaigns_createdAt_idx" ON "campaigns"("createdAt");

CREATE UNIQUE INDEX "ad_creatives_code_key" ON "ad_creatives"("code");
CREATE INDEX "ad_creatives_campaignId_idx" ON "ad_creatives"("campaignId");
CREATE INDEX "ad_creatives_reviewStatus_idx" ON "ad_creatives"("reviewStatus");
CREATE INDEX "ad_creatives_title_idx" ON "ad_creatives"("title");

CREATE UNIQUE INDEX "audiences_code_key" ON "audiences"("code");
CREATE INDEX "audiences_audienceName_idx" ON "audiences"("audienceName");
CREATE INDEX "audiences_status_idx" ON "audiences"("status");
CREATE INDEX "audiences_type_idx" ON "audiences"("type");

CREATE UNIQUE INDEX "campaign_audiences_campaignId_audienceId_key" ON "campaign_audiences"("campaignId", "audienceId");
CREATE UNIQUE INDEX "ai_insight_caches_userId_cacheKey_key" ON "ai_insight_caches"("userId", "cacheKey");
CREATE INDEX "ai_insight_caches_expiresAt_idx" ON "ai_insight_caches"("expiresAt");

ALTER TABLE "ad_creatives" ADD CONSTRAINT "ad_creatives_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_audiences" ADD CONSTRAINT "campaign_audiences_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_audiences" ADD CONSTRAINT "campaign_audiences_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "audiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_insight_caches" ADD CONSTRAINT "ai_insight_caches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
