import { NextRequest } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { schools, UserRole } from '@/lib/db/schema';
import { withRole, logAuthEvent } from '@/lib/auth/middleware';

// Schema for school settings update
const updateSchoolSettingsSchema = z.object({
  name: z.string().min(1, 'School name is required').max(255).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Valid email is required').optional(),
  website: z.string().url('Valid website URL is required').optional(),
  ageRangeMin: z.number().min(0).max(18).optional(),
  ageRangeMax: z.number().min(1).max(18).optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(500).optional(),
});

// Schema for system settings (would be stored in a settings table)
const updateSystemSettingsSchema = z.object({
  // General settings
  allowRegistration: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  enableNotifications: z.boolean().optional(),

  // Security settings
  sessionTimeout: z.number().min(5).max(1440).optional(), // minutes
  maxLoginAttempts: z.number().min(3).max(10).optional(),

  // Feature toggles
  enablePayments: z.boolean().optional(),
  enableObservations: z.boolean().optional(),
  enablePortfolio: z.boolean().optional(),

  // Communication settings
  emailFrom: z.string().email().optional(),
  smsEnabled: z.boolean().optional(),

  // Backup settings
  autoBackup: z.boolean().optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
});

// Mock system settings (would be stored in database)
let systemSettings = {
  allowRegistration: true,
  requireEmailVerification: true,
  enableNotifications: true,
  sessionTimeout: 480, // 8 hours
  maxLoginAttempts: 5,
  enablePayments: true,
  enableObservations: true,
  enablePortfolio: true,
  emailFrom: 'noreply@montessori-academy.edu',
  smsEnabled: false,
  autoBackup: true,
  backupFrequency: 'daily' as const,
  updatedAt: new Date().toISOString(),
};

// GET /api/admin/settings - Get all settings
export async function GET(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const section = searchParams.get('section'); // 'school', 'system', or 'all'

        let response: any = {};

        if (!section || section === 'all' || section === 'school') {
          // Get school settings
          const schoolData = await db
            .select()
            .from(schools)
            .limit(1);

          response.school = schoolData[0] || null;
        }

        if (!section || section === 'all' || section === 'system') {
          // Get system settings (mock data)
          response.system = systemSettings;
        }

        logAuthEvent(
          'SETTINGS_ACCESSED',
          user.id,
          `Accessed settings section: ${section || 'all'}`
        );

        return Response.json(response);
      }
    )(request);
  } catch (error) {
    console.error('Error fetching settings:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const section = searchParams.get('section'); // 'school' or 'system'

        if (!section) {
          return Response.json(
            { error: 'Section parameter is required (school or system)' },
            { status: 400 }
          );
        }

        const body = await req.json();
        let result: any = {};

        if (section === 'school') {
          // Update school settings
          const validatedData = updateSchoolSettingsSchema.parse(body);

          // Validate age range
          if (validatedData.ageRangeMin && validatedData.ageRangeMax) {
            if (validatedData.ageRangeMin >= validatedData.ageRangeMax) {
              return Response.json(
                { error: 'Minimum age must be less than maximum age' },
                { status: 400 }
              );
            }
          }

          // Get current school record
          const currentSchool = await db
            .select()
            .from(schools)
            .limit(1);

          if (!currentSchool.length) {
            // Create new school record if none exists
            const [newSchool] = await db
              .insert(schools)
              .values({
                name: validatedData.name || 'Montessori School',
                address: validatedData.address,
                city: validatedData.city,
                state: validatedData.state,
                zipCode: validatedData.zipCode,
                country: validatedData.country || 'USA',
                phone: validatedData.phone,
                email: validatedData.email,
                website: validatedData.website,
                ageRangeMin: validatedData.ageRangeMin || 3,
                ageRangeMax: validatedData.ageRangeMax || 6,
                capacity: validatedData.capacity || 50,
              })
              .returning();

            result.school = newSchool;
          } else {
            // Update existing school record
            const [updatedSchool] = await db
              .update(schools)
              .set({
                ...validatedData,
                updatedAt: new Date(),
              })
              .where(eq(schools.id, currentSchool[0].id))
              .returning();

            result.school = updatedSchool;
          }

          logAuthEvent(
            'SCHOOL_SETTINGS_UPDATED',
            user.id,
            `Updated school settings: ${Object.keys(validatedData).join(', ')}`
          );

        } else if (section === 'system') {
          // Update system settings
          const validatedData = updateSystemSettingsSchema.parse(body);

          // Update mock system settings
          systemSettings = {
            ...systemSettings,
            ...validatedData,
            updatedAt: new Date().toISOString(),
          };

          result.system = systemSettings;

          logAuthEvent(
            'SYSTEM_SETTINGS_UPDATED',
            user.id,
            `Updated system settings: ${Object.keys(validatedData).join(', ')}`
          );

        } else {
          return Response.json(
            { error: 'Invalid section. Must be "school" or "system"' },
            { status: 400 }
          );
        }

        return Response.json({
          message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`,
          ...result,
        });
      }
    )(request);
  } catch (error) {
    console.error('Error updating settings:', error);
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

// POST /api/admin/settings - Reset settings to defaults
export async function POST(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');

        if (action === 'reset-system') {
          // Reset system settings to defaults
          systemSettings = {
            allowRegistration: true,
            requireEmailVerification: true,
            enableNotifications: true,
            sessionTimeout: 480,
            maxLoginAttempts: 5,
            enablePayments: true,
            enableObservations: true,
            enablePortfolio: true,
            emailFrom: 'noreply@montessori-academy.edu',
            smsEnabled: false,
            autoBackup: true,
            backupFrequency: 'daily' as const,
            updatedAt: new Date().toISOString(),
          };

          logAuthEvent(
            'SYSTEM_SETTINGS_RESET',
            user.id,
            'Reset system settings to defaults'
          );

          return Response.json({
            message: 'System settings reset to defaults',
            system: systemSettings,
          });

        } else if (action === 'backup') {
          // Create settings backup
          const backup = {
            id: `backup_${Date.now()}`,
            createdAt: new Date().toISOString(),
            createdBy: user.id,
            school: await db.select().from(schools).limit(1),
            system: systemSettings,
          };

          logAuthEvent(
            'SETTINGS_BACKUP_CREATED',
            user.id,
            `Created settings backup: ${backup.id}`
          );

          return Response.json({
            message: 'Settings backup created successfully',
            backup,
          });

        } else {
          return Response.json(
            { error: 'Invalid action. Supported actions: reset-system, backup' },
            { status: 400 }
          );
        }
      }
    )(request);
  } catch (error) {
    console.error('Error in settings action:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}