import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { children } from './child';
import { observations } from './observation';
import { users } from './schema';

// Main portfolio entries table - represents individual artifacts/works
export const portfolioEntries = pgTable('portfolio_entries', {
  id: serial('id').primaryKey(),

  // Core relationships
  childId: integer('child_id')
    .notNull()
    .references(() => children.id),
  createdById: integer('created_by_id')
    .notNull()
    .references(() => users.id), // Teacher who added this entry

  // Entry content
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // Work Sample, Photo, Video, Achievement, etc.

  // Montessori context
  montessoriArea: varchar('montessori_area', { length: 100 }), // Link to Montessori curriculum area
  activityName: varchar('activity_name', { length: 255 }), // Specific activity
  skillsDemonstrated: jsonb('skills_demonstrated'), // Array of skills shown in this work

  // Media and files
  mediaUrls: jsonb('media_urls'), // Array of file URLs (photos, videos, documents)
  mediaMetadata: jsonb('media_metadata'), // File sizes, types, dimensions, etc.

  // Learning reflection
  childReflection: text('child_reflection'), // What the child said about their work
  teacherObservation: text('teacher_observation'), // Teacher's notes about the work
  learningObjectives: jsonb('learning_objectives'), // What skills/concepts this demonstrates

  // Contextual information
  ageAtCreation: integer('age_at_creation'), // Child's age in months when work was created
  academicYear: varchar('academic_year', { length: 20 }), // 2024-2025, etc.
  semester: varchar('semester', { length: 20 }), // Fall, Spring, Summer

  // Connection to observations
  linkedObservationId: integer('linked_observation_id').references(() => observations.id),

  // Privacy and sharing
  isVisibleToParents: boolean('is_visible_to_parents').default(true),
  isFeatured: boolean('is_featured').default(false), // Highlight in portfolio
  displayOrder: integer('display_order').default(0), // For manual ordering

  // Tags and categorization
  tags: jsonb('tags'), // Array of custom tags
  developmentalArea: varchar('developmental_area', { length: 100 }), // Physical, Cognitive, Social, etc.

  // Date of actual work (may differ from created_at)
  workDate: timestamp('work_date').notNull(),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete support
});

// Portfolio collections - grouped entries for specific purposes
export const portfolioCollections = pgTable('portfolio_collections', {
  id: serial('id').primaryKey(),

  // Core relationships
  childId: integer('child_id')
    .notNull()
    .references(() => children.id),
  createdById: integer('created_by_id')
    .notNull()
    .references(() => users.id),

  // Collection details
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // Progress Report, Conference, Year End, etc.

  // Date range for this collection
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),

  // Settings
  isSharedWithParents: boolean('is_shared_with_parents').default(true),
  isComplete: boolean('is_complete').default(false),
  displayOrder: integer('display_order').default(0),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Junction table linking entries to collections
export const portfolioCollectionEntries = pgTable('portfolio_collection_entries', {
  id: serial('id').primaryKey(),
  collectionId: integer('collection_id')
    .notNull()
    .references(() => portfolioCollections.id),
  entryId: integer('entry_id')
    .notNull()
    .references(() => portfolioEntries.id),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const portfolioEntriesRelations = relations(portfolioEntries, ({ one, many }) => ({
  child: one(children, {
    fields: [portfolioEntries.childId],
    references: [children.id],
  }),
  createdBy: one(users, {
    fields: [portfolioEntries.createdById],
    references: [users.id],
  }),
  linkedObservation: one(observations, {
    fields: [portfolioEntries.linkedObservationId],
    references: [observations.id],
  }),
  collectionEntries: many(portfolioCollectionEntries),
}));

export const portfolioCollectionsRelations = relations(portfolioCollections, ({ one, many }) => ({
  child: one(children, {
    fields: [portfolioCollections.childId],
    references: [children.id],
  }),
  createdBy: one(users, {
    fields: [portfolioCollections.createdById],
    references: [users.id],
  }),
  entries: many(portfolioCollectionEntries),
}));

export const portfolioCollectionEntriesRelations = relations(
  portfolioCollectionEntries,
  ({ one }) => ({
    collection: one(portfolioCollections, {
      fields: [portfolioCollectionEntries.collectionId],
      references: [portfolioCollections.id],
    }),
    entry: one(portfolioEntries, {
      fields: [portfolioCollectionEntries.entryId],
      references: [portfolioEntries.id],
    }),
  })
);

// Type exports
export type PortfolioEntry = typeof portfolioEntries.$inferSelect;
export type NewPortfolioEntry = typeof portfolioEntries.$inferInsert;
export type PortfolioCollection = typeof portfolioCollections.$inferSelect;
export type NewPortfolioCollection = typeof portfolioCollections.$inferInsert;
export type PortfolioCollectionEntry = typeof portfolioCollectionEntries.$inferSelect;

// Extended types
export type PortfolioEntryWithDetails = PortfolioEntry & {
  child: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdBy: {
    id: number;
    name: string;
  };
  linkedObservation?: {
    id: number;
    title: string;
  };
};

export type PortfolioCollectionWithEntries = PortfolioCollection & {
  entries: (PortfolioCollectionEntry & {
    entry: PortfolioEntry;
  })[];
  totalEntries: number;
};

// Enums for portfolio types
export enum PortfolioEntryType {
  WORK_SAMPLE = 'Work Sample',
  PHOTO = 'Photo',
  VIDEO = 'Video',
  ACHIEVEMENT = 'Achievement',
  ARTWORK = 'Artwork',
  WRITING_SAMPLE = 'Writing Sample',
  MATH_WORK = 'Math Work',
  SCIENCE_EXPERIMENT = 'Science Experiment',
  REFLECTION = 'Reflection',
  ASSESSMENT = 'Assessment',
}

export enum PortfolioCollectionType {
  PROGRESS_REPORT = 'Progress Report',
  CONFERENCE = 'Conference',
  YEAR_END = 'Year End',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  SPECIAL_PROJECT = 'Special Project',
  TRANSITION = 'Transition',
}

export enum DevelopmentalArea {
  PHYSICAL = 'Physical',
  COGNITIVE = 'Cognitive',
  SOCIAL = 'Social',
  EMOTIONAL = 'Emotional',
  LANGUAGE = 'Language',
  CREATIVE = 'Creative',
  PRACTICAL_LIFE = 'Practical Life',
}

// Interface for skills demonstrated JSON field
export interface SkillDemonstrated {
  skill: string;
  level: 'Introduced' | 'Developing' | 'Proficient' | 'Mastered';
  notes?: string;
}

// Interface for learning objectives JSON field
export interface LearningObjective {
  objective: string;
  curriculum: string; // Montessori curriculum area
  met: boolean;
  notes?: string;
}

// Interface for media metadata JSON field
export interface MediaMetadata {
  filename: string;
  size: number;
  type: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // For videos, in seconds
}