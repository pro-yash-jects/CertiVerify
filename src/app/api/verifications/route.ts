import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifications, certificates } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { serial, certificateId, status, confidence, notes } = requestBody;

    // Validate required fields
    if (!status) {
      return NextResponse.json({ 
        error: "Status is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (confidence === undefined || confidence === null) {
      return NextResponse.json({ 
        error: "Confidence is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate status values
    const validStatuses = ["valid", "invalid", "suspect"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Status must be one of: valid, invalid, suspect",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate confidence is a number
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      return NextResponse.json({ 
        error: "Confidence must be a valid number",
        code: "INVALID_CONFIDENCE" 
      }, { status: 400 });
    }

    // Validate that either serial or certificateId is provided
    if (!serial && !certificateId) {
      return NextResponse.json({ 
        error: "Either serial or certificateId must be provided",
        code: "MISSING_CERTIFICATE_IDENTIFIER" 
      }, { status: 400 });
    }

    // Get checked_by from Authorization Bearer token if present
    let checkedBy = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      checkedBy = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    let finalCertificateId = certificateId;

    // If serial is provided, find or create certificate
    if (serial && !certificateId) {
      // Try to find existing certificate by serial
      const existingCertificate = await db.select()
        .from(certificates)
        .where(eq(certificates.serial, serial))
        .limit(1);

      if (existingCertificate.length > 0) {
        finalCertificateId = existingCertificate[0].id;
      } else {
        // Create minimal certificate with auto-generated timestamps
        const newCertificate = await db.insert(certificates)
          .values({
            serial: serial,
            holderName: "Unknown",
            program: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          .returning();

        finalCertificateId = newCertificate[0].id;
      }
    }

    // If certificateId is provided, validate it exists
    if (certificateId) {
      const existingCertificate = await db.select()
        .from(certificates)
        .where(eq(certificates.id, certificateId))
        .limit(1);

      if (existingCertificate.length === 0) {
        return NextResponse.json({ 
          error: "Certificate not found",
          code: "CERTIFICATE_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Create verification record
    const newVerification = await db.insert(verifications)
      .values({
        certificateId: finalCertificateId,
        status: status,
        confidence: confidence,
        checkedBy: checkedBy,
        notes: notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    // Get the certificate info to return with verification
    const certificateInfo = await db.select()
      .from(certificates)
      .where(eq(certificates.id, finalCertificateId))
      .limit(1);

    const response = {
      ...newVerification[0],
      certificate: certificateInfo[0]
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}