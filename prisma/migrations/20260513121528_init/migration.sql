-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT,
    "externalId" TEXT,
    "authorName" TEXT,
    "rating" INTEGER,
    "content" TEXT NOT NULL,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SentimentAnalysisResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "runLabel" TEXT NOT NULL DEFAULT 'default',
    "label" TEXT NOT NULL,
    "confidence" REAL,
    "modelName" TEXT,
    "modelVersion" TEXT,
    "analyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SentimentAnalysisResult_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AspectClassificationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "runLabel" TEXT NOT NULL DEFAULT 'default',
    "aspect" TEXT NOT NULL,
    "confidence" REAL,
    "modelName" TEXT,
    "modelVersion" TEXT,
    "classifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AspectClassificationResult_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelEvaluationSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runLabel" TEXT NOT NULL DEFAULT 'default',
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT,
    "modelType" TEXT NOT NULL,
    "datasetSplit" TEXT,
    "accuracy" REAL,
    "precision" REAL,
    "recall" REAL,
    "f1Score" REAL,
    "notes" TEXT,
    "evaluatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InferenceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inputText" TEXT NOT NULL,
    "cleanText" TEXT,
    "taskType" TEXT NOT NULL DEFAULT 'sentiment',
    "modelUsed" TEXT NOT NULL,
    "modelVersion" TEXT,
    "predictedLabel" TEXT,
    "confidence" REAL,
    "probPositive" REAL,
    "probNeutral" REAL,
    "probNegative" REAL,
    "predictedAspect" TEXT,
    "aspectConfidence" REAL,
    "executionTimeMs" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AhpWeight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runLabel" TEXT NOT NULL DEFAULT 'default',
    "criterion" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "consistencyRatio" REAL,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FuzzyAhpWeight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runLabel" TEXT NOT NULL DEFAULT 'default',
    "criterion" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "lowerBound" REAL,
    "upperBound" REAL,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AhpRankingResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runLabel" TEXT NOT NULL DEFAULT 'default',
    "priorityArea" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FuzzyAhpRankingResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runLabel" TEXT NOT NULL DEFAULT 'default',
    "priorityArea" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RankingComparisonResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runLabel" TEXT NOT NULL DEFAULT 'default',
    "priorityArea" TEXT NOT NULL,
    "ahpScore" REAL,
    "fuzzyAhpScore" REAL,
    "ahpRank" INTEGER,
    "fuzzyAhpRank" INTEGER,
    "rankDelta" INTEGER,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Review_source_idx" ON "Review"("source");

-- CreateIndex
CREATE INDEX "Review_externalId_idx" ON "Review"("externalId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_reviewedAt_idx" ON "Review"("reviewedAt");

-- CreateIndex
CREATE INDEX "SentimentAnalysisResult_runLabel_idx" ON "SentimentAnalysisResult"("runLabel");

-- CreateIndex
CREATE INDEX "SentimentAnalysisResult_label_idx" ON "SentimentAnalysisResult"("label");

-- CreateIndex
CREATE INDEX "SentimentAnalysisResult_modelName_idx" ON "SentimentAnalysisResult"("modelName");

-- CreateIndex
CREATE UNIQUE INDEX "SentimentAnalysisResult_reviewId_runLabel_key" ON "SentimentAnalysisResult"("reviewId", "runLabel");

-- CreateIndex
CREATE INDEX "AspectClassificationResult_runLabel_idx" ON "AspectClassificationResult"("runLabel");

-- CreateIndex
CREATE INDEX "AspectClassificationResult_aspect_idx" ON "AspectClassificationResult"("aspect");

-- CreateIndex
CREATE INDEX "AspectClassificationResult_modelName_idx" ON "AspectClassificationResult"("modelName");

-- CreateIndex
CREATE UNIQUE INDEX "AspectClassificationResult_reviewId_runLabel_key" ON "AspectClassificationResult"("reviewId", "runLabel");

-- CreateIndex
CREATE INDEX "ModelEvaluationSummary_runLabel_idx" ON "ModelEvaluationSummary"("runLabel");

-- CreateIndex
CREATE INDEX "ModelEvaluationSummary_modelType_idx" ON "ModelEvaluationSummary"("modelType");

-- CreateIndex
CREATE INDEX "ModelEvaluationSummary_modelName_idx" ON "ModelEvaluationSummary"("modelName");

-- CreateIndex
CREATE INDEX "ModelEvaluationSummary_evaluatedAt_idx" ON "ModelEvaluationSummary"("evaluatedAt");

-- CreateIndex
CREATE INDEX "InferenceHistory_taskType_idx" ON "InferenceHistory"("taskType");

-- CreateIndex
CREATE INDEX "InferenceHistory_modelUsed_idx" ON "InferenceHistory"("modelUsed");

-- CreateIndex
CREATE INDEX "InferenceHistory_predictedLabel_idx" ON "InferenceHistory"("predictedLabel");

-- CreateIndex
CREATE INDEX "InferenceHistory_predictedAspect_idx" ON "InferenceHistory"("predictedAspect");

-- CreateIndex
CREATE INDEX "InferenceHistory_createdAt_idx" ON "InferenceHistory"("createdAt");

-- CreateIndex
CREATE INDEX "AhpWeight_runLabel_idx" ON "AhpWeight"("runLabel");

-- CreateIndex
CREATE INDEX "AhpWeight_criterion_idx" ON "AhpWeight"("criterion");

-- CreateIndex
CREATE UNIQUE INDEX "AhpWeight_runLabel_criterion_key" ON "AhpWeight"("runLabel", "criterion");

-- CreateIndex
CREATE INDEX "FuzzyAhpWeight_runLabel_idx" ON "FuzzyAhpWeight"("runLabel");

-- CreateIndex
CREATE INDEX "FuzzyAhpWeight_criterion_idx" ON "FuzzyAhpWeight"("criterion");

-- CreateIndex
CREATE UNIQUE INDEX "FuzzyAhpWeight_runLabel_criterion_key" ON "FuzzyAhpWeight"("runLabel", "criterion");

-- CreateIndex
CREATE INDEX "AhpRankingResult_runLabel_idx" ON "AhpRankingResult"("runLabel");

-- CreateIndex
CREATE INDEX "AhpRankingResult_rank_idx" ON "AhpRankingResult"("rank");

-- CreateIndex
CREATE INDEX "AhpRankingResult_priorityArea_idx" ON "AhpRankingResult"("priorityArea");

-- CreateIndex
CREATE UNIQUE INDEX "AhpRankingResult_runLabel_priorityArea_key" ON "AhpRankingResult"("runLabel", "priorityArea");

-- CreateIndex
CREATE UNIQUE INDEX "AhpRankingResult_runLabel_rank_key" ON "AhpRankingResult"("runLabel", "rank");

-- CreateIndex
CREATE INDEX "FuzzyAhpRankingResult_runLabel_idx" ON "FuzzyAhpRankingResult"("runLabel");

-- CreateIndex
CREATE INDEX "FuzzyAhpRankingResult_rank_idx" ON "FuzzyAhpRankingResult"("rank");

-- CreateIndex
CREATE INDEX "FuzzyAhpRankingResult_priorityArea_idx" ON "FuzzyAhpRankingResult"("priorityArea");

-- CreateIndex
CREATE UNIQUE INDEX "FuzzyAhpRankingResult_runLabel_priorityArea_key" ON "FuzzyAhpRankingResult"("runLabel", "priorityArea");

-- CreateIndex
CREATE UNIQUE INDEX "FuzzyAhpRankingResult_runLabel_rank_key" ON "FuzzyAhpRankingResult"("runLabel", "rank");

-- CreateIndex
CREATE INDEX "RankingComparisonResult_runLabel_idx" ON "RankingComparisonResult"("runLabel");

-- CreateIndex
CREATE INDEX "RankingComparisonResult_priorityArea_idx" ON "RankingComparisonResult"("priorityArea");

-- CreateIndex
CREATE INDEX "RankingComparisonResult_ahpRank_idx" ON "RankingComparisonResult"("ahpRank");

-- CreateIndex
CREATE INDEX "RankingComparisonResult_fuzzyAhpRank_idx" ON "RankingComparisonResult"("fuzzyAhpRank");

-- CreateIndex
CREATE UNIQUE INDEX "RankingComparisonResult_runLabel_priorityArea_key" ON "RankingComparisonResult"("runLabel", "priorityArea");
