import { db } from './lib/db/drizzle';

async function createPaymentsTable() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" serial PRIMARY KEY NOT NULL,
        "parent_id" integer NOT NULL,
        "child_id" integer,
        "amount" numeric(10, 2) NOT NULL,
        "currency" varchar(3) DEFAULT 'USD',
        "type" varchar(20) NOT NULL,
        "description" text NOT NULL,
        "status" varchar(20) DEFAULT 'pending',
        "due_date" timestamp NOT NULL,
        "paid_date" timestamp,
        "stripe_payment_intent_id" varchar(255),
        "stripe_customer_id" varchar(255),
        "notes" text,
        "created_by" integer,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "deleted_at" timestamp
      );
    `);

    await db.execute(`
      ALTER TABLE "payments" ADD CONSTRAINT "payments_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
    `);

    await db.execute(`
      ALTER TABLE "payments" ADD CONSTRAINT "payments_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;
    `);

    await db.execute(`
      ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
    `);

    console.log('Payments table created successfully');
  } catch (error) {
    console.error('Error creating payments table:', error);
  }
}

createPaymentsTable();