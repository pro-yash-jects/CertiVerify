import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { flags, certificates, institutions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    
    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { resolved } = requestBody;

    // Security check: reject if user ID fields provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (typeof resolved !== 'boolean') {
      return NextResponse.json({ 
        error: "Resolved field must be a boolean",
        code: "INVALID_RESOLVED_TYPE" 
      }, { status: 400 });
    }

    // Check if flag exists
    const existingFlag = await db.select()
      .from(flags)
      .where(eq(flags.id, parseInt(id)))
      .limit(1);

    if (existingFlag.length === 0) {
      return NextResponse.json({ 
        error: 'Flag not found',
        code: 'FLAG_NOT_FOUND' 
      }, { status: 404 });
    }

    // Update the flag
    const updated = await db.update(flags)
      .set({
        resolved,
        updatedAt: new Date().toISOString()
      })
      .where(eq(flags.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Flag not found',
        code: 'FLAG_NOT_FOUND' 
      }, { status: 404 });
    }

    // Get the updated flag with certificate information
    const flagWithCertificate = await db.select({
      id: flags.id,
      certificateId: flags.certificateId,
      reason: flags.reason,
      resolved: flags.resolved,
      createdAt: flags.createdAt,
      updatedAt: flags.updatedAt,
      certificate: {
        id: certificates.id,
        serial: certificates.serial,
        holderName: certificates.holderName,
        program: certificates.program,
        issuedOn: certificates.issuedOn,
        qrHash: certificates.qrHash,
        metadata: certificates.metadata,
        institution: {
          id: institutions.id,
          name: institutions.name,
          code: institutions.code,
          contactEmail: institutions.contactEmail,
          trusted: institutions.trusted
        }
      }
    })
    .from(flags)
    .leftJoin(certificates, eq(flags.certificateId, certificates.id))
    .leftJoin(institutions, eq(certificates.institutionId, institutions.id))
    .where(eq(flags.id, parseInt(id)))
    .limit(1);

    if (flagWithCertificate.length === 0) {
      return NextResponse.json({ 
        error: 'Flag not found',
        code: 'FLAG_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(flagWithCertificate[0], { status: 200 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}