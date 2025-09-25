 
import { db } from '@/db';
import { certificates } from '@/db/schema';

async function main() {
    const sampleCertificates = [
        {
            serial: 'CERT-234501',
            holderName: 'John Anderson',
            program: 'Master of Business Administration',
            issuedOn: '2024-01-15',
            institutionId: 1,
            qrHash: 'a7b3c9d2e8f4g1h5i6j8k0l3m7n2p9q4',
            metadata: JSON.stringify({
                graduationDate: '2024-01-15',
                gpa: '3.85',
                specialization: 'Strategic Management',
                honors: 'Magna Cum Laude'
            }),
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            serial: 'CERT-234502',
            holderName: 'Sarah Mitchell',
            program: 'Bachelor of Computer Science',
            issuedOn: '2024-03-20',
            institutionId: 1,
            qrHash: 'b8c4d0e9f5g2h6i7j9k1l4m8n3p0q5r7',
            metadata: JSON.stringify({
                graduationDate: '2024-03-20',
                gpa: '3.92',
                concentration: 'Software Engineering',
                honors: 'Summa Cum Laude'
            }),
            createdAt: new Date('2024-03-20').toISOString(),
            updatedAt: new Date('2024-03-20').toISOString(),
        },
        {
            serial: 'CERT-789301',
            holderName: 'Michael Chen',
            program: 'Executive MBA',
            issuedOn: '2024-02-10',
            institutionId: 2,
            qrHash: 'c9d5e1f0g6h3i8j2k5l9m4n1p7q8r2s6',
            metadata: JSON.stringify({
                graduationDate: '2024-02-10',
                gpa: '3.78',
                track: 'Technology Leadership',
                cohort: 'Executive Class 2024'
            }),
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            serial: 'CERT-789302',
            holderName: 'Lisa Rodriguez',
            program: 'Certificate in Digital Marketing',
            issuedOn: '2024-04-05',
            institutionId: 2,
            qrHash: 'd0e6f2g7h4i9j3k6l0m5n2p8q9r3s7t1',
            metadata: JSON.stringify({
                completionDate: '2024-04-05',
                grade: 'A',
                modules: ['SEO/SEM', 'Social Media', 'Analytics', 'Content Strategy'],
                totalHours: 120
            }),
            createdAt: new Date('2024-04-05').toISOString(),
            updatedAt: new Date('2024-04-05').toISOString(),
        },
        {
            serial: 'CERT-456701',
            holderName: 'David Wilson',
            program: 'Software Engineering Bootcamp',
            issuedOn: '2024-01-30',
            institutionId: 3,
            qrHash: 'e1f7g3h8i5j0k7l1m6n3p9q4r8s2t6u0',
            metadata: JSON.stringify({
                completionDate: '2024-01-30',
                finalGrade: 'Excellent',
                technologies: ['React', 'Node.js', 'Python', 'AWS'],
                portfolioProjects: 5
            }),
            createdAt: new Date('2024-01-30').toISOString(),
            updatedAt: new Date('2024-01-30').toISOString(),
        },
        {
            serial: 'CERT-456702',
            holderName: 'Emma Thompson',
            program: 'Data Science Certification',
            issuedOn: '2024-03-15',
            institutionId: 3,
            qrHash: 'f2g8h4i9j6k1l7m2n8p0q5r9s3t7u1v5',
            metadata: JSON.stringify({
                completionDate: '2024-03-15',
                finalScore: '95%',
                skills: ['Machine Learning', 'Python', 'SQL', 'Tableau'],
                capstoneProject: 'Predictive Analytics Model'
            }),
            createdAt: new Date('2024-03-15').toISOString(),
            updatedAt: new Date('2024-03-15').toISOString(),
        }
    ];

    await db.insert(certificates).values(sampleCertificates);
    
    console.log('✅ Certificates seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});