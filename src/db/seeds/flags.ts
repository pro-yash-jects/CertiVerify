 
import { db } from '@/db';
import { flags } from '@/db/schema';

async function main() {
    const sampleFlags = [
        {
            certificateId: 2,
            reason: 'Graduation date inconsistent with program duration',
            resolved: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            certificateId: 5,
            reason: 'Unusual issuing authority format detected',
            resolved: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(flags).values(sampleFlags);
    
    console.log('✅ Flags seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});