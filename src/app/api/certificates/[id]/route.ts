import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { certificates, institutions, verifications } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Get certificate with institution info
    const certificateResult = await db
      .select({
        certificate: certificates,
        institution: {
          name: institutions.name,
          code: institutions.code
        }
      })
      .from(certificates)
      .leftJoin(institutions, eq(certificates.institutionId, institutions.id))
      .where(eq(certificates.id, parseInt(id)))
      .limit(1);

    if (certificateResult.length === 0) {
      return NextResponse.json({
        error: 'Certificate not found'
      }, { status: 404 });
    }

    // Get latest 10 verifications for this certificate
    const certificateVerifications = await db
      .select()
      .from(verifications)
      .where(eq(verifications.certificateId, parseInt(id)))
      .orderBy(desc(verifications.createdAt))
      .limit(10);

    const result = {
      ...certificateResult[0].certificate,
      institution: certificateResult[0].institution,
      verifications: certificateVerifications
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check for Authorization Bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'Authorization Bearer token required'
      }, { status: 401 });
    }

    const requestBody = await request.json();
    const {
      serial,
      holderName,
      program,
      issuedOn,
      institutionId,
      qrHash,
      metadata
    } = requestBody;

    // Check if certificate exists
    const existingCertificate = await db
      .select()
      .from(certificates)
      .where(eq(certificates.id, parseInt(id)))
      .limit(1);

    if (existingCertificate.length === 0) {
      return NextResponse.json({
        error: 'Certificate not found'
      }, { status: 404 });
    }

    // Validate serial uniqueness if updating serial
    if (serial && serial !== existingCertificate[0].serial) {
      const serialExists = await db
        .select()
        .from(certificates)
        .where(and(
          eq(certificates.serial, serial),
          eq(certificates.id, parseInt(id))
        ))
        .limit(1);

      // Check if another certificate has this serial
      const otherCertificateWithSerial = await db
        .select()
        .from(certificates)
        .where(eq(certificates.serial, serial))
        .limit(1);

      if (otherCertificateWithSerial.length > 0 && otherCertificateWithSerial[0].id !== parseInt(id)) {
        return NextResponse.json({
          error: 'Serial number must be unique',
          code: 'SERIAL_NOT_UNIQUE'
        }, { status: 400 });
      }
    }

    // Prepare update data - only include provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (serial !== undefined) updateData.serial = serial;
    if (holderName !== undefined) updateData.holderName = holderName;
    if (program !== undefined) updateData.program = program;
    if (issuedOn !== undefined) updateData.issuedOn = issuedOn;
    if (institutionId !== undefined) updateData.institutionId = institutionId;
    if (qrHash !== undefined) updateData.qrHash = qrHash;
    if (metadata !== undefined) updateData.metadata = metadata;

    // Update the certificate
    const updatedCertificate = await db
      .update(certificates)
      .set(updateData)
      .where(eq(certificates.id, parseInt(id)))
      .returning();

    if (updatedCertificate.length === 0) {
      return NextResponse.json({
        error: 'Failed to update certificate'
      }, { status: 500 });
    }

    return NextResponse.json(updatedCertificate[0]);

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}