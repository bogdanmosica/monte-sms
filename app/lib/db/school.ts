import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './schema';

export const schools = pgTable('schools', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('USA'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  // Montessori-specific fields
  ageRangeMin: integer('age_range_min').default(3), // Minimum age in years
  ageRangeMax: integer('age_range_max').default(6), // Maximum age in years
  capacity: integer('capacity').default(50), // Total student capacity
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete support
});

// Relations will be defined after importing other models
export const schoolsRelations = relations(schools, ({ many }) => ({
  // Will be populated when children and users models are imported
  children: many(users), // Placeholder - will be replaced with children table
  staff: many(users), // Teachers and admins at this school
}));

// Type exports
export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;

// School with extended data for admin views
export type SchoolWithStats = School & {
  totalChildren: number;
  totalStaff: number;
  totalParents: number;
};
