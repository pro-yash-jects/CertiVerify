 
import { db } from '@/db';
import { institutions } from '@/db/schema';

async function main() {
    const sampleInstitutions = [
        {
            name: 'State University',
            code: 'STATEU',
            contactEmail: 'registrar@stateu.edu',
            trusted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Business School',
            code: 'BSCHOOL',
            contactEmail: 'admin@bschool.edu',
            trusted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Tech Institute',
            code: 'TECHI',
            contactEmail: 'verification@techi.edu',
            trusted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(institutions).values(sampleInstitutions);
    
    console.log('✅ Institutions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});