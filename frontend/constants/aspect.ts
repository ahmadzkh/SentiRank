import type { AspectLabel } from "@/types/aspect";

export const ASPECT_LABELS = [
  "audio_quality",
  "recommendation",
  "ads",
  "subscription",
  "app_performance",
  "playlist_library",
  "lyrics",
  "offline_download",
  "account_login",
  "pricing",
] as const satisfies readonly AspectLabel[];

export const ASPECT_META: Record<
  AspectLabel,
  {
    label: string;
    description: string;
    badgeClassName: string;
  }
> = {
  audio_quality: {
    label: "Audio Quality",
    description: "Sound quality, playback clarity, volume, or streaming stability.",
    badgeClassName: "bg-blue-50 text-blue-700 border-blue-200",
  },
  recommendation: {
    label: "Recommendation",
    description: "Song discovery, personalized playlists, and recommendation relevance.",
    badgeClassName: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  ads: {
    label: "Ads",
    description: "Ad frequency, placement, and interruption complaints.",
    badgeClassName: "bg-red-50 text-red-700 border-red-200",
  },
  subscription: {
    label: "Subscription",
    description: "Premium plan, renewal, payment, or membership experience.",
    badgeClassName: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  app_performance: {
    label: "App Performance",
    description: "Crash, lag, loading, battery, or general reliability issues.",
    badgeClassName: "bg-amber-50 text-amber-700 border-amber-200",
  },
  playlist_library: {
    label: "Playlist & Library",
    description: "Saved songs, playlist management, queue, and library organization.",
    badgeClassName: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  lyrics: {
    label: "Lyrics",
    description: "Lyrics availability, synchronization, and translation issues.",
    badgeClassName: "bg-violet-50 text-violet-700 border-violet-200",
  },
  offline_download: {
    label: "Offline Download",
    description: "Offline mode, downloaded songs, and storage-related playback.",
    badgeClassName: "bg-teal-50 text-teal-700 border-teal-200",
  },
  account_login: {
    label: "Account & Login",
    description: "Login, account session, profile, or authentication issues.",
    badgeClassName: "bg-slate-50 text-slate-700 border-slate-200",
  },
  pricing: {
    label: "Pricing",
    description: "Price, value perception, discounts, and affordability.",
    badgeClassName: "bg-orange-50 text-orange-700 border-orange-200",
  },
};
