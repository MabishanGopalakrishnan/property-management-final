// tests/unit-utils.test.js
import { describe, test, expect } from '@jest/globals';

describe('Utility Functions Tests', () => {
  describe('String Utilities', () => {
    test('should capitalize first letter', () => {
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
      expect(capitalize('a')).toBe('A');
    });

    test('should trim whitespace', () => {
      expect('  hello  '.trim()).toBe('hello');
      expect('\n\ttest\n\t'.trim()).toBe('test');
      expect('   '.trim()).toBe('');
    });

    test('should format property address', () => {
      const formatAddress = (address, city, state, zip) => {
        return `${address}, ${city}, ${state} ${zip}`;
      };

      const result = formatAddress('123 Main St', 'Boston', 'MA', '02101');
      expect(result).toBe('123 Main St, Boston, MA 02101');
    });
  });

  describe('Number Utilities', () => {
    test('should format currency', () => {
      const formatCurrency = (amount) => {
        return `$${amount.toFixed(2)}`;
      };

      expect(formatCurrency(1000)).toBe('$1000.00');
      expect(formatCurrency(1234.56)).toBe('$1234.56');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    test('should calculate percentage', () => {
      const calcPercentage = (value, total) => {
        return ((value / total) * 100).toFixed(2);
      };

      expect(calcPercentage(25, 100)).toBe('25.00');
      expect(calcPercentage(1, 3)).toBe('33.33');
      expect(calcPercentage(50, 200)).toBe('25.00');
    });

    test('should round to decimal places', () => {
      const round = (num, decimals) => {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
      };

      expect(round(1.2345, 2)).toBe(1.23);
      expect(round(9.999, 2)).toBe(10);
      expect(round(5.5, 0)).toBe(6);
    });
  });

  describe('Date Utilities', () => {
    test('should format date to YYYY-MM-DD', () => {
      const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const date = new Date('2024-01-15T00:00:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    test('should calculate days between dates', () => {
      const daysBetween = (date1, date2) => {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date1 - date2) / oneDay));
      };

      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      expect(daysBetween(start, end)).toBe(30);
    });

    test('should check if date is in past', () => {
      const isInPast = (date) => {
        return new Date(date) < new Date();
      };

      const pastDate = new Date('2020-01-01');
      const futureDate = new Date('2030-01-01');

      expect(isInPast(pastDate)).toBe(true);
      expect(isInPast(futureDate)).toBe(false);
    });
  });

  describe('Array Utilities', () => {
    test('should remove duplicates', () => {
      const removeDuplicates = (arr) => [...new Set(arr)];

      expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(removeDuplicates(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });

    test('should sort by property', () => {
      const properties = [
        { name: 'Charlie', rent: 1500 },
        { name: 'Alice', rent: 1000 },
        { name: 'Bob', rent: 1200 },
      ];

      const sortedByName = [...properties].sort((a, b) => a.name.localeCompare(b.name));
      expect(sortedByName[0].name).toBe('Alice');
      expect(sortedByName[2].name).toBe('Charlie');

      const sortedByRent = [...properties].sort((a, b) => a.rent - b.rent);
      expect(sortedByRent[0].rent).toBe(1000);
      expect(sortedByRent[2].rent).toBe(1500);
    });

    test('should filter by condition', () => {
      const payments = [
        { status: 'COMPLETED', amount: 1000 },
        { status: 'PENDING', amount: 500 },
        { status: 'COMPLETED', amount: 1500 },
      ];

      const completed = payments.filter((p) => p.status === 'COMPLETED');
      expect(completed).toHaveLength(2);
      expect(completed[0].amount).toBe(1000);
    });
  });

  describe('Object Utilities', () => {
    test('should merge objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const merged = { ...obj1, ...obj2 };

      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
    });

    test('should pick specific properties', () => {
      const pick = (obj, keys) => {
        return keys.reduce((acc, key) => {
          if (obj.hasOwnProperty(key)) {
            acc[key] = obj[key];
          }
          return acc;
        }, {});
      };

      const user = { id: 1, name: 'John', email: 'john@test.com', password: 'secret' };
      const safe = pick(user, ['id', 'name', 'email']);

      expect(safe).toEqual({ id: 1, name: 'John', email: 'john@test.com' });
      expect(safe).not.toHaveProperty('password');
    });

    test('should check if object is empty', () => {
      const isEmpty = (obj) => Object.keys(obj).length === 0;

      expect(isEmpty({})).toBe(true);
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('Status Utilities', () => {
    test('should determine payment status color', () => {
      const getStatusColor = (status) => {
        const colors = {
          COMPLETED: 'green',
          PENDING: 'yellow',
          FAILED: 'red',
          REFUNDED: 'gray',
        };
        return colors[status] || 'gray';
      };

      expect(getStatusColor('COMPLETED')).toBe('green');
      expect(getStatusColor('PENDING')).toBe('yellow');
      expect(getStatusColor('FAILED')).toBe('red');
      expect(getStatusColor('UNKNOWN')).toBe('gray');
    });

    test('should determine priority badge', () => {
      const getPriorityBadge = (priority) => {
        const badges = {
          URGENT: 'danger',
          HIGH: 'warning',
          MEDIUM: 'info',
          LOW: 'secondary',
        };
        return badges[priority] || 'secondary';
      };

      expect(getPriorityBadge('URGENT')).toBe('danger');
      expect(getPriorityBadge('HIGH')).toBe('warning');
      expect(getPriorityBadge('MEDIUM')).toBe('info');
      expect(getPriorityBadge('LOW')).toBe('secondary');
    });
  });
});
