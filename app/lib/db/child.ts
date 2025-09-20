import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { schools } from './school';
import { users } from './schema';

export const children = pgTable('children', {
  id: serial('id').primaryKey(),
  // Basic information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  nickname: varchar('nickname', { length: 50 }), // Preferred name
  birthdate: date('birthdate').notNull(),
  gender: varchar('gender', { length: 20 }), // Optional, for reporting

  // Medical and emergency information
  allergies: text('allergies'), // Food and other allergies
  medicalNotes: text('medical_notes'), // Special medical considerations
  emergencyContact: jsonb('emergency_contact'), // JSON object with contact info

  // School relationships
  schoolId: integer('school_id')
    .notNull()
    .references(() => schools.id),
  parentId: integer('parent_id')
    .notNull()
    .references(() => users.id), // Primary parent/guardian

  // Montessori-specific fields
  montessoriLevel: varchar('montessori_level', { length: 50 }).default('Primary'), // Primary, Elementary, etc.
  currentClassroom: varchar('current_classroom', { length: 100 }), // Classroom assignment
  startDate: date('start_date').notNull(), // When child started at school

  // Status and settings
  isActive: boolean('is_active').default(true),
  canReceivePhotos: boolean('can_receive_photos').default(true), // Parent consent for photos
  canParticipateInActivities: boolean('can_participate_in_activities').default(true),

  // Additional notes
  notes: text('notes'), // General notes from teachers/admin

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete support
});

// Relations
export const childrenRelations = relations(children, ({ one, many }) => ({
  school: one(schools, {
    fields: [children.schoolId],
    references: [schools.id],
  }),
  parent: one(users, {
    fields: [children.parentId],
    references: [users.id],
  }),
  // These will be populated when other models are created
  observations: many(users), // Placeholder - will be replaced with observations
  portfolioEntries: many(users), // Placeholder - will be replaced with portfolio
  learningPath: one(users), // Placeholder - will be replaced with learning path
}));

// Type exports
export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;

// Extended types for different views
export type ChildWithSchool = Child & {
  school: {
    id: number;
    name: string;
  };
};

export type ChildWithParent = Child & {
  parent: {
    id: number;
    name: string;
    email: string;
  };
};

export type ChildWithDetails = Child & {
  school: {
    id: number;
    name: string;
  };
  parent: {
    id: number;
    name: string;
    email: string;
  };
  totalObservations: number;
  recentActivity: string;
};

// Emergency contact interface for the JSON field
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  canPickup: boolean;
  notes?: string;
}