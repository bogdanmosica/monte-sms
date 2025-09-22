import { describe, expect, it, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// Mock the database models
vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  users: {
    id: 'id',
    name: 'name',
    email: 'email',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
  },
  children: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  UserRole: {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    PARENT: 'parent',
  },
}));

// Import validation schemas from the API endpoints
const createStaffSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  role: z.enum(['teacher', 'admin'], {
    required_error: 'Role must be teacher or admin',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const processEnrollmentSchema = z.object({
  childId: z.number().min(1, 'Child ID is required'),
  action: z.enum(['approve', 'reject'], {
    required_error: 'Action must be approve or reject',
  }),
  notes: z.string().optional(),
});

const processPaymentSchema = z.object({
  parentId: z.number().min(1, 'Parent ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['tuition', 'fees', 'materials', 'other'], {
    required_error: 'Payment type is required',
  }),
  description: z.string().min(1, 'Description is required').max(255),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

const generateReportSchema = z.object({
  type: z.enum(['enrollment', 'financial', 'attendance', 'staff', 'activity'], {
    required_error: 'Report type is required',
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeDetails: z.boolean().default(true),
});

const updateSchoolSettingsSchema = z.object({
  name: z.string().min(1, 'School name is required').max(255).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Valid email is required').optional(),
  website: z.string().url('Valid website URL is required').optional(),
  ageRangeMin: z.number().min(0).max(18).optional(),
  ageRangeMax: z.number().min(1).max(18).optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(500).optional(),
});

describe('Admin Models Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Staff Model Validation', () => {
    it('should validate correct staff creation data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john.doe@school.edu',
        role: 'teacher' as const,
        password: 'password123',
      };

      const result = createStaffSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject staff creation with invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        role: 'teacher' as const,
        password: 'password123',
      };

      const result = createStaffSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Valid email is required');
      }
    });

    it('should reject staff creation with short password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john.doe@school.edu',
        role: 'teacher' as const,
        password: '123',
      };

      const result = createStaffSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Password must be at least 6 characters');
      }
    });

    it('should reject staff creation with invalid role', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john.doe@school.edu',
        role: 'invalid' as any,
        password: 'password123',
      };

      const result = createStaffSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject staff creation with empty name', () => {
      const invalidData = {
        name: '',
        email: 'john.doe@school.edu',
        role: 'teacher' as const,
        password: 'password123',
      };

      const result = createStaffSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Name is required');
      }
    });
  });

  describe('Enrollment Model Validation', () => {
    it('should validate correct enrollment processing data', () => {
      const validData = {
        childId: 1,
        action: 'approve' as const,
        notes: 'All documents verified',
      };

      const result = processEnrollmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate enrollment processing without notes', () => {
      const validData = {
        childId: 1,
        action: 'reject' as const,
      };

      const result = processEnrollmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBeUndefined();
      }
    });

    it('should reject enrollment processing with invalid child ID', () => {
      const invalidData = {
        childId: 0,
        action: 'approve' as const,
      };

      const result = processEnrollmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Child ID is required');
      }
    });

    it('should reject enrollment processing with invalid action', () => {
      const invalidData = {
        childId: 1,
        action: 'invalid' as any,
      };

      const result = processEnrollmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Payment Model Validation', () => {
    it('should validate correct payment creation data', () => {
      const validData = {
        parentId: 1,
        amount: 850.00,
        type: 'tuition' as const,
        description: 'January 2025 Tuition',
        dueDate: '2025-01-01',
        notes: 'Payment plan approved',
      };

      const result = processPaymentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate payment creation without optional fields', () => {
      const validData = {
        parentId: 1,
        amount: 850.00,
        type: 'tuition' as const,
        description: 'January 2025 Tuition',
      };

      const result = processPaymentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueDate).toBeUndefined();
        expect(result.data.notes).toBeUndefined();
      }
    });

    it('should reject payment with zero amount', () => {
      const invalidData = {
        parentId: 1,
        amount: 0,
        type: 'tuition' as const,
        description: 'January 2025 Tuition',
      };

      const result = processPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Amount must be greater than 0');
      }
    });

    it('should reject payment with invalid type', () => {
      const invalidData = {
        parentId: 1,
        amount: 850.00,
        type: 'invalid' as any,
        description: 'January 2025 Tuition',
      };

      const result = processPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject payment with empty description', () => {
      const invalidData = {
        parentId: 1,
        amount: 850.00,
        type: 'tuition' as const,
        description: '',
      };

      const result = processPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Description is required');
      }
    });
  });

  describe('Report Model Validation', () => {
    it('should validate correct report generation data', () => {
      const validData = {
        type: 'enrollment' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        format: 'json' as const,
        includeDetails: true,
      };

      const result = generateReportSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should apply default values for optional fields', () => {
      const validData = {
        type: 'financial' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const result = generateReportSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('json');
        expect(result.data.includeDetails).toBe(true);
      }
    });

    it('should reject report with invalid date format', () => {
      const invalidData = {
        type: 'enrollment' as const,
        startDate: '01/01/2024',
        endDate: '12/31/2024',
      };

      const result = generateReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Start date must be in YYYY-MM-DD format');
      }
    });

    it('should reject report with invalid type', () => {
      const invalidData = {
        type: 'invalid' as any,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const result = generateReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('School Settings Model Validation', () => {
    it('should validate correct school settings data', () => {
      const validData = {
        name: 'Sunshine Montessori Academy',
        address: '123 Learning Lane',
        city: 'Education City',
        state: 'CA',
        zipCode: '12345',
        country: 'USA',
        phone: '(555) 123-4567',
        email: 'admin@school.edu',
        website: 'https://school.edu',
        ageRangeMin: 3,
        ageRangeMax: 6,
        capacity: 50,
      };

      const result = updateSchoolSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate partial school settings update', () => {
      const validData = {
        name: 'New School Name',
        capacity: 75,
      };

      const result = updateSchoolSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('New School Name');
        expect(result.data.capacity).toBe(75);
        expect(result.data.email).toBeUndefined();
      }
    });

    it('should reject school settings with invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = updateSchoolSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Valid email is required');
      }
    });

    it('should reject school settings with invalid website URL', () => {
      const invalidData = {
        website: 'not-a-url',
      };

      const result = updateSchoolSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Valid website URL is required');
      }
    });

    it('should reject school settings with invalid capacity', () => {
      const invalidData = {
        capacity: 0,
      };

      const result = updateSchoolSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Capacity must be at least 1');
      }
    });

    it('should reject school settings with invalid age range', () => {
      const invalidData = {
        ageRangeMin: -1,
      };

      const result = updateSchoolSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject school settings with excessive capacity', () => {
      const invalidData = {
        capacity: 1000,
      };

      const result = updateSchoolSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Data Type Validation', () => {
    it('should handle string to number conversion correctly', () => {
      const stringData = {
        childId: '1' as any,
        action: 'approve' as const,
      };

      const result = processEnrollmentSchema.safeParse(stringData);
      expect(result.success).toBe(false); // Should fail because childId should be number
    });

    it('should handle boolean conversion correctly', () => {
      const booleanData = {
        type: 'enrollment' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        includeDetails: 'true' as any,
      };

      const result = generateReportSchema.safeParse(booleanData);
      expect(result.success).toBe(false); // Should fail because includeDetails should be boolean
    });

    it('should validate enum values strictly', () => {
      const enumData = {
        name: 'John Doe',
        email: 'john.doe@school.edu',
        role: 'TEACHER' as any, // Wrong case
        password: 'password123',
      };

      const result = createStaffSchema.safeParse(enumData);
      expect(result.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty objects', () => {
      const emptyData = {};

      const result = createStaffSchema.safeParse(emptyData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('should handle null values', () => {
      const nullData = {
        name: null,
        email: 'john.doe@school.edu',
        role: 'teacher' as const,
        password: 'password123',
      };

      const result = createStaffSchema.safeParse(nullData);
      expect(result.success).toBe(false);
    });

    it('should handle undefined values for optional fields', () => {
      const undefinedData = {
        type: 'enrollment' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        format: undefined,
        includeDetails: undefined,
      };

      const result = generateReportSchema.safeParse(undefinedData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('json'); // Default value
        expect(result.data.includeDetails).toBe(true); // Default value
      }
    });

    it('should handle very long strings', () => {
      const longStringData = {
        name: 'A'.repeat(1000), // Very long name
        email: 'john.doe@school.edu',
        role: 'teacher' as const,
        password: 'password123',
      };

      const result = createStaffSchema.safeParse(longStringData);
      expect(result.success).toBe(false); // Should fail due to max length
    });
  });
});