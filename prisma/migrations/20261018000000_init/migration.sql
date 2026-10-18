-- Initial Migration for Freed AI Medical Scribe (SQLite & PostgreSQL compatible)
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "clinicalTitle" TEXT NOT NULL DEFAULT 'MD',
    "role" TEXT NOT NULL DEFAULT 'admin',
    "roleAtPractice" TEXT NOT NULL DEFAULT 'Clinical staff',
    "specialty" TEXT NOT NULL DEFAULT 'Family Medicine',
    "specialtyGroup" TEXT NOT NULL DEFAULT 'Medicine',
    "practiceSize" TEXT NOT NULL DEFAULT 'Just me (solo practice)',
    "profileEhrType" TEXT NOT NULL DEFAULT 'athenahealth',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "agreedToBaa" BOOLEAN NOT NULL DEFAULT true,
    "planTier" TEXT NOT NULL DEFAULT 'premier',
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "trialEndsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalSeats" INTEGER NOT NULL DEFAULT 3,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "patientTitle" TEXT NOT NULL DEFAULT 'Patient',
    "aiDisclosureEnabled" BOOLEAN NOT NULL DEFAULT true,
    "hideEmptyHeaders" BOOLEAN NOT NULL DEFAULT false,
    "themeMode" TEXT NOT NULL DEFAULT 'light',
    "ehrAutoPush" BOOLEAN NOT NULL DEFAULT false,
    "zoomConnected" BOOLEAN NOT NULL DEFAULT false,
    "extensionInstalled" BOOLEAN NOT NULL DEFAULT true,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL DEFAULT 'Untitled Patient',
    "pronouns" TEXT NOT NULL DEFAULT '',
    "visitDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitMode" TEXT NOT NULL DEFAULT 'in-person',
    "status" TEXT NOT NULL DEFAULT 'new',
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "templateId" TEXT,
    "templateName" TEXT NOT NULL DEFAULT 'Returning Patient',
    "preChartNotes" TEXT NOT NULL DEFAULT '',
    "transcript" TEXT NOT NULL DEFAULT '',
    "oneLiner" TEXT NOT NULL DEFAULT '',
    "hpi" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "anp" TEXT NOT NULL DEFAULT '',
    "instructions" TEXT NOT NULL DEFAULT '',
    "instructionsLang" TEXT NOT NULL DEFAULT 'English',
    "codingJson" TEXT NOT NULL DEFAULT '{}',
    "lettersJson" TEXT NOT NULL DEFAULT '{}',
    "ehrPushStatus" TEXT NOT NULL DEFAULT 'not_pushed',
    "ehrPushedAt" DATETIME,
    "ehrTarget" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "templateType" TEXT NOT NULL DEFAULT 'canonical',
    "specialty" TEXT,
    "specialtyGroup" TEXT,
    "source" TEXT NOT NULL DEFAULT 'User',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "autoLearnEnabled" BOOLEAN NOT NULL DEFAULT true,
    "contentJson" TEXT NOT NULL DEFAULT '{}',
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "DotPhrase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "shortcut" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'personal',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DotPhrase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "EvidenceMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'evidence',
    "content" TEXT NOT NULL,
    "citationsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceMessage_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Clinician',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daysLeftInTrial" INTEGER NOT NULL DEFAULT 7,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "BillingInvoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planTier" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "invoiceDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BillingInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
