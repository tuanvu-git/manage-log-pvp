-- CreateTable
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "buildStatus" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_date_productName_system_key" ON "Report"("date", "productName", "system");
