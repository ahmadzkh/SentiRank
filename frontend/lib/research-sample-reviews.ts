import type { AspectLabel } from "@/types/aspect";
import type { Review } from "@/types/review";
import type { ReviewSentimentLabel } from "@/types/sentiment";

export interface ResearchSentimentPredictionSample {
  id: string;
  reviewText: string;
  finalLabel: ReviewSentimentLabel;
  predictedLabel: ReviewSentimentLabel;
  confidence: number;
  probabilities: Record<ReviewSentimentLabel, number>;
}

export interface ResearchAspectSample {
  id: string;
  reviewText: string;
  sentimentLabel: ReviewSentimentLabel;
  sourceAspectLabel: string;
  aspectLabel: AspectLabel;
  confidenceLevel: "none" | "low" | "medium" | "high";
  evidenceTerms: readonly string[];
}

export const researchSampleReviews = [
  {
    id: "research-review-01",
    source: "spotify_play_store",
    userName: "Reviewer anonim",
    rating: 1,
    text: "akun ku gak bisa diakses",
    language: "id",
    reviewDate: "2026-05-13T02:16:04",
    sentimentLabel: "negative",
    aspectLabels: ["account_login"],
    isProcessed: true,
  },
  {
    id: "research-review-02",
    source: "spotify_play_store",
    userName: "Reviewer anonim",
    rating: 1,
    text: "min kok sekarang mau dengar lagu di playlist disukai cuma lirik singkat",
    language: "id",
    reviewDate: "2026-05-11T23:11:54",
    sentimentLabel: "negative",
    aspectLabels: ["playlist_library", "lyrics"],
    isProcessed: true,
  },
  {
    id: "research-review-03",
    source: "spotify_play_store",
    userName: "Reviewer anonim",
    rating: 1,
    text: "nambah kesini iklannya tambah byk parah, paket premium nya ga ada yg harian lagi, mahal",
    language: "id",
    reviewDate: "2026-05-11T23:11:34",
    sentimentLabel: "negative",
    aspectLabels: ["subscription", "pricing"],
    isProcessed: true,
  },
  {
    id: "research-review-04",
    source: "spotify_play_store",
    userName: "Reviewer anonim",
    rating: 1,
    text: "Mikir kalo ngasi iklan di apk",
    language: "id",
    reviewDate: "2026-05-11T22:50:53",
    sentimentLabel: "negative",
    aspectLabels: ["ads"],
    isProcessed: true,
  },
  {
    id: "research-review-05",
    source: "spotify_play_store",
    userName: "Reviewer anonim",
    rating: 1,
    text: "terlalu banyak iklan",
    language: "id",
    reviewDate: "2026-05-11T16:06:54",
    sentimentLabel: "negative",
    aspectLabels: ["ads"],
    isProcessed: true,
  },
  {
    id: "research-review-06",
    source: "spotify_play_store",
    userName: "Reviewer anonim",
    rating: 1,
    text: "sering ngelag padahal udah di download ulang",
    language: "id",
    reviewDate: "2026-05-11T15:49:36",
    sentimentLabel: "negative",
    aspectLabels: ["app_performance"],
    isProcessed: true,
  },
  {
    id: "research-review-07",
    source: "spotify_play_store",
    userName: "Reviewer anonim",
    rating: 3,
    text: "UI bagus, bug nya juga dikit, cuman setiap 2-4 lagu ada iklan lebih dari satu menit. Harga premium juga mahal",
    language: "id",
    reviewDate: "2026-05-09T20:06:56",
    sentimentLabel: "neutral",
    aspectLabels: ["subscription", "pricing"],
    isProcessed: true,
  },
  {
    id: "research-review-08",
    source: "spotify_play_store",
    userName: "Reviewer anonim",
    rating: 3,
    text: "aplikasinya udah bagus, tapi terlalu banyak iklan. mohon dikurangi dong iklannya",
    language: "id",
    reviewDate: "2026-05-08T05:04:29",
    sentimentLabel: "neutral",
    aspectLabels: ["ads"],
    isProcessed: true,
  },
  {
    id: "research-review-09",
    source: "spotify_play_store",
    userName: "Reviewer anonim",
    rating: 3,
    text: "saya kasih bintang 3 karna saat ingin memutar lagu di salah satu playlist tiba tiba harus premium dulu",
    language: "id",
    reviewDate: "2026-05-07T19:29:14",
    sentimentLabel: "neutral",
    aspectLabels: ["playlist_library", "subscription"],
    isProcessed: true,
  },
  {
    id: "research-review-10",
    source: "spotify_play_store",
    userName: "Reviewer anonim",
    rating: 3,
    text: "bagus lengkap lagu nya tapi makin banyak iklannya",
    language: "id",
    reviewDate: "2026-04-19T14:10:55",
    sentimentLabel: "positive",
    aspectLabels: ["ads"],
    isProcessed: true,
  },
] satisfies readonly Review[];

export const researchSentimentPredictionSamples = [
  {
    id: "sentiment-sample-01",
    reviewText: "aplikasi kebelet haji.",
    finalLabel: "negative",
    predictedLabel: "negative",
    confidence: 0.9763066,
    probabilities: {
      negative: 0.9763066,
      neutral: 0.009980418,
      positive: 0.013712922,
    },
  },
  {
    id: "sentiment-sample-02",
    reviewText: "Baru kasih nilai 3 soalnya aku baru download",
    finalLabel: "neutral",
    predictedLabel: "neutral",
    confidence: 0.9929623,
    probabilities: {
      negative: 0.005053727,
      neutral: 0.9929623,
      positive: 0.0019839953,
    },
  },
  {
    id: "sentiment-sample-03",
    reviewText: "banyak iklan tapi suka banget",
    finalLabel: "positive",
    predictedLabel: "positive",
    confidence: 0.9372249,
    probabilities: {
      negative: 0.019200524,
      neutral: 0.043574553,
      positive: 0.9372249,
    },
  },
  {
    id: "sentiment-sample-04",
    reviewText:
      "Aku tidak bisa kasih 5 bintang karena sering banget Spotify memaksa untuk premium",
    finalLabel: "positive",
    predictedLabel: "neutral",
    confidence: 0.6182778,
    probabilities: {
      negative: 0.32047546,
      neutral: 0.6182778,
      positive: 0.061246812,
    },
  },
  {
    id: "sentiment-sample-05",
    reviewText: "suara musik bagus tapi boleh jadi gak ada iklannya",
    finalLabel: "positive",
    predictedLabel: "positive",
    confidence: 0.9825013,
    probabilities: {
      negative: 0.016401427,
      neutral: 0.0010973096,
      positive: 0.9825013,
    },
  },
  {
    id: "sentiment-sample-06",
    reviewText: "Lagu tidak bisa di skip",
    finalLabel: "negative",
    predictedLabel: "negative",
    confidence: 0.95463413,
    probabilities: {
      negative: 0.95463413,
      neutral: 0.0024976206,
      positive: 0.042868223,
    },
  },
  {
    id: "sentiment-sample-07",
    reviewText: "mantappp",
    finalLabel: "positive",
    predictedLabel: "positive",
    confidence: 0.9867387,
    probabilities: {
      negative: 0.010887799,
      neutral: 0.0023735266,
      positive: 0.9867387,
    },
  },
  {
    id: "sentiment-sample-08",
    reviewText: "Fans NDX A.K.A Paling Setia Nih",
    finalLabel: "positive",
    predictedLabel: "neutral",
    confidence: 0.401603,
    probabilities: {
      negative: 0.35907385,
      neutral: 0.401603,
      positive: 0.23932321,
    },
  },
  {
    id: "sentiment-sample-09",
    reviewText: "Cukup puas untuk saat ini",
    finalLabel: "positive",
    predictedLabel: "positive",
    confidence: 0.8765388,
    probabilities: {
      negative: 0.1181835,
      neutral: 0.005277622,
      positive: 0.8765388,
    },
  },
  {
    id: "sentiment-sample-10",
    reviewText: "Kalo udah ada lirik nya aku tambahin",
    finalLabel: "neutral",
    predictedLabel: "neutral",
    confidence: 0.80857414,
    probabilities: {
      negative: 0.09672336,
      neutral: 0.80857414,
      positive: 0.09470257,
    },
  },
] satisfies readonly ResearchSentimentPredictionSample[];

export const researchAspectSampleResults = [
  {
    id: "aspect-sample-01",
    reviewText: "akun ku gak bisa diakses",
    sentimentLabel: "negative",
    sourceAspectLabel: "Account/Login",
    aspectLabel: "account_login",
    confidenceLevel: "low",
    evidenceTerms: ["akun"],
  },
  {
    id: "aspect-sample-02",
    reviewText: "min kok sekarang mau dengar lagu di playlist disukai cuma lirik singkat",
    sentimentLabel: "negative",
    sourceAspectLabel: "Features & Content",
    aspectLabel: "playlist_library",
    confidenceLevel: "high",
    evidenceTerms: ["playlist", "lirik", "lagu"],
  },
  {
    id: "aspect-sample-03",
    reviewText: "nambah kesini iklannya tambah byk parah, paket premium nya ga ada yg harian lagi, mahal",
    sentimentLabel: "negative",
    sourceAspectLabel: "Subscription & Pricing",
    aspectLabel: "subscription",
    confidenceLevel: "high",
    evidenceTerms: ["premium", "mahal", "paket"],
  },
  {
    id: "aspect-sample-04",
    reviewText: "Mikir kalo ngasi iklan di apk",
    sentimentLabel: "negative",
    sourceAspectLabel: "Ads Experience",
    aspectLabel: "ads",
    confidenceLevel: "low",
    evidenceTerms: ["iklan"],
  },
  {
    id: "aspect-sample-05",
    reviewText: "sering ngelag padahal udah di download ulang",
    sentimentLabel: "negative",
    sourceAspectLabel: "Performance & Stability",
    aspectLabel: "app_performance",
    confidenceLevel: "low",
    evidenceTerms: ["ngelag"],
  },
  {
    id: "aspect-sample-06",
    reviewText: "UI bagus, bug nya juga dikit, cuman setiap 2-4 lagu ada iklan lebih dari satu menit. Harga premium juga mahal",
    sentimentLabel: "neutral",
    sourceAspectLabel: "Subscription & Pricing",
    aspectLabel: "pricing",
    confidenceLevel: "high",
    evidenceTerms: ["premium", "mahal", "harga"],
  },
  {
    id: "aspect-sample-07",
    reviewText: "aplikasinya udah bagus, tapi terlalu banyak iklan. mohon dikurangi dong iklannya",
    sentimentLabel: "neutral",
    sourceAspectLabel: "Ads Experience",
    aspectLabel: "ads",
    confidenceLevel: "high",
    evidenceTerms: ["iklan", "terlalu banyak iklan"],
  },
  {
    id: "aspect-sample-08",
    reviewText: "saya kasih bintang 3 karna saat ingin memutar lagu di salah satu playlist tiba tiba harus premium dulu",
    sentimentLabel: "neutral",
    sourceAspectLabel: "Features & Content",
    aspectLabel: "playlist_library",
    confidenceLevel: "medium",
    evidenceTerms: ["playlist", "lagu"],
  },
  {
    id: "aspect-sample-09",
    reviewText: "bagus lengkap lagu nya tapi makin banyak iklannya",
    sentimentLabel: "positive",
    sourceAspectLabel: "Ads Experience",
    aspectLabel: "ads",
    confidenceLevel: "low",
    evidenceTerms: ["iklannya"],
  },
  {
    id: "aspect-sample-10",
    reviewText: "musik nya kurang lengkap, di pencarian suka ga ada",
    sentimentLabel: "positive",
    sourceAspectLabel: "Features & Content",
    aspectLabel: "playlist_library",
    confidenceLevel: "low",
    evidenceTerms: ["musik"],
  },
] satisfies readonly ResearchAspectSample[];
