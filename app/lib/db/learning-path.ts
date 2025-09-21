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
import { portfolioEntries } from './portfolio';
import { users } from './schema';

// Learning paths represent structured developmental journeys for children
export const learningPaths = pgTable('learning_paths', {
  id: serial('id').primaryKey(),

  // Core relationships
  childId: integer('child_id')
    .notNull()
    .references(() => children.id),
  createdById: integer('created_by_id')
    .notNull()
    .references(() => users.id), // Teacher who created this path

  // Path configuration
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  curriculumArea: varchar('curriculum_area', { length: 100 }).notNull(), // Montessori area

  // Path metadata
  estimatedDuration: integer('estimated_duration'), // Duration in weeks
  difficulty: varchar('difficulty', { length: 20 }).default('Beginner'), // Beginner, Intermediate, Advanced
  prerequisites: jsonb('prerequisites'), // Array of required skills/milestones

  // Status and tracking
  status: varchar('status', { length: 20 }).default('Active'), // Active, Completed, Paused, Discontinued
  startDate: timestamp('start_date').notNull(),
  targetCompletionDate: timestamp('target_completion_date'),
  actualCompletionDate: timestamp('actual_completion_date'),

  // Progress tracking
  totalStages: integer('total_stages').default(0),
  completedStages: integer('completed_stages').default(0),
  progressPercentage: integer('progress_percentage').default(0),

  // Settings
  isVisible: boolean('is_visible').default(true),
  allowParentView: boolean('allow_parent_view').default(true),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete support
});

// Kanban-style stages within a learning path
export const learningPathStages = pgTable('learning_path_stages', {
  id: serial('id').primaryKey(),

  // Core relationships
  pathId: integer('path_id')
    .notNull()
    .references(() => learningPaths.id),

  // Stage details
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // Introduction, Practice, Assessment, Mastery

  // Kanban properties
  status: varchar('status', { length: 20 }).default('Not Started'), // Not Started, In Progress, Review, Completed
  position: integer('position').notNull(), // Order within the path

  // Content and requirements
  learningObjectives: jsonb('learning_objectives'), // Array of specific objectives
  activities: jsonb('activities'), // Suggested activities and materials
  assessmentCriteria: jsonb('assessment_criteria'), // How to measure completion

  // Time tracking
  estimatedTimeHours: integer('estimated_time_hours'),
  actualTimeSpent: integer('actual_time_spent'), // In minutes
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),

  // Teacher notes and feedback
  teacherNotes: text('teacher_notes'),
  childResponse: text('child_response'), // How the child responded to this stage
  challenges: text('challenges'), // Any difficulties encountered

  // Media and evidence
  evidenceUrls: jsonb('evidence_urls'), // Photos, videos of child work

  // Connection to other records
  linkedObservationId: integer('linked_observation_id').references(
    () => observations.id
  ),
  linkedPortfolioEntryId: integer('linked_portfolio_entry_id').references(
    () => portfolioEntries.id
  ),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Comments and reflections on learning path progress
export const learningPathComments = pgTable('learning_path_comments', {
  id: serial('id').primaryKey(),

  // Core relationships
  pathId: integer('path_id')
    .notNull()
    .references(() => learningPaths.id),
  stageId: integer('stage_id').references(() => learningPathStages.id), // Optional - can comment on overall path
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id),

  // Comment content
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).default('General'), // General, Concern, Celebration, Milestone

  // Visibility
  isVisibleToParents: boolean('is_visible_to_parents').default(true),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const learningPathsRelations = relations(
  learningPaths,
  ({ one, many }) => ({
    child: one(children, {
      fields: [learningPaths.childId],
      references: [children.id],
    }),
    createdBy: one(users, {
      fields: [learningPaths.createdById],
      references: [users.id],
    }),
    stages: many(learningPathStages),
    comments: many(learningPathComments),
  })
);

export const learningPathStagesRelations = relations(
  learningPathStages,
  ({ one, many }) => ({
    path: one(learningPaths, {
      fields: [learningPathStages.pathId],
      references: [learningPaths.id],
    }),
    linkedObservation: one(observations, {
      fields: [learningPathStages.linkedObservationId],
      references: [observations.id],
    }),
    linkedPortfolioEntry: one(portfolioEntries, {
      fields: [learningPathStages.linkedPortfolioEntryId],
      references: [portfolioEntries.id],
    }),
    comments: many(learningPathComments),
  })
);

export const learningPathCommentsRelations = relations(
  learningPathComments,
  ({ one }) => ({
    path: one(learningPaths, {
      fields: [learningPathComments.pathId],
      references: [learningPaths.id],
    }),
    stage: one(learningPathStages, {
      fields: [learningPathComments.stageId],
      references: [learningPathStages.id],
    }),
    author: one(users, {
      fields: [learningPathComments.authorId],
      references: [users.id],
    }),
  })
);

// Type exports
export type LearningPath = typeof learningPaths.$inferSelect;
export type NewLearningPath = typeof learningPaths.$inferInsert;
export type LearningPathStage = typeof learningPathStages.$inferSelect;
export type NewLearningPathStage = typeof learningPathStages.$inferInsert;
export type LearningPathComment = typeof learningPathComments.$inferSelect;
export type NewLearningPathComment = typeof learningPathComments.$inferInsert;

// Extended types for different views
export type LearningPathWithDetails = LearningPath & {
  child: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdBy: {
    id: number;
    name: string;
  };
  stages: LearningPathStage[];
  recentActivity: string;
};

export type LearningPathStageWithEvidence = LearningPathStage & {
  linkedObservation?: {
    id: number;
    title: string;
  };
  linkedPortfolioEntry?: {
    id: number;
    title: string;
  };
  comments: LearningPathComment[];
};

export type LearningPathKanbanView = {
  notStarted: LearningPathStage[];
  inProgress: LearningPathStage[];
  review: LearningPathStage[];
  completed: LearningPathStage[];
};

// Enums for learning path management
export enum LearningPathStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  PAUSED = 'Paused',
  DISCONTINUED = 'Discontinued',
}

export enum LearningPathDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export enum StageType {
  INTRODUCTION = 'Introduction',
  PRACTICE = 'Practice',
  ASSESSMENT = 'Assessment',
  MASTERY = 'Mastery',
  EXTENSION = 'Extension',
}

export enum StageStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  COMPLETED = 'Completed',
  NEEDS_SUPPORT = 'Needs Support',
}

export enum CommentType {
  GENERAL = 'General',
  CONCERN = 'Concern',
  CELEBRATION = 'Celebration',
  MILESTONE = 'Milestone',
  QUESTION = 'Question',
}

// Interface for learning objectives JSON field
export interface LearningObjective {
  objective: string;
  skillArea: string;
  measurable: boolean;
  criteria: string;
  targetDate?: string;
}

// Interface for activities JSON field
export interface Activity {
  name: string;
  materials: string[];
  duration: number; // in minutes
  instructions: string;
  variations?: string[];
  extensions?: string[];
}

// Interface for assessment criteria JSON field
export interface AssessmentCriteria {
  criteria: string;
  method: 'Observation' | 'Work Sample' | 'Conference' | 'Portfolio Review';
  rubric?: {
    level: string;
    description: string;
  }[];
  passThreshold: string;
}

// Interface for prerequisites JSON field
export interface Prerequisite {
  skill: string;
  level: 'Introduced' | 'Practicing' | 'Mastered';
  verified: boolean;
  verificationDate?: string;
}
