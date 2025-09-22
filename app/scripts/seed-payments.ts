import { db } from '../lib/db/drizzle';
import { payments, users, children, UserRole } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function seedPayments() {
  console.log('🌱 Starting payment seed...');

  try {
    // Get existing users
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.role, UserRole.ADMIN))
      .limit(1);

    const parentUser = await db
      .select()
      .from(users)
      .where(eq(users.role, UserRole.PARENT))
      .limit(1);

    if (!adminUser.length || !parentUser.length) {
      console.error('❌ Required users not found. Please run the main seed script first.');
      return;
    }

    // Get existing children
    const existingChildren = await db
      .select()
      .from(children)
      .where(eq(children.parentId, parentUser[0].id));

    if (existingChildren.length < 2) {
      console.error('❌ Required children not found. Please run the main seed script first.');
      return;
    }

    const [child1, child2] = existingChildren;

    // Clear existing payments for clean seed
    await db.delete(payments);
    console.log('🧹 Cleared existing payments');

    // Create sample payments
    await db.insert(payments).values([
      {
        parentId: parentUser[0].id,
        childId: child1.id,
        amount: '850.00',
        currency: 'USD',
        type: 'tuition',
        description: 'September 2024 Tuition - Emma Smith',
        status: 'paid',
        dueDate: new Date('2024-09-01'),
        paidDate: new Date('2024-08-28'),
        notes: 'Paid via check #1234',
        createdBy: adminUser[0].id,
      },
      {
        parentId: parentUser[0].id,
        childId: child2.id,
        amount: '850.00',
        currency: 'USD',
        type: 'tuition',
        description: 'September 2024 Tuition - Oliver Wilson',
        status: 'paid',
        dueDate: new Date('2024-09-01'),
        paidDate: new Date('2024-08-28'),
        notes: 'Paid via online portal',
        createdBy: adminUser[0].id,
      },
      {
        parentId: parentUser[0].id,
        childId: child1.id,
        amount: '850.00',
        currency: 'USD',
        type: 'tuition',
        description: 'October 2024 Tuition - Emma Smith',
        status: 'pending',
        dueDate: new Date('2024-10-01'),
        notes: 'Invoice sent via email',
        createdBy: adminUser[0].id,
      },
      {
        parentId: parentUser[0].id,
        childId: child2.id,
        amount: '850.00',
        currency: 'USD',
        type: 'tuition',
        description: 'October 2024 Tuition - Oliver Wilson',
        status: 'pending',
        dueDate: new Date('2024-10-01'),
        notes: 'Invoice sent via email',
        createdBy: adminUser[0].id,
      },
      {
        parentId: parentUser[0].id,
        amount: '25.00',
        currency: 'USD',
        type: 'materials',
        description: 'Art supplies fee for September',
        status: 'paid',
        dueDate: new Date('2024-09-15'),
        paidDate: new Date('2024-09-10'),
        notes: 'Cash payment',
        createdBy: adminUser[0].id,
      },
      {
        parentId: parentUser[0].id,
        amount: '45.00',
        currency: 'USD',
        type: 'fees',
        description: 'Field trip to botanical garden',
        status: 'overdue',
        dueDate: new Date('2024-09-20'),
        notes: 'Payment reminder sent',
        createdBy: adminUser[0].id,
      },
      {
        parentId: parentUser[0].id,
        childId: child1.id,
        amount: '120.00',
        currency: 'USD',
        type: 'meals',
        description: 'Lunch program - September 2024',
        status: 'paid',
        dueDate: new Date('2024-09-01'),
        paidDate: new Date('2024-08-30'),
        notes: 'Monthly lunch plan',
        createdBy: adminUser[0].id,
      },
      {
        parentId: parentUser[0].id,
        amount: '75.00',
        currency: 'USD',
        type: 'activities',
        description: 'Music class enrollment - Fall semester',
        status: 'pending',
        dueDate: new Date('2024-10-15'),
        notes: 'Optional enrichment program',
        createdBy: adminUser[0].id,
      }
    ]);

    console.log('💳 Sample payments created successfully!');
    console.log('');
    console.log('Payment Summary:');
    console.log('- 4 Tuition payments (2 paid, 2 pending)');
    console.log('- 1 Materials fee (paid)');
    console.log('- 1 Field trip fee (overdue)');
    console.log('- 1 Lunch program (paid)');
    console.log('- 1 Activities fee (pending)');
    console.log('');
    console.log('✅ Payment seed completed!');

  } catch (error) {
    console.error('❌ Payment seed failed:', error);
    throw error;
  }
}

seedPayments()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });