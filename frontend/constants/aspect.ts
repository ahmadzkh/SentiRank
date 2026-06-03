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
    label: "Kualitas Audio",
    description: "Kualitas suara, kejernihan playback, volume, atau stabilitas streaming.",
    badgeClassName: "bg-blue-50 text-blue-700 border-blue-200",
  },
  recommendation: {
    label: "Rekomendasi",
    description: "Penemuan lagu, playlist personal, dan relevansi rekomendasi.",
    badgeClassName: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  ads: {
    label: "Iklan",
    description: "Frekuensi iklan, penempatan, dan keluhan gangguan iklan.",
    badgeClassName: "bg-red-50 text-red-700 border-red-200",
  },
  subscription: {
    label: "Langganan",
    description: "Paket Premium, perpanjangan, pembayaran, atau pengalaman keanggotaan.",
    badgeClassName: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  app_performance: {
    label: "Performa Aplikasi",
    description: "Crash, lag, loading, baterai, atau masalah reliabilitas umum.",
    badgeClassName: "bg-amber-50 text-amber-700 border-amber-200",
  },
  playlist_library: {
    label: "Playlist & Pustaka",
    description: "Lagu tersimpan, pengelolaan playlist, antrean, dan organisasi pustaka.",
    badgeClassName: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  lyrics: {
    label: "Lirik",
    description: "Ketersediaan lirik, sinkronisasi, dan masalah terjemahan.",
    badgeClassName: "bg-violet-50 text-violet-700 border-violet-200",
  },
  offline_download: {
    label: "Unduhan Offline",
    description: "Mode offline, lagu terunduh, dan playback terkait penyimpanan.",
    badgeClassName: "bg-teal-50 text-teal-700 border-teal-200",
  },
  account_login: {
    label: "Akun & Login",
    description: "Login, sesi akun, profil, atau masalah autentikasi.",
    badgeClassName: "bg-slate-50 text-slate-700 border-slate-200",
  },
  pricing: {
    label: "Harga",
    description: "Harga, persepsi nilai, diskon, dan keterjangkauan.",
    badgeClassName: "bg-orange-50 text-orange-700 border-orange-200",
  },
};
