import { relations } from 'drizzle-orm';
import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './schema';
import { children } from './child';

// Payment status enum (temporarily using varchar)
// export const paymentStatusEnum = pgEnum('payment_status', [
//   'pending',
//   'paid',
//   'overdue',
//   'cancelled',
//   'refunded',
// ]);

// Payment type enum (temporarily using varchar)
// export const paymentTypeEnum = pgEnum('payment_type', [
//   'tuition',
//   'fees',
//   'materials',
//   'meals',
//   'activities',
//   'other',
// ]);

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),

  // Who owes the payment
  parentId: integer('parent_id')
    .notNull()
    .references(() => users.id),

  // Optional: specific child this payment is for
  childId: integer('child_id')
    .references(() => children.id),

  // Payment details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  type: varchar('type', { length: 20 }).notNull(), // paymentTypeEnum('type').notNull(),
  description: text('description').notNull(),

  // Status and dates
  status: varchar('status', { length: 20 }).default('pending'), // paymentStatusEnum('status').default('pending'),
  dueDate: timestamp('due_date').notNull(),
  paidDate: timestamp('paid_date'),

  // Payment processing
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),

  // Additional information
  notes: text('notes'),

  // Audit fields
  createdBy: integer('created_by')
    .references(() => users.id),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete support
});

// Relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  parent: one(users, {
    fields: [payments.parentId],
    references: [users.id],
  }),
  child: one(children, {
    fields: [payments.childId],
    references: [children.id],
  }),
  createdByUser: one(users, {
    fields: [payments.createdBy],
    references: [users.id],
  }),
}));

// Type exports
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// Extended types for different views
export type PaymentWithParent = Payment & {
  parent: {
    id: number;
    name: string;
    email: string;
  };
};

export type PaymentWithChild = Payment & {
  child: {
    id: number;
    firstName: string;
    lastName: string;
  };
};

export type PaymentWithDetails = Payment & {
  parent: {
    id: number;
    name: string;
    email: string;
  };
  child?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdByUser?: {
    id: number;
    name: string;
  };
};

// Payment statistics interface
export interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalPending: number;
  totalOverdue: number;
  totalPaid: number;
}