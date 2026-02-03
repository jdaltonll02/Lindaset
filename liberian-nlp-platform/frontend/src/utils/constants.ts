// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
}

// User Roles
export const USER_ROLES = {
  CONTRIBUTOR: 'contributor',
  REVIEWER: 'reviewer',
  LANGUAGE_LEAD: 'language_lead',
  ADMIN: 'admin',
  SUPERUSER: 'superuser'
} as const

// Language Families
export const LANGUAGE_FAMILIES = [
  { value: 'niger_congo', label: 'Niger-Congo' },
  { value: 'mande', label: 'Mande' },
  { value: 'kru', label: 'Kru' },
  { value: 'mel', label: 'Mel' },
  { value: 'creole', label: 'Creole' }
]

// Endangerment Levels
export const ENDANGERMENT_LEVELS = [
  { value: 'safe', label: 'Safe' },
  { value: 'vulnerable', label: 'Vulnerable' },
  { value: 'definitely_endangered', label: 'Definitely Endangered' },
  { value: 'severely_endangered', label: 'Severely Endangered' },
  { value: 'critically_endangered', label: 'Critically Endangered' }
]

// Liberian Languages
export const LIBERIAN_LANGUAGES = [
  'Bassa', 'Kpelle', 'Gio', 'Mano', 'Krahn', 'Grebo',
  'Vai', 'Gola', 'Kissi', 'Gbandi', 'Loma', 'Mandingo',
  'Mende', 'Kru', 'Sapo', 'Belleh'
]

// Form Validation
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
  MAX_BIO_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 1000
}

// UI Constants
export const UI_CONSTANTS = {
  ITEMS_PER_PAGE: 20,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200
}

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  AUTH_STORAGE: 'auth-storage',
  THEME: 'theme',
  LANGUAGE_PREFERENCE: 'language-preference'
}