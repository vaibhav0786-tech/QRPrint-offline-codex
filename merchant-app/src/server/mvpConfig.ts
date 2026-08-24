export const MVP_LIMITS = {
  maxFilesPerJob: 5,
  maxFileSizeBytes: 25 * 1024 * 1024,
  unpaidCleanupMinutes: 30,
  metadataRetentionDays: 30,
  allowedMimeTypes: ['application/pdf'],
} as const;

export const MVP_PRICING_INR = {
  currency: 'INR',
  bwPaisePerPage: 200,
  colorPaisePerPage: 1000,
  defaultPaperSize: 'A4',
} as const;

export const CUSTOMER_COLLECTION_MESSAGE = 'Your print is ready. Show your collection PIN at the counter.';
