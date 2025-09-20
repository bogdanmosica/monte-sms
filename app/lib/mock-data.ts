// Mock data for the Montessori school management platform
import { UserRole } from '@/lib/db/schema';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  school_id: string;
  name: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
}

export interface Child {
  id: string;
  name: string;
  birthdate: string;
  school_id: string;
  parent_id: string;
  age: number;
  classroom: string;
}

export interface Activity {
  id: string;
  child_id: string;
  title: string;
  description: string;
  date: string;
  category:
    | 'practical_life'
    | 'sensorial'
    | 'mathematics'
    | 'language'
    | 'cultural';
  completed: boolean;
}

export interface Observation {
  id: string;
  child_id: string;
  teacher_id: string;
  date: string;
  content: string;
  category: 'social' | 'academic' | 'physical' | 'emotional';
}

// Mock Schools
export const mockSchools: School[] = [
  {
    id: '1',
    name: 'Sunshine Montessori Academy',
    address: '123 Learning Lane, Education City, EC 12345',
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'sarah.johnson@email.com',
    role: UserRole.PARENT,
    school_id: '1',
    name: 'Sarah Johnson',
  },
  {
    id: '2',
    email: 'maria.montessori@school.edu',
    role: UserRole.TEACHER,
    school_id: '1',
    name: 'Maria Montessori',
  },
  {
    id: '3',
    email: 'admin@school.edu',
    role: UserRole.ADMIN,
    school_id: '1',
    name: 'Dr. Elizabeth Carter',
  },
];

// Mock Children
export const mockChildren: Child[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    birthdate: '2019-03-15',
    school_id: '1',
    parent_id: '1',
    age: 5,
    classroom: 'Primary A',
  },
  {
    id: '2',
    name: 'Liam Chen',
    birthdate: '2018-07-22',
    school_id: '1',
    parent_id: '4',
    age: 6,
    classroom: 'Primary A',
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    birthdate: '2019-11-08',
    school_id: '1',
    parent_id: '5',
    age: 4,
    classroom: 'Primary B',
  },
];

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: '1',
    child_id: '1',
    title: 'Pouring Water Exercise',
    description:
      'Successfully completed water pouring from pitcher to glass with minimal spills',
    date: '2024-01-15',
    category: 'practical_life',
    completed: true,
  },
  {
    id: '2',
    child_id: '1',
    title: 'Pink Tower Building',
    description:
      'Built the pink tower independently, showing good spatial awareness',
    date: '2024-01-14',
    category: 'sensorial',
    completed: true,
  },
  {
    id: '3',
    child_id: '1',
    title: 'Number Rods Introduction',
    description:
      'Introduced to number rods 1-5, showed interest and engagement',
    date: '2024-01-13',
    category: 'mathematics',
    completed: false,
  },
];

// Mock Observations
export const mockObservations: Observation[] = [
  {
    id: '1',
    child_id: '1',
    teacher_id: '2',
    date: '2024-01-15',
    content:
      'Emma showed excellent concentration during practical life activities today. She completed the water pouring exercise with great care and precision.',
    category: 'academic',
  },
  {
    id: '2',
    child_id: '1',
    teacher_id: '2',
    date: '2024-01-14',
    content:
      'Emma was very helpful to a younger child who was struggling with the pink tower. She demonstrated natural leadership and empathy.',
    category: 'social',
  },
];

// Helper functions
export function getChildrenByParent(parentId: string): Child[] {
  return mockChildren.filter((child) => child.parent_id === parentId);
}

export function getActivitiesByChild(childId: string): Activity[] {
  return mockActivities.filter((activity) => activity.child_id === childId);
}

export function getObservationsByChild(childId: string): Observation[] {
  return mockObservations.filter(
    (observation) => observation.child_id === childId
  );
}

export function getUserById(userId: string): User | undefined {
  return mockUsers.find((user) => user.id === userId);
}

export function getSchoolById(schoolId: string): School | undefined {
  return mockSchools.find((school) => school.id === schoolId);
}
