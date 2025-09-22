import { NextRequest } from 'next/server';
import { eq, and, sql, desc, count, sum, like, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, children, payments, UserRole } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import type { PaymentStats, PaymentWithDetails, Payment } from '@/lib/db/payment';
import { withRole, logAuthEvent } from '@/lib/auth/middleware';

// Schema for payment processing
const processPaymentSchema = z.object({
  parentId: z.number().min(1, 'Parent ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['tuition', 'fees', 'materials', 'other'], {
    required_error: 'Payment type is required',
  }),
  description: z.string().min(1, 'Description is required').max(255),
  dueDate: z.string().optional(), // ISO date string
  notes: z.string().optional(),
});

// Schema for payment update
const updatePaymentSchema = z.object({
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
  notes: z.string().optional(),
});

// Helper function to calculate payment statistics
async function calculatePaymentStats(): Promise<PaymentStats> {
  const [
    totalRevenueResult,
    pendingAmountResult,
    overdueAmountResult,
    totalPendingResult,
    totalOverdueResult,
    totalPaidResult,
  ] = await Promise.all([
    // Total revenue (paid payments)
    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, 'paid')),

    // Pending amount
    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, 'pending')),

    // Overdue amount
    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, 'overdue')),

    // Count of pending payments
    db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.status, 'pending')),

    // Count of overdue payments
    db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.status, 'overdue')),

    // Count of paid payments
    db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.status, 'paid')),
  ]);

  return {
    totalRevenue: Number(totalRevenueResult[0]?.total || 0),
    pendingAmount: Number(pendingAmountResult[0]?.total || 0),
    overdueAmount: Number(overdueAmountResult[0]?.total || 0),
    totalPending: totalPendingResult[0]?.count || 0,
    totalOverdue: totalOverdueResult[0]?.count || 0,
    totalPaid: totalPaidResult[0]?.count || 0,
  };
}

// GET /api/admin/payment - List payments
export async function GET(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const parentId = searchParams.get('parentId');
        const search = searchParams.get('search');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

        // Build query conditions
        const conditions = [];

        if (status) {
          conditions.push(eq(payments.status, status as any));
        }

        if (parentId) {
          conditions.push(eq(payments.parentId, parseInt(parentId)));
        }

        if (search) {
          conditions.push(
            or(
              like(users.name, `%${search}%`),
              like(users.email, `%${search}%`),
              like(payments.description, `%${search}%`)
            )
          );
        }

        // Get payments with parent information
        const paymentsQuery = db
          .select({
            id: payments.id,
            parentId: payments.parentId,
            childId: payments.childId,
            amount: payments.amount,
            currency: payments.currency,
            type: payments.type,
            description: payments.description,
            status: payments.status,
            dueDate: payments.dueDate,
            paidDate: payments.paidDate,
            notes: payments.notes,
            createdAt: payments.createdAt,
            updatedAt: payments.updatedAt,
            parentName: users.name,
            parentEmail: users.email,
          })
          .from(payments)
          .leftJoin(users, eq(payments.parentId, users.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(payments.createdAt))
          .limit(limit)
          .offset(offset);

        // Get total count for pagination
        const countQuery = db
          .select({ count: count() })
          .from(payments)
          .leftJoin(users, eq(payments.parentId, users.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        const [paymentsResult, countResult, stats] = await Promise.all([
          paymentsQuery,
          countQuery,
          calculatePaymentStats(),
        ]);

        const total = countResult[0]?.count || 0;

        logAuthEvent(
          'ACCESS_GRANTED',
          user.id,
          `Retrieved ${paymentsResult.length} payments (status: ${status || 'all'})`
        );

        return Response.json({
          payments: paymentsResult,
          total,
          limit,
          offset,
          stats,
        });
      }
    )(request);
  } catch (error) {
    console.error('Error fetching payments:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/payment - Create payment record
export async function POST(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const body = await req.json();
        const validatedData = processPaymentSchema.parse(body);

        // Verify parent exists
        const parent = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(and(
            eq(users.id, validatedData.parentId),
            eq(users.role, UserRole.PARENT)
          ))
          .limit(1);

        if (!parent.length) {
          return Response.json(
            { error: 'Parent not found' },
            { status: 404 }
          );
        }

        const parentRecord = parent[0];

        // Create new payment record in database
        const [newPayment] = await db
          .insert(payments)
          .values({
            parentId: validatedData.parentId,
            amount: validatedData.amount.toString(),
            type: validatedData.type,
            description: validatedData.description,
            status: 'pending',
            dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : new Date(),
            notes: validatedData.notes,
            createdBy: user.id,
          })
          .returning();

        // Get the payment with parent information for response
        const paymentWithParent = await db
          .select({
            id: payments.id,
            parentId: payments.parentId,
            amount: payments.amount,
            type: payments.type,
            description: payments.description,
            status: payments.status,
            dueDate: payments.dueDate,
            createdAt: payments.createdAt,
            notes: payments.notes,
            parentName: users.name,
            parentEmail: users.email,
          })
          .from(payments)
          .leftJoin(users, eq(payments.parentId, users.id))
          .where(eq(payments.id, newPayment.id))
          .limit(1);

        const paymentResult = paymentWithParent[0];

        logAuthEvent(
          'PAYMENT_CREATED',
          user.id,
          `Created payment record: $${paymentResult.amount} for ${parentRecord.name}`
        );

        return Response.json({
          message: 'Payment record created successfully',
          payment: paymentResult,
        }, { status: 201 });
      }
    )(request);
  } catch (error) {
    console.error('Error creating payment:', error);
    if (error instanceof Response) {
      return error;
    }
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/payment - Update payment status
export async function PUT(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const paymentId = searchParams.get('id');

        if (!paymentId) {
          return Response.json(
            { error: 'Payment ID is required' },
            { status: 400 }
          );
        }

        const body = await req.json();
        const validatedData = updatePaymentSchema.parse(body);

        // Find payment in database
        const existingPayment = await db
          .select()
          .from(payments)
          .where(eq(payments.id, parseInt(paymentId)))
          .limit(1);

        if (existingPayment.length === 0) {
          return Response.json(
            { error: 'Payment not found' },
            { status: 404 }
          );
        }

        const currentPayment = existingPayment[0];

        // Prepare update data
        const updateData: any = {
          ...validatedData,
          updatedAt: new Date(),
        };

        // If status changed to paid, set paid date
        if (validatedData.status === 'paid' && currentPayment.status !== 'paid') {
          updateData.paidDate = new Date();
        }

        // Update payment in database
        await db
          .update(payments)
          .set(updateData)
          .where(eq(payments.id, parseInt(paymentId)));

        // Get updated payment with parent information
        const updatedPaymentResult = await db
          .select({
            id: payments.id,
            parentId: payments.parentId,
            amount: payments.amount,
            type: payments.type,
            description: payments.description,
            status: payments.status,
            dueDate: payments.dueDate,
            paidDate: payments.paidDate,
            notes: payments.notes,
            createdAt: payments.createdAt,
            updatedAt: payments.updatedAt,
            parentName: users.name,
            parentEmail: users.email,
          })
          .from(payments)
          .leftJoin(users, eq(payments.parentId, users.id))
          .where(eq(payments.id, parseInt(paymentId)))
          .limit(1);

        const updatedPayment = updatedPaymentResult[0];

        logAuthEvent(
          'PAYMENT_UPDATED',
          user.id,
          `Updated payment ${paymentId}: status=${validatedData.status || 'unchanged'}`
        );

        return Response.json({
          message: 'Payment updated successfully',
          payment: updatedPayment,
        });
      }
    )(request);
  } catch (error) {
    console.error('Error updating payment:', error);
    if (error instanceof Response) {
      return error;
    }
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}