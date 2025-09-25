import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifications, certificates } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Optional authentication check - extract Bearer token if present
    const authHeader = request.headers.get('authorization');
    let authenticatedUser = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        authenticatedUser = await getCurrentUser(request);
      } catch (error) {
        // Continue without authentication if token is invalid
        console.log('Invalid token provided, continuing as public request');
      }
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate limit parameter
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 50) : 10;
    
    if (limitParam && (isNaN(limit) || limit < 1)) {
      return NextResponse.json({ 
        error: "Limit must be a positive number",
        code: "INVALID_LIMIT" 
      }, { status: 400 });
    }

    // Query verifications with certificate data using leftJoin
    const results = await db
      .select({
        id: verifications.id,
        status: verifications.status,
        confidence: verifications.confidence,
        checkedBy: verifications.checkedBy,
        notes: verifications.notes,
        createdAt: verifications.createdAt,
        serial: certificates.serial,
        holderName: certificates.holderName
      })
      .from(verifications)
      .leftJoin(certificates, eq(verifications.certificateId, certificates.id))
      .orderBy(desc(verifications.createdAt))
      .limit(limit);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET /api/verifications/recent error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}