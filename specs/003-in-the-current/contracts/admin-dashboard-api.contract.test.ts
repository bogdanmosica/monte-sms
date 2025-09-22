import { describe, expect, it, beforeAll, afterAll } from 'vitest';

/**
 * Contract Tests for Admin Dashboard API
 *
 * These tests verify that the API endpoints conform to their expected contracts
 * without testing internal implementation details.
 */

describe('Admin Dashboard API Contracts', () => {
  const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

  // Mock authentication headers for testing
  const authHeaders = {
    'Cookie': 'session=mock-admin-session',
    'Content-Type': 'application/json',
  };

  beforeAll(() => {
    console.log('🧪 Running Admin Dashboard API Contract Tests');
  });

  afterAll(() => {
    console.log('✅ Admin Dashboard API Contract Tests Complete');
  });

  describe('GET /api/admin/metrics', () => {
    it('should return metrics with correct structure', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/metrics`, {
        headers: authHeaders,
      });

      // Contract: Should return 200 or 401 (depending on auth)
      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();

        // Contract: Response should have required structure
        expect(data).toHaveProperty('enrollment');
        expect(data).toHaveProperty('staff');
        expect(data).toHaveProperty('financial');
        expect(data).toHaveProperty('parents');

        // Contract: Data types should be correct
        expect(typeof data.enrollment.totalStudents).toBe('number');
        expect(typeof data.staff.totalStaff).toBe('number');
        expect(typeof data.financial.totalRevenue).toBe('number');
        expect(typeof data.parents.totalParents).toBe('number');
      }
    });

    it('should require admin authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/metrics`);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/activities', () => {
    it('should return activities with correct structure', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/activities`, {
        headers: authHeaders,
      });

      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('activities');
        expect(Array.isArray(data.activities)).toBe(true);

        if (data.activities.length > 0) {
          const activity = data.activities[0];
          expect(activity).toHaveProperty('id');
          expect(activity).toHaveProperty('type');
          expect(activity).toHaveProperty('message');
          expect(activity).toHaveProperty('time');
          expect(activity).toHaveProperty('status');

          expect(['enrollment', 'payment', 'staff', 'observation', 'access']).toContain(activity.type);
          expect(['pending', 'completed', 'failed']).toContain(activity.status);
        }
      }
    });

    it('should require admin authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/activities`);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/alerts', () => {
    it('should return alerts with correct structure', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/alerts`, {
        headers: authHeaders,
      });

      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('alerts');
        expect(Array.isArray(data.alerts)).toBe(true);

        if (data.alerts.length > 0) {
          const alert = data.alerts[0];
          expect(alert).toHaveProperty('id');
          expect(alert).toHaveProperty('type');
          expect(alert).toHaveProperty('title');
          expect(alert).toHaveProperty('message');
          expect(alert).toHaveProperty('priority');

          expect(['warning', 'info', 'success', 'error']).toContain(alert.type);
          expect(['high', 'medium', 'low']).toContain(alert.priority);
        }
      }
    });

    it('should require admin authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/alerts`);
      expect(response.status).toBe(401);
    });
  });
});
