import { prisma } from "@/lib/prisma/client";

const DEFAULT_REVIEW_LIMIT = 10;
const MAX_REVIEW_LIMIT = 50;

export interface ReviewSummary {
  readonly totalReviews: number;
  readonly ratedReviews: number;
  readonly averageRating: number | null;
  readonly latestReviewedAt: Date | null;
  readonly latestCreatedAt: Date | null;
}

export interface RecentReview {
  readonly id: string;
  readonly source: string | null;
  readonly externalId: string | null;
  readonly authorName: string | null;
  readonly rating: number | null;
  readonly content: string;
  readonly reviewedAt: Date | null;
  readonly createdAt: Date;
}

function normalizeLimit(limit: number): number {
  return Math.min(Math.max(limit, 1), MAX_REVIEW_LIMIT);
}

export async function getReviewSummary(): Promise<ReviewSummary> {
  const [totalReviews, ratingSummary, latestReviewed, latestCreated] =
    await Promise.all([
      prisma.review.count(),
      prisma.review.aggregate({
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      }),
      prisma.review.findFirst({
        where: {
          reviewedAt: {
            not: null,
          },
        },
        orderBy: {
          reviewedAt: "desc",
        },
        select: {
          reviewedAt: true,
        },
      }),
      prisma.review.findFirst({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

  return {
    totalReviews,
    ratedReviews: ratingSummary._count.rating,
    averageRating: ratingSummary._avg.rating,
    latestReviewedAt: latestReviewed?.reviewedAt ?? null,
    latestCreatedAt: latestCreated?.createdAt ?? null,
  };
}

export async function getRecentReviews(
  limit = DEFAULT_REVIEW_LIMIT,
): Promise<RecentReview[]> {
  return prisma.review.findMany({
    take: normalizeLimit(limit),
    orderBy: [
      {
        reviewedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      source: true,
      externalId: true,
      authorName: true,
      rating: true,
      content: true,
      reviewedAt: true,
      createdAt: true,
    },
  });
}
