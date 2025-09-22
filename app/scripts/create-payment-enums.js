const { db } = require('../lib/db/drizzle.ts');
const { sql } = require('drizzle-orm');

async function createPaymentEnums() {
  try {
    console.log('Creating payment enums...');

    // Create payment status enum
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'overdue', 'cancelled', 'refunded');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create payment type enum
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "public"."payment_type" AS ENUM('tuition', 'fees', 'materials', 'meals', 'activities', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('Payment enums created successfully!');
  } catch (error) {
    console.error('Error creating payment enums:', error);
  }
}

createPaymentEnums();