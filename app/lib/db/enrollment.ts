import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users, children, schools } from './schema';

// Enums for enrollment system
export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'under_review',
  'interview_scheduled',
  'approved',
  'rejected',
  'waitlisted',
]);

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'active',
  'inactive',
  'graduated',
  'transferred',
  'withdrawn',
]);

export const priorityEnum = pgEnum('priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

// Applications table
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  childName: varchar('child_name', { length: 100 }).notNull(),
  parentId: integer('parent_id')
    .notNull()
    .references(() => users.id),
  schoolId: integer('school_id')
    .notNull()
    .references(() => schools.id),
  childBirthDate: date('child_birth_date').notNull(),
  parentName: varchar('parent_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address').notNull(),
  preferredStartDate: date('preferred_start_date').notNull(),
  status: applicationStatusEnum('status').notNull().default('pending'),
  notes: text('notes'),
  priority: priorityEnum('priority').notNull().default('medium'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  interviewDate: timestamp('interview_date'),
  interviewNotes: text('interview_notes'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Enrollments table
export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id')
    .notNull()
    .references(() => applications.id),
  childId: integer('child_id')
    .notNull()
    .references(() => children.id),
  schoolId: integer('school_id')
    .notNull()
    .references(() => schools.id),
  parentId: integer('parent_id')
    .notNull()
    .references(() => users.id),
  enrollmentDate: date('enrollment_date').notNull(),
  status: enrollmentStatusEnum('status').notNull().default('active'),
  classroom: varchar('classroom', { length: 100 }),
  tuitionAmount: integer('tuition_amount'), // in cents
  discountAmount: integer('discount_amount'), // in cents
  notes: text('notes'),
  withdrawalDate: date('withdrawal_date'),
  withdrawalReason: text('withdrawal_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Waitlist table
export const waitlist = pgTable('waitlist', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id')
    .notNull()
    .references(() => applications.id),
  position: integer('position').notNull(),
  addedAt: timestamp('added_at').notNull().defaultNow(),
  notifiedAt: timestamp('notified_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Application documents table
export const applicationDocuments = pgTable('application_documents', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id')
    .notNull()
    .references(() => applications.id),
  documentType: varchar('document_type', { length: 50 }).notNull(), // 'birth_certificate', 'medical_records', 'previous_school_records', etc.
  fileName: varchar('file_name', { length: 255 }).notNull(),
  filePath: text('file_path').notNull(),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
  uploadedBy: integer('uploaded_by')
    .notNull()
    .references(() => users.id),
});

// Relations
export const applicationsRelations = relations(applications, ({ one, many }) => ({
  parent: one(users, {
    fields: [applications.parentId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [applications.schoolId],
    references: [schools.id],
  }),
  reviewedByUser: one(users, {
    fields: [applications.reviewedBy],
    references: [users.id],
  }),
  enrollment: one(enrollments, {
    fields: [applications.id],
    references: [enrollments.applicationId],
  }),
  waitlistEntry: one(waitlist, {
    fields: [applications.id],
    references: [waitlist.applicationId],
  }),
  documents: many(applicationDocuments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  application: one(applications, {
    fields: [enrollments.applicationId],
    references: [applications.id],
  }),
  child: one(children, {
    fields: [enrollments.childId],
    references: [children.id],
  }),
  school: one(schools, {
    fields: [enrollments.schoolId],
    references: [schools.id],
  }),
  parent: one(users, {
    fields: [enrollments.parentId],
    references: [users.id],
  }),
}));

export const waitlistRelations = relations(waitlist, ({ one }) => ({
  application: one(applications, {
    fields: [waitlist.applicationId],
    references: [applications.id],
  }),
}));

export const applicationDocumentsRelations = relations(applicationDocuments, ({ one }) => ({
  application: one(applications, {
    fields: [applicationDocuments.applicationId],
    references: [applications.id],
  }),
  uploadedBy: one(users, {
    fields: [applicationDocuments.uploadedBy],
    references: [users.id],
  }),
}));

// TypeScript types
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
export type WaitlistEntry = typeof waitlist.$inferSelect;
export type NewWaitlistEntry = typeof waitlist.$inferInsert;
export type ApplicationDocument = typeof applicationDocuments.$inferSelect;
export type NewApplicationDocument = typeof applicationDocuments.$inferInsert;

// Combined types for API responses
export type ApplicationWithRelations = Application & {
  parent: Pick<typeof users.$inferSelect, 'id' | 'name' | 'email'>;
  school: Pick<typeof schools.$inferSelect, 'id' | 'name'>;
  reviewedByUser?: Pick<typeof users.$inferSelect, 'id' | 'name'>;
  enrollment?: Enrollment;
  waitlistEntry?: WaitlistEntry;
  documents: ApplicationDocument[];
};

export type EnrollmentWithRelations = Enrollment & {
  application: Application;
  child: Pick<typeof children.$inferSelect, 'id' | 'name' | 'age'>;
  school: Pick<typeof schools.$inferSelect, 'id' | 'name'>;
  parent: Pick<typeof users.$inferSelect, 'id' | 'name' | 'email'>;
};

// Utility types for API
export type ApplicationStatus = typeof applicationStatusEnum.enumValues[number];
export type EnrollmentStatus = typeof enrollmentStatusEnum.enumValues[number];
export type Priority = typeof priorityEnum.enumValues[number];