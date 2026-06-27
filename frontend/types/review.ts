import type { AspectLabel } from "./aspect";
import type { ReviewSentimentLabel } from "./sentiment";

export interface Review {
  id: string;
  source: "spotify_play_store" | "spotify_app_store" | "manual_sample";
  userName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  wordCount?: number;
  cleanedText?: string;
  language: "id" | "en" | "mixed";
  reviewDate: string;
  appVersion?: string;
  thumbsUpCount?: number;
  sentimentLabel?: ReviewSentimentLabel;
  sentimentConfidence?: number;
  aspectLabels?: AspectLabel[];
  isProcessed: boolean;
}
