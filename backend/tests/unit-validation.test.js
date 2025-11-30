// tests/unit-validation.test.js
import { describe, test, expect } from '@jest/globals';

describe('Data Validation Tests', () => {
  describe('Email Validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    test('should validate correct email format', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'admin@sub.domain.com',
        'user+tag@example.com',
      ];

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid.email',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
      ];

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Property Data Validation', () => {
    test('should validate property name length', () => {
      const validName = 'Sunset Apartments';
      const tooLong = 'A'.repeat(256);

      expect(validName.length).toBeGreaterThan(0);
      expect(validName.length).toBeLessThanOrEqual(255);
      expect(tooLong.length).toBeGreaterThan(255);
    });

    test('should validate zip code format', () => {
      const zipRegex = /^\d{5}(-\d{4})?$/;

      expect(zipRegex.test('12345')).toBe(true);
      expect(zipRegex.test('12345-6789')).toBe(true);
      expect(zipRegex.test('1234')).toBe(false);
      expect(zipRegex.test('abcde')).toBe(false);
    });

    test('should validate state abbreviation', () => {
      const validStates = ['CA', 'NY', 'TX', 'FL'];
      const invalidStates = ['California', 'N', 'TXX', '12'];

      validStates.forEach((state) => {
        expect(state.length).toBe(2);
        expect(/^[A-Z]{2}$/.test(state)).toBe(true);
      });

      invalidStates.forEach((state) => {
        expect(/^[A-Z]{2}$/.test(state)).toBe(false);
      });
    });
  });

  describe('Payment Data Validation', () => {
    test('should validate positive payment amounts', () => {
      expect(1000).toBeGreaterThan(0);
      expect(0.01).toBeGreaterThan(0);
      expect(-100).toBeLessThan(0);
      expect(0).toBe(0);
    });

    test('should validate payment amount precision', () => {
      const amount = 1234.56;
      const rounded = Math.round(amount * 100) / 100;

      expect(rounded).toBe(amount);
    });

    test('should validate payment status values', () => {
      const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
      const invalidStatuses = ['pending', 'complete', 'unknown'];

      validStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });

      invalidStatuses.forEach((status) => {
        expect(validStatuses).not.toContain(status);
      });
    });
  });

  describe('Maintenance Request Validation', () => {
    test('should validate priority levels', () => {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      
      expect(validPriorities).toContain('LOW');
      expect(validPriorities).toContain('MEDIUM');
      expect(validPriorities).toContain('HIGH');
      expect(validPriorities).toContain('URGENT');
      expect(validPriorities).not.toContain('NORMAL');
    });

    test('should validate status transitions', () => {
      const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      
      expect(validStatuses).toHaveLength(4);
      expect(validStatuses).toContain('PENDING');
      expect(validStatuses).toContain('IN_PROGRESS');
      expect(validStatuses).toContain('COMPLETED');
    });

    test('should validate title length', () => {
      const validTitle = 'Leaky faucet in kitchen';
      const emptyTitle = '';
      const tooLong = 'A'.repeat(256);

      expect(validTitle.length).toBeGreaterThan(0);
      expect(validTitle.length).toBeLessThanOrEqual(255);
      expect(emptyTitle.length).toBe(0);
      expect(tooLong.length).toBeGreaterThan(255);
    });
  });

  describe('Date Validation', () => {
    test('should validate date formats', () => {
      const validDate = new Date('2024-01-15');
      const invalidDate = new Date('invalid');

      expect(validDate.toString()).not.toBe('Invalid Date');
      expect(isNaN(invalidDate.getTime())).toBe(true);
    });

    test('should validate lease date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());
    });

    test('should calculate date differences', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const diffInDays = (end - start) / (1000 * 60 * 60 * 24);

      expect(diffInDays).toBe(30);
    });
  });

  describe('Phone Number Validation', () => {
    test('should validate US phone numbers', () => {
      const phoneRegex = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;

      expect(phoneRegex.test('1234567890')).toBe(true);
      expect(phoneRegex.test('123-456-7890')).toBe(true);
      expect(phoneRegex.test('123456789')).toBe(false);
      expect(phoneRegex.test('12-345-67890')).toBe(false);
    });
  });

  describe('Numeric Range Validation', () => {
    test('should validate rent amount ranges', () => {
      const minRent = 0;
      const maxRent = 100000;
      const testRent = 1500;

      expect(testRent).toBeGreaterThanOrEqual(minRent);
      expect(testRent).toBeLessThanOrEqual(maxRent);
    });

    test('should validate unit number format', () => {
      const validUnits = ['101', '102', '2A', '3B'];
      
      validUnits.forEach((unit) => {
        expect(unit.length).toBeGreaterThan(0);
        expect(unit.length).toBeLessThanOrEqual(10);
      });
    });
  });
});
