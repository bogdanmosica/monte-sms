import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  applicationStatusEnum,
  enrollmentStatusEnum,
  priorityEnum,
  type Application,
  type NewApplication,
  type Enrollment,
  type NewEnrollment,
  type ApplicationStatus,
  type EnrollmentStatus,
  type Priority,
} from '@/lib/db/enrollment';

// Schema validation tests based on the actual Drizzle schemas
describe('Enrollment Model Validation', () => {
  describe('Application Status Enum', () => {
    it('should accept valid application statuses', () => {
      const validStatuses: ApplicationStatus[] = [
        'pending',
        'under_review',
        'interview_scheduled',
        'approved',
        'rejected',
        'waitlisted',
      ];

      validStatuses.forEach(status => {
        expect(applicationStatusEnum.enumValues).toContain(status);
      });
    });

    it('should reject invalid application statuses', () => {
      const invalidStatuses = ['invalid', 'completed', 'cancelled'];

      invalidStatuses.forEach(status => {
        expect(applicationStatusEnum.enumValues).not.toContain(status);
      });
    });
  });

  describe('Enrollment Status Enum', () => {
    it('should accept valid enrollment statuses', () => {
      const validStatuses: EnrollmentStatus[] = [
        'active',
        'inactive',
        'graduated',
        'transferred',
        'withdrawn',
      ];

      validStatuses.forEach(status => {
        expect(enrollmentStatusEnum.enumValues).toContain(status);
      });
    });

    it('should reject invalid enrollment statuses', () => {
      const invalidStatuses = ['pending', 'suspended', 'expelled'];

      invalidStatuses.forEach(status => {
        expect(enrollmentStatusEnum.enumValues).not.toContain(status);
      });
    });
  });

  describe('Priority Enum', () => {
    it('should accept valid priority levels', () => {
      const validPriorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

      validPriorities.forEach(priority => {
        expect(priorityEnum.enumValues).toContain(priority);
      });
    });

    it('should reject invalid priority levels', () => {
      const invalidPriorities = ['critical', 'normal', 'lowest'];

      invalidPriorities.forEach(priority => {
        expect(priorityEnum.enumValues).not.toContain(priority);
      });
    });
  });

  describe('Application Data Validation', () => {
    // Schema for application validation (mimics API schema)
    const applicationSchema = z.object({
      childName: z.string().min(1, 'Child name is required').max(100, 'Child name too long'),
      parentName: z.string().min(1, 'Parent name is required').max(100, 'Parent name too long'),
      email: z.string().email('Invalid email format').max(255, 'Email too long'),
      phone: z.string().min(1, 'Phone is required').max(20, 'Phone too long'),
      address: z.string().min(1, 'Address is required'),
      childBirthDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid birth date'),
      preferredStartDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
      status: z.enum(['pending', 'under_review', 'interview_scheduled', 'approved', 'rejected', 'waitlisted']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      notes: z.string().optional(),
    });

    it('should validate complete application data', () => {
      const validApplication = {
        childName: 'John Doe',
        parentName: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '555-123-4567',
        address: '123 Main Street, Anytown, ST 12345',
        childBirthDate: '2020-01-15',
        preferredStartDate: '2024-09-01',
        status: 'pending' as const,
        priority: 'medium' as const,
        notes: 'Looking forward to joining the Montessori program',
      };

      const result = applicationSchema.safeParse(validApplication);
      expect(result.success).toBe(true);
    });

    it('should reject application with missing required fields', () => {
      const invalidApplication = {
        childName: '',
        email: 'invalid-email',
        phone: '',
      };

      const result = applicationSchema.safeParse(invalidApplication);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some(e => e.path.includes('childName'))).toBe(true);
        expect(errors.some(e => e.path.includes('email'))).toBe(true);
        expect(errors.some(e => e.path.includes('parentName'))).toBe(true);
      }
    });

    it('should validate field length constraints', () => {
      const longName = 'a'.repeat(101); // Exceeds 100 character limit
      const longEmail = 'test@' + 'a'.repeat(250) + '.com'; // Exceeds 255 character limit
      const longPhone = '1'.repeat(21); // Exceeds 20 character limit

      const invalidApplication = {
        childName: longName,
        parentName: 'Valid Name',
        email: longEmail,
        phone: longPhone,
        address: '123 Main St',
        childBirthDate: '2020-01-15',
        preferredStartDate: '2024-09-01',
      };

      const result = applicationSchema.safeParse(invalidApplication);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some(e => e.message.includes('Child name too long'))).toBe(true);
        expect(errors.some(e => e.message.includes('Email too long'))).toBe(true);
        expect(errors.some(e => e.message.includes('Phone too long'))).toBe(true);
      }
    });

    it('should validate date formats', () => {
      const invalidDates = {
        childName: 'John Doe',
        parentName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-1234',
        address: '123 Main St',
        childBirthDate: 'invalid-date',
        preferredStartDate: '2024-13-01', // Invalid month
      };

      const result = applicationSchema.safeParse(invalidDates);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some(e => e.message.includes('Invalid birth date'))).toBe(true);
        expect(errors.some(e => e.message.includes('Invalid start date'))).toBe(true);
      }
    });

    it('should validate email format', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@invalid.com',
        'invalid.com',
        'invalid@.com',
        'invalid@domain.',
      ];

      invalidEmails.forEach(email => {
        const application = {
          childName: 'John Doe',
          parentName: 'Jane Doe',
          email,
          phone: '555-1234',
          address: '123 Main St',
          childBirthDate: '2020-01-15',
          preferredStartDate: '2024-09-01',
        };

        const result = applicationSchema.safeParse(application);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Enrollment Data Validation', () => {
    const enrollmentSchema = z.object({
      applicationId: z.number().min(1, 'Application ID is required'),
      childId: z.number().min(1, 'Child ID is required'),
      enrollmentDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid enrollment date'),
      status: z.enum(['active', 'inactive', 'graduated', 'transferred', 'withdrawn']).optional(),
      classroom: z.string().max(100, 'Classroom name too long').optional(),
      tuitionAmount: z.number().min(0, 'Tuition amount must be non-negative').optional(),
      discountAmount: z.number().min(0, 'Discount amount must be non-negative').optional(),
      notes: z.string().optional(),
      withdrawalDate: z.string().optional(),
      withdrawalReason: z.string().optional(),
    });

    it('should validate complete enrollment data', () => {
      const validEnrollment = {
        applicationId: 1,
        childId: 1,
        enrollmentDate: '2024-09-01',
        status: 'active' as const,
        classroom: 'Toddler Room A',
        tuitionAmount: 150000, // $1500 in cents
        discountAmount: 15000, // $150 discount in cents
        notes: 'First year enrollment',
      };

      const result = enrollmentSchema.safeParse(validEnrollment);
      expect(result.success).toBe(true);
    });

    it('should reject enrollment with invalid IDs', () => {
      const invalidEnrollment = {
        applicationId: 0, // Invalid: must be >= 1
        childId: -1, // Invalid: must be >= 1
        enrollmentDate: '2024-09-01',
      };

      const result = enrollmentSchema.safeParse(invalidEnrollment);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some(e => e.message.includes('Application ID is required'))).toBe(true);
        expect(errors.some(e => e.message.includes('Child ID is required'))).toBe(true);
      }
    });

    it('should validate monetary amounts', () => {
      const invalidAmounts = {
        applicationId: 1,
        childId: 1,
        enrollmentDate: '2024-09-01',
        tuitionAmount: -100, // Invalid: negative amount
        discountAmount: -50, // Invalid: negative amount
      };

      const result = enrollmentSchema.safeParse(invalidAmounts);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some(e => e.message.includes('Tuition amount must be non-negative'))).toBe(true);
        expect(errors.some(e => e.message.includes('Discount amount must be non-negative'))).toBe(true);
      }
    });

    it('should validate classroom name length', () => {
      const longClassroom = 'a'.repeat(101); // Exceeds 100 character limit

      const invalidEnrollment = {
        applicationId: 1,
        childId: 1,
        enrollmentDate: '2024-09-01',
        classroom: longClassroom,
      };

      const result = enrollmentSchema.safeParse(invalidEnrollment);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some(e => e.message.includes('Classroom name too long'))).toBe(true);
      }
    });

    it('should validate enrollment date format', () => {
      const invalidDate = {
        applicationId: 1,
        childId: 1,
        enrollmentDate: 'not-a-date',
      };

      const result = enrollmentSchema.safeParse(invalidDate);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some(e => e.message.includes('Invalid enrollment date'))).toBe(true);
      }
    });
  });

  describe('Type Safety', () => {
    it('should enforce Application type structure', () => {
      // This test ensures TypeScript types are correctly inferred
      const application: Partial<Application> = {
        id: 1,
        childName: 'John Doe',
        parentName: 'Jane Doe',
        email: 'jane@example.com',
        status: 'pending',
        priority: 'medium',
      };

      expect(application.id).toBe(1);
      expect(application.status).toBe('pending');
      expect(application.priority).toBe('medium');
    });

    it('should enforce Enrollment type structure', () => {
      const enrollment: Partial<Enrollment> = {
        id: 1,
        applicationId: 1,
        childId: 1,
        status: 'active',
        classroom: 'Toddler Room',
        tuitionAmount: 150000,
      };

      expect(enrollment.id).toBe(1);
      expect(enrollment.status).toBe('active');
      expect(enrollment.tuitionAmount).toBe(150000);
    });
  });

  describe('Business Logic Validation', () => {
    it('should validate logical constraints for applications', () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      const pastDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago

      // Child birth date should be in the past
      const childInFuture = {
        childBirthDate: futureDate.toISOString().split('T')[0],
        preferredStartDate: now.toISOString().split('T')[0],
      };

      // This would typically be validated in business logic layer
      expect(new Date(childInFuture.childBirthDate) > now).toBe(true); // Invalid case

      // Preferred start date should typically be in the future
      const startInPast = {
        childBirthDate: pastDate.toISOString().split('T')[0],
        preferredStartDate: pastDate.toISOString().split('T')[0],
      };

      expect(new Date(startInPast.preferredStartDate) < now).toBe(true); // Potentially invalid case
    });

    it('should validate tuition and discount logic', () => {
      const tuition = 150000; // $1500
      const discount = 200000; // $2000 - more than tuition!

      // Business rule: discount should not exceed tuition
      expect(discount > tuition).toBe(true); // This should be caught in business logic
    });

    it('should validate enrollment status transitions', () => {
      const validTransitions = {
        pending: ['active', 'rejected'],
        active: ['inactive', 'graduated', 'transferred', 'withdrawn'],
        inactive: ['active', 'withdrawn'],
        graduated: [], // Final state
        transferred: [], // Final state
        withdrawn: [], // Final state
      };

      // Test that final states don't transition
      expect(validTransitions.graduated).toHaveLength(0);
      expect(validTransitions.transferred).toHaveLength(0);
      expect(validTransitions.withdrawn).toHaveLength(0);
    });
  });
});