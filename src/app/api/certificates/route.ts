import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { certificates, institutions } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let dbQuery = db.select({
      id: certificates.id,
      serial: certificates.serial,
      holderName: certificates.holderName,
      program: certificates.program,
      issuedOn: certificates.issuedOn,
      institutionId: certificates.institutionId,
      institutionName: institutions.name,
      createdAt: certificates.createdAt
    })
    .from(certificates)
    .leftJoin(institutions, eq(certificates.institutionId, institutions.id));

    if (query) {
      dbQuery = dbQuery.where(
        or(
          like(certificates.serial, `%${query}%`),
          like(certificates.holderName, `%${query}%`)
        )
      );
    }

    const results = await dbQuery.limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authorization Bearer token required',
        code: 'AUTHORIZATION_REQUIRED' 
      }, { status: 401 });
    }

    const requestBody = await request.json();
    const { serial, holderName, program, issuedOn, institutionId, qrHash, metadata } = requestBody;

    // Validate required fields
    if (!serial || !holderName) {
      return NextResponse.json({ 
        error: 'Required fields are missing: serial and holderName are required',
        code: 'MISSING_REQUIRED_FIELDS' 
      }, { status: 400 });
    }

    // Trim and sanitize inputs
    const sanitizedData = {
      serial: serial.trim(),
      holderName: holderName.trim(),
      program: program?.trim() || null,
      issuedOn: issuedOn || null,
      institutionId: institutionId || null,
      qrHash: qrHash?.trim() || null,
      metadata: metadata || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check for duplicate serial
    const existingCertificate = await db.select()
      .from(certificates)
      .where(eq(certificates.serial, sanitizedData.serial))
      .limit(1);

    if (existingCertificate.length > 0) {
      return NextResponse.json({ 
        error: 'Certificate with this serial number already exists',
        code: 'DUPLICATE_SERIAL' 
      }, { status: 400 });
    }

    // Validate institutionId if provided
    if (sanitizedData.institutionId) {
      const institution = await db.select()
        .from(institutions)
        .where(eq(institutions.id, sanitizedData.institutionId))
        .limit(1);

      if (institution.length === 0) {
        return NextResponse.json({ 
          error: 'Institution not found',
          code: 'INSTITUTION_NOT_FOUND' 
        }, { status: 400 });
      }
    }

    const newCertificate = await db.insert(certificates)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newCertificate[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}