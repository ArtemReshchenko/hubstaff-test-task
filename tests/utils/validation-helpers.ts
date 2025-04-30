import { TEST_CONSTANTS } from './test-constants';

export function isValidEmail(email: string): boolean {
  return TEST_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(email);
}

export function isValidPassword(password: string): boolean {
  return TEST_CONSTANTS.VALIDATION.PASSWORD_PATTERN.test(password);
}

export function isValidName(name: string): boolean {
  return TEST_CONSTANTS.VALIDATION.NAME_PATTERN.test(name);
}

export function isValidAmount(amount: string): boolean {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && 
         numAmount >= parseFloat(TEST_CONSTANTS.PAYMENT.MIN_AMOUNT) && 
         numAmount <= parseFloat(TEST_CONSTANTS.PAYMENT.MAX_AMOUNT);
}

export function isValidRate(rate: string): boolean {
  const numRate = parseFloat(rate);
  return !isNaN(numRate) && 
         numRate >= parseFloat(TEST_CONSTANTS.PROJECT.MIN_RATE) && 
         numRate <= parseFloat(TEST_CONSTANTS.PROJECT.MAX_RATE);
}

export function validateTestData(data: {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  amount?: string;
  rate?: string;
}): string[] {
  const errors: string[] = [];

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.password && !isValidPassword(data.password)) {
    errors.push('Password must be at least 8 characters and contain both letters and numbers');
  }

  if (data.firstName && !isValidName(data.firstName)) {
    errors.push('Invalid first name format');
  }

  if (data.lastName && !isValidName(data.lastName)) {
    errors.push('Invalid last name format');
  }

  if (data.amount && !isValidAmount(data.amount)) {
    errors.push(`Amount must be between ${TEST_CONSTANTS.PAYMENT.MIN_AMOUNT} and ${TEST_CONSTANTS.PAYMENT.MAX_AMOUNT}`);
  }

  if (data.rate && !isValidRate(data.rate)) {
    errors.push(`Rate must be between ${TEST_CONSTANTS.PROJECT.MIN_RATE} and ${TEST_CONSTANTS.PROJECT.MAX_RATE}`);
  }

  return errors;
} 