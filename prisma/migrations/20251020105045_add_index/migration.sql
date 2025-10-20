-- CreateIndex
CREATE INDEX "GlassType_name_idx" ON "GlassType"("name");

-- CreateIndex
CREATE INDEX "GlassType_purpose_idx" ON "GlassType"("purpose");

-- CreateIndex
CREATE INDEX "GlassType_createdAt_idx" ON "GlassType"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "GlassType_updatedAt_idx" ON "GlassType"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Model_name_idx" ON "Model"("name");

-- CreateIndex
CREATE INDEX "Model_status_idx" ON "Model"("status");

-- CreateIndex
CREATE INDEX "Model_createdAt_idx" ON "Model"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Model_updatedAt_idx" ON "Model"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Quote_projectName_idx" ON "Quote"("projectName");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt" DESC);
