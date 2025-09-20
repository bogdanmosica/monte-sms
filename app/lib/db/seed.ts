import { hashPassword } from '@/lib/auth/session';
import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import {
  teamMembers,
  teams,
  users,
  schools,
  children,
  observations,
  portfolioEntries,
  learningPaths,
  UserRole
} from './schema';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  console.log('🌱 Starting Montessori School Management System seed...');

  // Create school
  const [school] = await db
    .insert(schools)
    .values({
      name: 'Montessori Learning Academy',
      address: '123 Learning Lane',
      city: 'Education City',
      state: 'CA',
      zipCode: '90210',
      phone: '(555) 123-4567',
      email: 'admin@montessori-academy.edu',
      ageRangeMin: 3,
      ageRangeMax: 6,
      capacity: 60
    })
    .returning();

  console.log('🏫 School created:', school.name);

  // Create users with different roles
  const adminPassword = await hashPassword('admin123');
  const teacherPassword = await hashPassword('teacher123');
  const parentPassword = await hashPassword('parent123');

  const [adminUser] = await db
    .insert(users)
    .values({
      name: 'Dr. Maria Montessori',
      email: 'admin@montessori-academy.edu',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    })
    .returning();

  const [teacherUser] = await db
    .insert(users)
    .values({
      name: 'Sarah Johnson',
      email: 'sarah.teacher@montessori-academy.edu',
      passwordHash: teacherPassword,
      role: UserRole.TEACHER,
    })
    .returning();

  const [parentUser] = await db
    .insert(users)
    .values({
      name: 'John Smith',
      email: 'john.parent@example.com',
      passwordHash: parentPassword,
      role: UserRole.PARENT,
    })
    .returning();

  console.log('👥 Users created: Admin, Teacher, Parent');

  // Create team (represents the school organization)
  const [team] = await db
    .insert(teams)
    .values({
      name: 'Montessori Learning Academy Team',
    })
    .returning();

  // Add users to team
  await db.insert(teamMembers).values([
    { teamId: team.id, userId: adminUser.id, role: UserRole.ADMIN },
    { teamId: team.id, userId: teacherUser.id, role: UserRole.TEACHER },
    { teamId: team.id, userId: parentUser.id, role: UserRole.PARENT },
  ]);

  // Create sample children
  const [child1] = await db
    .insert(children)
    .values({
      firstName: 'Emma',
      lastName: 'Smith',
      nickname: 'Emmy',
      birthdate: '2020-03-15',
      schoolId: school.id,
      parentId: parentUser.id,
      montessoriLevel: 'Primary',
      currentClassroom: 'Rainbow Room',
      startDate: '2024-09-01',
      allergies: 'None',
      medicalNotes: 'No medical concerns',
      emergencyContact: {
        name: 'Jane Smith',
        relationship: 'Mother',
        phone: '(555) 987-6543',
        email: 'jane.smith@example.com',
        canPickup: true
      }
    })
    .returning();

  const [child2] = await db
    .insert(children)
    .values({
      firstName: 'Oliver',
      lastName: 'Wilson',
      nickname: 'Ollie',
      birthdate: '2019-07-22',
      schoolId: school.id,
      parentId: parentUser.id,
      montessoriLevel: 'Primary',
      currentClassroom: 'Sunshine Room',
      startDate: '2023-09-01',
      allergies: 'Peanuts',
      medicalNotes: 'EpiPen available in office',
      emergencyContact: {
        name: 'Mike Wilson',
        relationship: 'Father',
        phone: '(555) 456-7890',
        email: 'mike.wilson@example.com',
        canPickup: true
      }
    })
    .returning();

  console.log('👶 Children created: Emma and Oliver');

  // Create sample observations
  await db.insert(observations).values([
    {
      childId: child1.id,
      teacherId: teacherUser.id,
      title: 'Practical Life - Pouring Water',
      description: 'Emma demonstrated excellent concentration while pouring water from pitcher to pitcher. She completed 5 repetitions independently.',
      montessoriArea: 'Practical Life',
      activityType: 'Pouring',
      workCycle: 'Morning',
      skillsDemonstrated: ['Fine motor skills', 'Concentration', 'Independence'],
      socialInteraction: 'Independent',
      childInterest: 'High',
      concentrationLevel: 'Excellent',
      independenceLevel: 'Independent',
      nextSteps: 'Introduce pouring with smaller pitcher',
      materialsUsed: ['Glass pitcher', 'Small cups', 'Sponge'],
      observationDate: new Date('2024-09-15'),
      tags: ['practical-life', 'motor-skills', 'concentration']
    },
    {
      childId: child2.id,
      teacherId: teacherUser.id,
      title: 'Mathematics - Number Rods',
      description: 'Oliver worked with number rods for 25 minutes, accurately ordering from 1-10 and counting each rod.',
      montessoriArea: 'Mathematics',
      activityType: 'Number Rods',
      workCycle: 'Morning',
      skillsDemonstrated: ['Number recognition', 'Sequencing', 'Counting'],
      socialInteraction: 'Independent',
      childInterest: 'High',
      concentrationLevel: 'Good',
      independenceLevel: 'Guided',
      nextSteps: 'Introduce sandpaper numbers',
      materialsUsed: ['Number rods 1-10'],
      observationDate: new Date('2024-09-16'),
      tags: ['mathematics', 'counting', 'sequencing']
    }
  ]);

  console.log('📝 Sample observations created');

  // Create sample portfolio entries
  await db.insert(portfolioEntries).values([
    {
      childId: child1.id,
      createdById: teacherUser.id,
      title: 'First Week Progress',
      description: 'Emma has settled beautifully into our classroom community.',
      type: 'Weekly Summary',
      montessoriArea: 'General',
      skillsDemonstrated: ['Social adaptation', 'Following routines'],
      teacherObservation: 'Shows natural leadership qualities and helps younger children.',
      workDate: new Date('2024-09-06'),
      tags: ['adaptation', 'leadership', 'social-skills']
    },
    {
      childId: child2.id,
      createdById: teacherUser.id,
      title: 'Mathematics Discovery',
      description: 'Oliver\'s journey with mathematical concepts this month.',
      type: 'Monthly Summary',
      montessoriArea: 'Mathematics',
      skillsDemonstrated: ['Number concepts', 'Problem solving'],
      teacherObservation: 'Shows strong logical thinking and perseverance with challenging materials.',
      workDate: new Date('2024-09-20'),
      tags: ['mathematics', 'logical-thinking', 'perseverance']
    }
  ]);

  console.log('📚 Sample portfolio entries created');

  // Create sample learning paths
  await db.insert(learningPaths).values([
    {
      childId: child1.id,
      createdById: teacherUser.id,
      title: 'Practical Life Mastery',
      description: 'Progressive development of practical life skills',
      curriculumArea: 'Practical Life',
      estimatedDuration: 12, // weeks
      difficulty: 'Beginner',
      startDate: new Date('2024-09-01'),
      targetCompletionDate: new Date('2024-12-01'),
      totalStages: 5,
      completedStages: 1,
      progressPercentage: 20
    },
    {
      childId: child2.id,
      createdById: teacherUser.id,
      title: 'Mathematical Foundation',
      description: 'Building strong mathematical concepts and number sense',
      curriculumArea: 'Mathematics',
      estimatedDuration: 16, // weeks
      difficulty: 'Intermediate',
      startDate: new Date('2024-09-01'),
      targetCompletionDate: new Date('2024-12-15'),
      totalStages: 8,
      completedStages: 2,
      progressPercentage: 25
    }
  ]);

  console.log('🛤️ Sample learning paths created');

  await createStripeProducts();

  console.log('✅ Montessori School Management System seed completed!');
  console.log('');
  console.log('Test Accounts:');
  console.log('Admin: admin@montessori-academy.edu / admin123');
  console.log('Teacher: sarah.teacher@montessori-academy.edu / teacher123');
  console.log('Parent: john.parent@example.com / parent123');
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
