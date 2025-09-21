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
import { users } from './schema';

export const observations = pgTable('observations', {
  id: serial('id').primaryKey(),

  // Core observation data
  childId: integer('child_id')
    .notNull()
    .references(() => children.id),
  teacherId: integer('teacher_id')
    .notNull()
    .references(() => users.id), // Must be a teacher

  // Observation content
  title: varchar('title', { length: 255 }).notNull(), // Brief summary
  description: text('description').notNull(), // Detailed observation

  // Montessori-specific fields
  montessoriArea: varchar('montessori_area', { length: 100 }).notNull(), // Practical Life, Sensorial, etc.
  activityType: varchar('activity_type', { length: 100 }), // Specific activity name
  workCycle: varchar('work_cycle', { length: 50 }), // Morning, Afternoon

  // Skills and development tracking
  skillsDemonstrated: jsonb('skills_demonstrated'), // Array of skills observed
  developmentalMilestones: jsonb('developmental_milestones'), // Array of milestones reached
  socialInteraction: varchar('social_interaction', { length: 50 }), // Individual, Small Group, Large Group

  // Learning indicators
  childInterest: varchar('child_interest', { length: 50 }), // High, Medium, Low
  concentrationLevel: varchar('concentration_level', { length: 50 }), // Deep, Moderate, Brief
  independenceLevel: varchar('independence_level', { length: 50 }), // Independent, Guided, Assisted

  // Follow-up and recommendations
  nextSteps: text('next_steps'), // What to offer next
  materialsUsed: jsonb('materials_used'), // Array of Montessori materials

  // Media attachments
  hasPhoto: boolean('has_photo').default(false),
  hasVideo: boolean('has_video').default(false),
  mediaUrls: jsonb('media_urls'), // Array of photo/video URLs

  // Privacy and sharing
  isVisibleToParents: boolean('is_visible_to_parents').default(true),
  isConfidential: boolean('is_confidential').default(false), // For sensitive observations

  // Administrative
  observationDate: timestamp('observation_date').notNull(), // When the observation occurred
  tags: jsonb('tags'), // Array of tags for categorization

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete support
});

// Relations
export const observationsRelations = relations(observations, ({ one }) => ({
  child: one(children, {
    fields: [observations.childId],
    references: [children.id],
  }),
  teacher: one(users, {
    fields: [observations.teacherId],
    references: [users.id],
  }),
}));

// Type exports
export type Observation = typeof observations.$inferSelect;
export type NewObservation = typeof observations.$inferInsert;

// Extended types for different views
export type ObservationWithChild = Observation & {
  child: {
    id: number;
    firstName: string;
    lastName: string;
  };
};

export type ObservationWithTeacher = Observation & {
  teacher: {
    id: number;
    name: string;
  };
};

export type ObservationWithDetails = Observation & {
  child: {
    id: number;
    firstName: string;
    lastName: string;
  };
  teacher: {
    id: number;
    name: string;
  };
};

// Enums and constants for Montessori areas
export enum MontessoriArea {
  PRACTICAL_LIFE = 'Practical Life',
  SENSORIAL = 'Sensorial',
  MATHEMATICS = 'Mathematics',
  LANGUAGE = 'Language',
  CULTURAL_STUDIES = 'Cultural Studies',
  CREATIVE_ARTS = 'Creative Arts',
  MUSIC_MOVEMENT = 'Music & Movement',
  OUTDOOR_ENVIRONMENT = 'Outdoor Environment',
  GRACE_COURTESY = 'Grace & Courtesy',
}

export enum InterestLevel {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum ConcentrationLevel {
  DEEP = 'Deep',
  MODERATE = 'Moderate',
  BRIEF = 'Brief',
}

export enum IndependenceLevel {
  INDEPENDENT = 'Independent',
  GUIDED = 'Guided',
  ASSISTED = 'Assisted',
}

export enum SocialInteractionType {
  INDIVIDUAL = 'Individual',
  SMALL_GROUP = 'Small Group',
  LARGE_GROUP = 'Large Group',
  PEER_TO_PEER = 'Peer to Peer',
}

// Interface for skills demonstrated JSON field
export interface SkillDemonstrated {
  skill: string;
  level: 'Introduced' | 'Practicing' | 'Mastered';
  notes?: string;
}

// Interface for developmental milestones JSON field
export interface DevelopmentalMilestone {
  milestone: string;
  age: number; // Age in months
  achieved: boolean;
  notes?: string;
}
