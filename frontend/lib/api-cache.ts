export const STATIC_DATA_REVALIDATE_SECONDS = 300;

export const STATIC_DATA_REQUEST = {
  next: { revalidate: STATIC_DATA_REVALIDATE_SECONDS },
} as const;
