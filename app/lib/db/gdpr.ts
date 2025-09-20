import { db } from './drizzle';
import { users, children, observations, portfolioEntries, learningPaths, activityLogs } from './schema';
import { eq, and, sql } from 'drizzle-orm';
import { logAuthEvent } from '@/lib/auth/middleware';

// GDPR Data Categories
export enum DataCategory {
  PERSONAL_DATA = 'Personal Data',
  SENSITIVE_DATA = 'Sensitive Data',
  EDUCATIONAL_DATA = 'Educational Data',
  MEDICAL_DATA = 'Medical Data',
  COMMUNICATIONS = 'Communications',
  SYSTEM_LOGS = 'System Logs',
}

// GDPR Rights
export enum GDPRRight {
  ACCESS = 'Right of Access',
  RECTIFICATION = 'Right to Rectification',
  ERASURE = 'Right to Erasure',
  PORTABILITY = 'Right to Data Portability',
  RESTRICT_PROCESSING = 'Right to Restrict Processing',
  OBJECT = 'Right to Object',
}

// Legal basis for processing under GDPR
export enum LegalBasis {
  CONSENT = 'Consent',
  CONTRACT = 'Contract',
  LEGAL_OBLIGATION = 'Legal Obligation',
  VITAL_INTERESTS = 'Vital Interests',
  PUBLIC_TASK = 'Public Task',
  LEGITIMATE_INTERESTS = 'Legitimate Interests',
}

// Data retention periods (in months)
export const RETENTION_PERIODS = {
  CHILD_RECORDS: 84, // 7 years after leaving school
  OBSERVATIONS: 84, // 7 years for educational records
  PORTFOLIO_ENTRIES: 84, // 7 years for educational records
  LEARNING_PATHS: 84, // 7 years for educational records
  ACTIVITY_LOGS: 36, // 3 years for audit logs
  USER_ACCOUNTS: 12, // 1 year after account deletion
} as const;

// Data mapping for GDPR compliance
export const DATA_MAPPING = {
  users: {
    category: DataCategory.PERSONAL_DATA,
    legalBasis: LegalBasis.CONTRACT,
    retentionMonths: RETENTION_PERIODS.USER_ACCOUNTS,
    fields: {
      personal: ['name', 'email'],
      technical: ['passwordHash', 'createdAt', 'updatedAt'],
      sensitive: [], // No sensitive data in users table
    },
  },
  children: {
    category: DataCategory.SENSITIVE_DATA,
    legalBasis: LegalBasis.CONSENT,
    retentionMonths: RETENTION_PERIODS.CHILD_RECORDS,
    fields: {
      personal: ['firstName', 'lastName', 'nickname', 'birthdate', 'gender'],
      sensitive: ['allergies', 'medicalNotes', 'emergencyContact'],
      educational: ['montessoriLevel', 'currentClassroom', 'startDate'],
    },
  },
  observations: {
    category: DataCategory.EDUCATIONAL_DATA,
    legalBasis: LegalBasis.LEGITIMATE_INTERESTS,
    retentionMonths: RETENTION_PERIODS.OBSERVATIONS,
    fields: {
      educational: ['title', 'description', 'montessoriArea', 'skillsDemonstrated'],
      media: ['mediaUrls', 'hasPhoto', 'hasVideo'],
      assessment: ['nextSteps', 'developmentalMilestones'],
    },
  },
  portfolioEntries: {
    category: DataCategory.EDUCATIONAL_DATA,
    legalBasis: LegalBasis.LEGITIMATE_INTERESTS,
    retentionMonths: RETENTION_PERIODS.PORTFOLIO_ENTRIES,
    fields: {
      educational: ['title', 'description', 'skillsDemonstrated', 'learningObjectives'],
      media: ['mediaUrls', 'mediaMetadata'],
      reflection: ['childReflection', 'teacherObservation'],
    },
  },
  learningPaths: {
    category: DataCategory.EDUCATIONAL_DATA,
    legalBasis: LegalBasis.LEGITIMATE_INTERESTS,
    retentionMonths: RETENTION_PERIODS.LEARNING_PATHS,
    fields: {
      educational: ['title', 'description', 'curriculumArea'],
      progress: ['status', 'progressPercentage', 'completedStages'],
      assessment: ['prerequisites', 'targetCompletionDate'],
    },
  },
  activityLogs: {
    category: DataCategory.SYSTEM_LOGS,
    legalBasis: LegalBasis.LEGITIMATE_INTERESTS,
    retentionMonths: RETENTION_PERIODS.ACTIVITY_LOGS,
    fields: {
      system: ['action', 'timestamp', 'ipAddress'],
      user: ['userId'],
    },
  },
} as const;

// Interface for data export
export interface DataExportRequest {
  userId: number;
  userRole: string;
  targetUserId?: number; // For parents requesting child data
  categories: DataCategory[];
  format: 'JSON' | 'CSV' | 'PDF';
  includeDeleted: boolean;
}

// Interface for data deletion request
export interface DataDeletionRequest {
  userId: number;
  userRole: string;
  targetUserId?: number;
  categories: DataCategory[];
  reason: string;
  confirmationRequired: boolean;
}

// GDPR Consent Management
export interface ConsentRecord {
  userId: number;
  childId?: number;
  dataCategory: DataCategory;
  purpose: string;
  consentGiven: boolean;
  consentDate: Date;
  withdrawalDate?: Date;
  legalBasis: LegalBasis;
  version: string;
}

/**
 * Export all data for a user (GDPR Article 20 - Right to Data Portability)
 */
export async function exportUserData(request: DataExportRequest): Promise<any> {
  const { userId, userRole, targetUserId, categories, format, includeDeleted } = request;

  // Verify access rights
  if (userRole === 'Parent' && targetUserId && targetUserId !== userId) {
    // Parents can only export their own data or their children's data
    const childOwnership = await db
      .select({ id: children.id })
      .from(children)
      .where(and(
        eq(children.parentId, userId),
        eq(children.id, targetUserId)
      ));

    if (!childOwnership.length) {
      throw new Error('Access denied: Cannot export data for this user');
    }
  }

  const exportData: any = {
    exportDate: new Date().toISOString(),
    requestedBy: userId,
    targetUser: targetUserId || userId,
    categories,
    format,
    data: {},
    metadata: {
      dataMapping: DATA_MAPPING,
      retentionPolicies: RETENTION_PERIODS,
    },
  };

  const subjectId = targetUserId || userId;

  // Export user data
  if (categories.includes(DataCategory.PERSONAL_DATA)) {
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, subjectId));

    exportData.data.personalData = userData.map(user => ({
      ...user,
      passwordHash: '[REDACTED]', // Never export password hashes
    }));
  }

  // Export child data (if user is parent or the child themselves)
  if (categories.includes(DataCategory.SENSITIVE_DATA) || categories.includes(DataCategory.EDUCATIONAL_DATA)) {
    let childQuery = db.select().from(children);

    if (userRole === 'Parent') {
      childQuery = childQuery.where(eq(children.parentId, userId));
    } else if (targetUserId) {
      childQuery = childQuery.where(eq(children.id, targetUserId));
    }

    if (!includeDeleted) {
      childQuery = childQuery.where(eq(children.deletedAt, null));
    }

    const childData = await childQuery;
    exportData.data.childrenData = childData;

    // Export observations for these children
    if (childData.length > 0) {
      const childIds = childData.map(child => child.id);
      const observationsData = await db
        .select()
        .from(observations)
        .where(and(
          sql`${observations.childId} = ANY(${childIds})`,
          includeDeleted ? undefined : eq(observations.deletedAt, null)
        ));

      exportData.data.observations = observationsData;

      // Export portfolio entries
      const portfolioData = await db
        .select()
        .from(portfolioEntries)
        .where(and(
          sql`${portfolioEntries.childId} = ANY(${childIds})`,
          includeDeleted ? undefined : eq(portfolioEntries.deletedAt, null)
        ));

      exportData.data.portfolioEntries = portfolioData;

      // Export learning paths
      const learningPathData = await db
        .select()
        .from(learningPaths)
        .where(and(
          sql`${learningPaths.childId} = ANY(${childIds})`,
          includeDeleted ? undefined : eq(learningPaths.deletedAt, null)
        ));

      exportData.data.learningPaths = learningPathData;
    }
  }

  // Export system logs
  if (categories.includes(DataCategory.SYSTEM_LOGS)) {
    const logsData = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, subjectId))
      .orderBy(activityLogs.timestamp);

    exportData.data.activityLogs = logsData;
  }

  // Log the export request
  logAuthEvent('LOGIN_SUCCESS', userId, `GDPR data export completed for user ${subjectId}`);

  return exportData;
}

/**
 * Delete user data (GDPR Article 17 - Right to Erasure)
 */
export async function deleteUserData(request: DataDeletionRequest): Promise<void> {
  const { userId, userRole, targetUserId, categories, reason } = request;

  const subjectId = targetUserId || userId;

  // Verify deletion rights
  if (userRole === 'Parent' && targetUserId && targetUserId !== userId) {
    // Parents can request deletion of their children's data
    const childOwnership = await db
      .select({ id: children.id })
      .from(children)
      .where(and(
        eq(children.parentId, userId),
        eq(children.id, targetUserId)
      ));

    if (!childOwnership.length) {
      throw new Error('Access denied: Cannot delete data for this user');
    }
  }

  // Start transaction for atomic deletion
  await db.transaction(async (tx) => {
    const deletionDate = new Date();

    // Delete/anonymize user data
    if (categories.includes(DataCategory.PERSONAL_DATA)) {
      await tx
        .update(users)
        .set({
          name: '[DELETED USER]',
          email: `deleted-${subjectId}@deleted.local`,
          deletedAt: deletionDate,
        })
        .where(eq(users.id, subjectId));
    }

    // Handle child data deletion
    if (categories.includes(DataCategory.SENSITIVE_DATA) || categories.includes(DataCategory.EDUCATIONAL_DATA)) {
      // Get children to delete
      const childrenToDelete = await tx
        .select({ id: children.id })
        .from(children)
        .where(userRole === 'Parent' ? eq(children.parentId, userId) : eq(children.id, subjectId));

      if (childrenToDelete.length > 0) {
        const childIds = childrenToDelete.map(child => child.id);

        // Soft delete children
        await tx
          .update(children)
          .set({ deletedAt: deletionDate })
          .where(sql`${children.id} = ANY(${childIds})`);

        // Delete associated educational data
        if (categories.includes(DataCategory.EDUCATIONAL_DATA)) {
          await tx
            .update(observations)
            .set({ deletedAt: deletionDate })
            .where(sql`${observations.childId} = ANY(${childIds})`);

          await tx
            .update(portfolioEntries)
            .set({ deletedAt: deletionDate })
            .where(sql`${portfolioEntries.childId} = ANY(${childIds})`);

          await tx
            .update(learningPaths)
            .set({ deletedAt: deletionDate })
            .where(sql`${learningPaths.childId} = ANY(${childIds})`);
        }
      }
    }

    // Log the deletion request
    await tx.insert(activityLogs).values({
      userId: subjectId,
      teamId: 1, // Default team - this should be dynamic in real implementation
      action: `GDPR_DATA_DELETION: ${reason}`,
      timestamp: deletionDate,
    });
  });

  logAuthEvent('LOGIN_SUCCESS', userId, `GDPR data deletion completed for user ${subjectId}: ${reason}`);
}

/**
 * Check data retention compliance and mark records for deletion
 */
export async function checkRetentionCompliance(): Promise<void> {
  const now = new Date();

  // Check each data type for retention compliance
  for (const [tableName, config] of Object.entries(DATA_MAPPING)) {
    const retentionDate = new Date();
    retentionDate.setMonth(retentionDate.getMonth() - config.retentionMonths);

    switch (tableName) {
      case 'children':
        // Mark children records that have passed retention period
        await db
          .update(children)
          .set({ deletedAt: now })
          .where(and(
            eq(children.deletedAt, null),
            sql`${children.updatedAt} < ${retentionDate}`
          ));
        break;

      case 'observations':
        await db
          .update(observations)
          .set({ deletedAt: now })
          .where(and(
            eq(observations.deletedAt, null),
            sql`${observations.updatedAt} < ${retentionDate}`
          ));
        break;

      case 'portfolioEntries':
        await db
          .update(portfolioEntries)
          .set({ deletedAt: now })
          .where(and(
            eq(portfolioEntries.deletedAt, null),
            sql`${portfolioEntries.updatedAt} < ${retentionDate}`
          ));
        break;

      case 'learningPaths':
        await db
          .update(learningPaths)
          .set({ deletedAt: now })
          .where(and(
            eq(learningPaths.deletedAt, null),
            sql`${learningPaths.updatedAt} < ${retentionDate}`
          ));
        break;

      case 'activityLogs':
        // Permanently delete old activity logs
        await db
          .delete(activityLogs)
          .where(sql`${activityLogs.timestamp} < ${retentionDate}`);
        break;
    }
  }

  console.log('[GDPR] Retention compliance check completed');
}

/**
 * Generate privacy notice for data collection
 */
export function generatePrivacyNotice(): string {
  return `
# Privacy Notice - Montessori School Management System

## Data We Collect
We collect and process the following categories of personal data:

### Child Information (Legal Basis: Consent & Legitimate Interests)
- Personal details: Name, date of birth, gender
- Medical information: Allergies, medical notes
- Emergency contacts
- Educational progress and observations
- Portfolio entries and learning assessments

### Parent/Guardian Information (Legal Basis: Contract)
- Contact details: Name, email
- Account information for system access

### Educational Staff Information (Legal Basis: Contract)
- Professional contact details
- System access logs

## How We Use Your Data
- Provide educational services and track child development
- Communicate with parents about their child's progress
- Maintain educational records as required by law
- Ensure child safety and wellbeing

## Data Retention
- Child educational records: ${RETENTION_PERIODS.CHILD_RECORDS} months
- System logs: ${RETENTION_PERIODS.ACTIVITY_LOGS} months
- User accounts: ${RETENTION_PERIODS.USER_ACCOUNTS} months after deletion

## Your Rights
Under GDPR, you have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Object to processing
- Data portability
- Withdraw consent

## Contact
To exercise your rights, contact: [School Data Protection Officer]
`;
}

/**
 * Validate consent for data processing
 */
export async function validateConsent(userId: number, childId: number, dataCategory: DataCategory): Promise<boolean> {
  // In a real implementation, this would check a consent management table
  // For now, we assume consent is given for legitimate educational purposes

  const validCategories = [
    DataCategory.EDUCATIONAL_DATA,
    DataCategory.SENSITIVE_DATA, // With explicit consent
  ];

  return validCategories.includes(dataCategory);
}

/**
 * Record consent withdrawal
 */
export async function withdrawConsent(userId: number, childId: number, dataCategory: DataCategory): Promise<void> {
  // In a real implementation, this would update consent records
  // and trigger data processing restrictions

  logAuthEvent('LOGIN_SUCCESS', userId, `Consent withdrawn for ${dataCategory} - Child ${childId}`);

  // Mark data for restricted processing or deletion
  // Implementation depends on specific consent requirements
}