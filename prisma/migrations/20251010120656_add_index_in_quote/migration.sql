-- CreateIndex
CREATE INDEX "Quote_userId_status_idx" ON "Quote"("userId", "status");

-- CreateIndex
CREATE INDEX "Quote_userId_createdAt_idx" ON "Quote"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Quote_userId_validUntil_idx" ON "Quote"("userId", "validUntil");
