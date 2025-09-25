import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { flags, certificates } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved');

    let query = db.select({
      id: flags.id,
      reason: flags.reason,
      resolved: flags.resolved,
      createdAt: flags.createdAt,
      serial: certificates.serial,
      holderName: certificates.holderName
    })
    .from(flags)
    .leftJoin(certificates, eq(flags.certificateId, certificates.id))
    .orderBy(desc(flags.createdAt));

    if (resolved !== null) {
      const resolvedBool = resolved === 'true';
      query = query.where(eq(flags.resolved, resolvedBool));
    }

    const results = await query;

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const requestBody = await request.json();
    const { certificateId, reason } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!certificateId) {
      return NextResponse.json({ 
        error: "Certificate ID is required",
        code: "MISSING_CERTIFICATE_ID" 
      }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ 
        error: "Reason is required",
        code: "MISSING_REASON" 
      }, { status: 400 });
    }

    // Validate certificateId is a valid integer
    const parsedCertificateId = parseInt(certificateId);
    if (isNaN(parsedCertificateId)) {
      return NextResponse.json({ 
        error: "Certificate ID must be a valid number",
        code: "INVALID_CERTIFICATE_ID" 
      }, { status: 400 });
    }

    // Verify certificate exists
    const certificate = await db.select()
      .from(certificates)
      .where(eq(certificates.id, parsedCertificateId))
      .limit(1);

    if (certificate.length === 0) {
      return NextResponse.json({ 
        error: "Certificate not found",
        code: "CERTIFICATE_NOT_FOUND" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Create the flag
    const newFlag = await db.insert(flags)
      .values({
        certificateId: parsedCertificateId,
        reason: reason.trim(),
        resolved: false,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    // Get the created flag with certificate info
    const flagWithCertificate = await db.select({
      id: flags.id,
      reason: flags.reason,
      resolved: flags.resolved,
      createdAt: flags.createdAt,
      serial: certificates.serial,
      holderName: certificates.holderName
    })
    .from(flags)
    .leftJoin(certificates, eq(flags.certificateId, certificates.id))
    .where(eq(flags.id, newFlag[0].id))
    .limit(1);

    return NextResponse.json(flagWithCertificate[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}