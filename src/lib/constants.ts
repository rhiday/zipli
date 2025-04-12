export const APP_CONFIG = {
  CACHE_DURATION: 60000, // 1 minute
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  RECORDING_DURATION: 60000, // 1 minute
  API_ENDPOINTS: {
    VERIFY: '/functions/v1/verify'
  },
  PHONE: {
    DEFAULT_COUNTRY: 'FI',
    TIMEOUT: 600 // 10 minutes
  },
  DONATIONS: {
    STATUS: {
      ACTIVE: 'active',
      COMPLETED: 'completed'
    }
  }
} as const;

export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB'
] as const;