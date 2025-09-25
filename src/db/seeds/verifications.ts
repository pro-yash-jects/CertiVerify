import { db } from '@/db';
import { verifications } from '@/db/schema';

async function main() {
    const sampleVerifications = [
        {
            certificateId: 1,
            status: 'valid',
            confidence: 0.95,
            checkedBy: 'user123',
            notes: 'All documentation verified',
            createdAt: new Date('2024-12-01T10:15:00Z').toISOString(),
            updatedAt: new Date('2024-12-01T10:15:00Z').toISOString(),
        },
        {
            certificateId: 1,
            status: 'valid',
            confidence: 0.88,
            checkedBy: null,
            notes: null,
            createdAt: new Date('2024-12-03T14:30:00Z').toISOString(),
            updatedAt: new Date('2024-12-03T14:30:00Z').toISOString(),
        },
        {
            certificateId: 2,
            status: 'valid',
            confidence: 0.92,
            checkedBy: 'admin456',
            notes: 'Graduation records confirmed',
            createdAt: new Date('2024-12-05T09:45:00Z').toISOString(),
            updatedAt: new Date('2024-12-05T09:45:00Z').toISOString(),
        },
        {
            certificateId: 2,
            status: 'suspect',
            confidence: 0.65,
            checkedBy: 'reviewer789',
            notes: 'Minor discrepancy in dates',
            createdAt: new Date('2024-12-07T16:20:00Z').toISOString(),
            updatedAt: new Date('2024-12-07T16:20:00Z').toISOString(),
        },
        {
            certificateId: 3,
            status: 'invalid',
            confidence: 0.15,
            checkedBy: 'auditor001',
            notes: 'Institution not accredited for this program',
            createdAt: new Date('2024-12-10T11:00:00Z').toISOString(),
            updatedAt: new Date('2024-12-10T11:00:00Z').toISOString(),
        },
        {
            certificateId: 3,
            status: 'invalid',
            confidence: 0.20,
            checkedBy: 'system',
            notes: 'Automated check failed',
            createdAt: new Date('2024-12-12T08:30:00Z').toISOString(),
            updatedAt: new Date('2024-12-12T08:30:00Z').toISOString(),
        },
        {
            certificateId: 4,
            status: 'valid',
            confidence: 0.97,
            checkedBy: 'validator200',
            notes: 'Perfect match with institution records',
            createdAt: new Date('2024-12-14T13:15:00Z').toISOString(),
            updatedAt: new Date('2024-12-14T13:15:00Z').toISOString(),
        },
        {
            certificateId: 4,
            status: 'valid',
            confidence: 0.89,
            checkedBy: null,
            notes: 'Digital signature verified',
            createdAt: new Date('2024-12-16T15:45:00Z').toISOString(),
            updatedAt: new Date('2024-12-16T15:45:00Z').toISOString(),
        },
        {
            certificateId: 5,
            status: 'suspect',
            confidence: 0.72,
            checkedBy: 'tech_reviewer',
            notes: 'Unusual certificate format',
            createdAt: new Date('2024-12-18T12:00:00Z').toISOString(),
            updatedAt: new Date('2024-12-18T12:00:00Z').toISOString(),
        },
        {
            certificateId: 5,
            status: 'valid',
            confidence: 0.85,
            checkedBy: 'manual_check',
            notes: 'Re-verified with institution',
            createdAt: new Date('2024-12-20T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-12-20T10:30:00Z').toISOString(),
        },
        {
            certificateId: 6,
            status: 'valid',
            confidence: 0.93,
            checkedBy: 'data_team',
            notes: 'Cross-referenced with enrollment data',
            createdAt: new Date('2024-12-22T14:15:00Z').toISOString(),
            updatedAt: new Date('2024-12-22T14:15:00Z').toISOString(),
        },
        {
            certificateId: 6,
            status: 'valid',
            confidence: 0.91,
            checkedBy: null,
            notes: null,
            createdAt: new Date('2024-12-24T09:00:00Z').toISOString(),
            updatedAt: new Date('2024-12-24T09:00:00Z').toISOString(),
        }
    ];

    await db.insert(verifications).values(sampleVerifications);
    
    console.log('✅ Verifications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});