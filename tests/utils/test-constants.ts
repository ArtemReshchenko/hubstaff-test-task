export const TEST_CONSTANTS = {
  PAYMENT: {
    DEFAULT_AMOUNT: '0.005',
    DEFAULT_NOTE: 'Bonus payment for excellent work',
    CURRENCY: 'USD',
    MIN_AMOUNT: '0.001',
    MAX_AMOUNT: '999999.99'
  },
  PROJECT: {
    DEFAULT_DESCRIPTION: 'Test project created by automation',
    DEFAULT_RATE: '25.00',
    MIN_RATE: '0.01',
    MAX_RATE: '999.99',
    DEFAULT_CURRENCY: 'USD'
  },
  RETRY: {
    DEFAULT_ATTEMPTS: 3,
    DEFAULT_DELAY: 2000,
    LONG_DELAY: 5000
  },
  VALIDATION: {
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_PATTERN: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
    NAME_PATTERN: /^[a-zA-Z\s-']{2,50}$/
  },
  TEST_TAGS: {
    SMOKE: '@smoke',
    REGRESSION: '@regression',
    E2E: '@e2e',
    PAYMENT: '@payment',
    PROJECT: '@project',
    AUTH: '@auth'
  }
}; 