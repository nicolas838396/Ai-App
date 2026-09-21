-- CreateTable
CREATE TABLE "tts_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tts_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tts_requests_userId_createdAt_idx" ON "tts_requests"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "tts_requests" ADD CONSTRAINT "tts_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
