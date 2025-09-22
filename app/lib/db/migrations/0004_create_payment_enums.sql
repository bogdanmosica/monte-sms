-- Create payment status enum
DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'overdue', 'cancelled', 'refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create payment type enum
DO $$ BEGIN
 CREATE TYPE "public"."payment_type" AS ENUM('tuition', 'fees', 'materials', 'meals', 'activities', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;