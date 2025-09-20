CREATE TABLE "children" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"nickname" varchar(50),
	"birthdate" date NOT NULL,
	"gender" varchar(20),
	"allergies" text,
	"medical_notes" text,
	"emergency_contact" jsonb,
	"school_id" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"montessori_level" varchar(50) DEFAULT 'Primary',
	"current_classroom" varchar(100),
	"start_date" date NOT NULL,
	"is_active" boolean DEFAULT true,
	"can_receive_photos" boolean DEFAULT true,
	"can_participate_in_activities" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "learning_path_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"path_id" integer NOT NULL,
	"stage_id" integer,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) DEFAULT 'General',
	"is_visible_to_parents" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_path_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"path_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'Not Started',
	"position" integer NOT NULL,
	"learning_objectives" jsonb,
	"activities" jsonb,
	"assessment_criteria" jsonb,
	"estimated_time_hours" integer,
	"actual_time_spent" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"teacher_notes" text,
	"child_response" text,
	"challenges" text,
	"evidence_urls" jsonb,
	"linked_observation_id" integer,
	"linked_portfolio_entry_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"created_by_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"curriculum_area" varchar(100) NOT NULL,
	"estimated_duration" integer,
	"difficulty" varchar(20) DEFAULT 'Beginner',
	"prerequisites" jsonb,
	"status" varchar(20) DEFAULT 'Active',
	"start_date" timestamp NOT NULL,
	"target_completion_date" timestamp,
	"actual_completion_date" timestamp,
	"total_stages" integer DEFAULT 0,
	"completed_stages" integer DEFAULT 0,
	"progress_percentage" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"allow_parent_view" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "observations" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"montessori_area" varchar(100) NOT NULL,
	"activity_type" varchar(100),
	"work_cycle" varchar(50),
	"skills_demonstrated" jsonb,
	"developmental_milestones" jsonb,
	"social_interaction" varchar(50),
	"child_interest" varchar(50),
	"concentration_level" varchar(50),
	"independence_level" varchar(50),
	"next_steps" text,
	"materials_used" jsonb,
	"has_photo" boolean DEFAULT false,
	"has_video" boolean DEFAULT false,
	"media_urls" jsonb,
	"is_visible_to_parents" boolean DEFAULT true,
	"is_confidential" boolean DEFAULT false,
	"observation_date" timestamp NOT NULL,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "portfolio_collection_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection_id" integer NOT NULL,
	"entry_id" integer NOT NULL,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"created_by_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_shared_with_parents" boolean DEFAULT true,
	"is_complete" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "portfolio_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"created_by_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"montessori_area" varchar(100),
	"activity_name" varchar(255),
	"skills_demonstrated" jsonb,
	"media_urls" jsonb,
	"media_metadata" jsonb,
	"child_reflection" text,
	"teacher_observation" text,
	"learning_objectives" jsonb,
	"age_at_creation" integer,
	"academic_year" varchar(20),
	"semester" varchar(20),
	"linked_observation_id" integer,
	"is_visible_to_parents" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"tags" jsonb,
	"developmental_area" varchar(100),
	"work_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"zip_code" varchar(20),
	"country" varchar(100) DEFAULT 'USA',
	"phone" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"age_range_min" integer DEFAULT 3,
	"age_range_max" integer DEFAULT 6,
	"capacity" integer DEFAULT 50,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'parent';--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_comments" ADD CONSTRAINT "learning_path_comments_path_id_learning_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."learning_paths"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_comments" ADD CONSTRAINT "learning_path_comments_stage_id_learning_path_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."learning_path_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_comments" ADD CONSTRAINT "learning_path_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_stages" ADD CONSTRAINT "learning_path_stages_path_id_learning_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."learning_paths"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_stages" ADD CONSTRAINT "learning_path_stages_linked_observation_id_observations_id_fk" FOREIGN KEY ("linked_observation_id") REFERENCES "public"."observations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_stages" ADD CONSTRAINT "learning_path_stages_linked_portfolio_entry_id_portfolio_entries_id_fk" FOREIGN KEY ("linked_portfolio_entry_id") REFERENCES "public"."portfolio_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_collection_entries" ADD CONSTRAINT "portfolio_collection_entries_collection_id_portfolio_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."portfolio_collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_collection_entries" ADD CONSTRAINT "portfolio_collection_entries_entry_id_portfolio_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."portfolio_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_collections" ADD CONSTRAINT "portfolio_collections_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_collections" ADD CONSTRAINT "portfolio_collections_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_entries" ADD CONSTRAINT "portfolio_entries_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_entries" ADD CONSTRAINT "portfolio_entries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_entries" ADD CONSTRAINT "portfolio_entries_linked_observation_id_observations_id_fk" FOREIGN KEY ("linked_observation_id") REFERENCES "public"."observations"("id") ON DELETE no action ON UPDATE no action;