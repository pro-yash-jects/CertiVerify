import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { institutions, certificates, flags, verifications } from '@/db/schema';
import { eq, like, and, or, desc, asc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Get single institution by ID
    const id = searchParams.get('id');
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const institution = await db.select().from(institutions)
        .where(eq(institutions.id, parseInt(id)))
        .limit(1);

      if (institution.length === 0) {
        return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
      }

      // Get counts for this institution
      const certificateCountResult = await db.select({ count: count() })
        .from(certificates)
        .where(eq(certificates.institutionId, parseInt(id)));

      const flagCountResult = await db.select({ count: count() })
        .from(flags)
        .leftJoin(certificates, eq(flags.certificateId, certificates.id))
        .where(eq(certificates.institutionId, parseInt(id)));

      const verificationCountResult = await db.select({ count: count() })
        .from(verifications)
        .leftJoin(certificates, eq(verifications.certificateId, certificates.id))
        .where(eq(certificates.institutionId, parseInt(id)));

      const institutionWithCounts = {
        ...institution[0],
        certificateCount: certificateCountResult[0]?.count || 0,
        flagCount: flagCountResult[0]?.count || 0,
        verificationCount: verificationCountResult[0]?.count || 0
      };

      return NextResponse.json(institutionWithCounts);
    }

    // Build query for list
    let query = db.select().from(institutions);

    if (search) {
      const searchCondition = or(
        like(institutions.name, `%${search}%`),
        like(institutions.code, `%${search}%`),
        like(institutions.contactEmail, `%${search}%`)
      );
      query = query.where(searchCondition);
    }

    // Apply sorting
    const sortField = sort === 'name' ? institutions.name :
                     sort === 'code' ? institutions.code :
                     sort === 'contactEmail' ? institutions.contactEmail :
                     sort === 'trusted' ? institutions.trusted :
                     institutions.createdAt;

    query = order === 'asc' ? query.orderBy(asc(sortField)) : query.orderBy(desc(sortField));

    const results = await query.limit(limit).offset(offset);

    // Get counts for each institution
    const institutionsWithCounts = await Promise.all(
      results.map(async (institution) => {
        const certificateCountResult = await db.select({ count: count() })
          .from(certificates)
          .where(eq(certificates.institutionId, institution.id));

        const flagCountResult = await db.select({ count: count() })
          .from(flags)
          .leftJoin(certificates, eq(flags.certificateId, certificates.id))
          .where(eq(certificates.institutionId, institution.id));

        const verificationCountResult = await db.select({ count: count() })
          .from(verifications)
          .leftJoin(certificates, eq(verifications.certificateId, certificates.id))
          .where(eq(certificates.institutionId, institution.id));

        return {
          ...institution,
          certificateCount: certificateCountResult[0]?.count || 0,
          flagCount: flagCountResult[0]?.count || 0,
          verificationCount: verificationCountResult[0]?.count || 0
        };
      })
    );

    return NextResponse.json(institutionsWithCounts);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for Authorization Bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authorization Bearer token required',
        code: 'MISSING_AUTH_TOKEN' 
      }, { status: 401 });
    }

    const requestBody = await request.json();
    const { name, code, contactEmail, trusted } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ 
        error: "Code is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedCode = code.trim();
    const sanitizedContactEmail = contactEmail?.trim().toLowerCase();

    // Check if name is unique
    const existingNameInstitution = await db.select()
      .from(institutions)
      .where(eq(institutions.name, sanitizedName))
      .limit(1);

    if (existingNameInstitution.length > 0) {
      return NextResponse.json({ 
        error: "Institution name already exists",
        code: "DUPLICATE_NAME" 
      }, { status: 400 });
    }

    // Check if code is unique
    const existingCodeInstitution = await db.select()
      .from(institutions)
      .where(eq(institutions.code, sanitizedCode))
      .limit(1);

    if (existingCodeInstitution.length > 0) {
      return NextResponse.json({ 
        error: "Institution code already exists",
        code: "DUPLICATE_CODE" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      name: sanitizedName,
      code: sanitizedCode,
      contactEmail: sanitizedContactEmail || null,
      trusted: trusted !== undefined ? trusted : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newInstitution = await db.insert(institutions)
      .values(insertData)
      .returning();

    // Add initial counts
    const institutionWithCounts = {
      ...newInstitution[0],
      certificateCount: 0,
      flagCount: 0,
      verificationCount: 0
    };

    return NextResponse.json(institutionWithCounts, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}