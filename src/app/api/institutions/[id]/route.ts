import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { institutions } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check for Authorization Bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authorization Bearer token is required',
        code: 'MISSING_AUTHORIZATION' 
      }, { status: 401 });
    }

    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const institutionId = parseInt(id);

    // Check if institution exists
    const existingInstitution = await db.select()
      .from(institutions)
      .where(eq(institutions.id, institutionId))
      .limit(1);

    if (existingInstitution.length === 0) {
      return NextResponse.json({ 
        error: 'Institution not found' 
      }, { status: 404 });
    }

    const requestBody = await request.json();
    const { name, code, contactEmail, trusted } = requestBody;

    // Prepare update data with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add fields if provided
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ 
          error: "Name is required and must be a non-empty string",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }

      // Check name uniqueness (excluding current institution)
      const existingName = await db.select()
        .from(institutions)
        .where(and(
          eq(institutions.name, name.trim()),
          ne(institutions.id, institutionId)
        ))
        .limit(1);

      if (existingName.length > 0) {
        return NextResponse.json({ 
          error: "Institution name must be unique",
          code: "NAME_ALREADY_EXISTS" 
        }, { status: 400 });
      }

      updateData.name = name.trim();
    }

    if (code !== undefined) {
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return NextResponse.json({ 
          error: "Code is required and must be a non-empty string",
          code: "INVALID_CODE" 
        }, { status: 400 });
      }

      // Check code uniqueness (excluding current institution)
      const existingCode = await db.select()
        .from(institutions)
        .where(and(
          eq(institutions.code, code.trim()),
          ne(institutions.id, institutionId)
        ))
        .limit(1);

      if (existingCode.length > 0) {
        return NextResponse.json({ 
          error: "Institution code must be unique",
          code: "CODE_ALREADY_EXISTS" 
        }, { status: 400 });
      }

      updateData.code = code.trim();
    }

    if (contactEmail !== undefined) {
      if (contactEmail !== null && contactEmail !== '') {
        if (typeof contactEmail !== 'string') {
          return NextResponse.json({ 
            error: "Contact email must be a string",
            code: "INVALID_CONTACT_EMAIL" 
          }, { status: 400 });
        }
        updateData.contactEmail = contactEmail.toLowerCase().trim();
      } else {
        updateData.contactEmail = null;
      }
    }

    if (trusted !== undefined) {
      if (typeof trusted !== 'boolean') {
        return NextResponse.json({ 
          error: "Trusted must be a boolean value",
          code: "INVALID_TRUSTED" 
        }, { status: 400 });
      }
      updateData.trusted = trusted;
    }

    // Update the institution
    const updated = await db.update(institutions)
      .set(updateData)
      .where(eq(institutions.id, institutionId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update institution' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}