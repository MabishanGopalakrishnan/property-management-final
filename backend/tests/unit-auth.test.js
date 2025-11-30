// tests/unit-auth.test.js
import { describe, test, expect } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authentication Unit Tests', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
      expect(await bcrypt.compare(password, hash)).toBe(true);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'samePassword';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      expect(hash1).not.toBe(hash2);
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'correctPassword';
      const hash = await bcrypt.hash(password, 10);

      expect(await bcrypt.compare('wrongPassword', hash)).toBe(false);
    });

    test('should handle special characters in password', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await bcrypt.hash(password, 10);

      expect(await bcrypt.compare(password, hash)).toBe(true);
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate valid JWT token', () => {
      const payload = { id: 1, role: 'LANDLORD', email: 'test@test.com' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('should correctly decode JWT token', () => {
      const payload = { id: 1, role: 'LANDLORD', email: 'test@test.com' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.id).toBe(1);
      expect(decoded.role).toBe('LANDLORD');
      expect(decoded.email).toBe('test@test.com');
    });

    test('should include expiration in token', () => {
      const payload = { id: 1, role: 'TENANT' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    test('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });

    test('should reject token with wrong secret', () => {
      const payload = { id: 1, role: 'LANDLORD' };
      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '7d' });

      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow();
    });
  });

  describe('Role-based Tokens', () => {
    test('should create token for LANDLORD role', () => {
      const payload = { id: 1, role: 'LANDLORD' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.role).toBe('LANDLORD');
    });

    test('should create token for TENANT role', () => {
      const payload = { id: 2, role: 'TENANT' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.role).toBe('TENANT');
    });

    test('should preserve all payload data', () => {
      const payload = {
        id: 1,
        role: 'LANDLORD',
        email: 'test@test.com',
        name: 'Test User',
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.id).toBe(1);
      expect(decoded.role).toBe('LANDLORD');
      expect(decoded.email).toBe('test@test.com');
      expect(decoded.name).toBe('Test User');
    });
  });
});
