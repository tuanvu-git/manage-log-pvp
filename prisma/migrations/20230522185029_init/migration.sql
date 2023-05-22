-- CreateTable
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "folderName" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "buildStatus" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isSumarry" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_folderName_productName_system_key" ON "Report"("folderName", "productName", "system");
