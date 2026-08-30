import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { casCliniques } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(casCliniques)
        .where(eq(casCliniques.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Case not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filtering, search, and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const profil = searchParams.get('profil');
    const specialite = searchParams.get('specialite');
    const niveau = searchParams.get('niveau');
    const casNumeroParam = searchParams.get('cas_numero');

    const conditions = [] as any[];

    // Filter conditions
    if (profil) {
      const p = profil.trim();
      // use LIKE to be tolerant to accents/case/extra text
      conditions.push(like(casCliniques.profil, `%${p}%`));
    }
    if (specialite) {
      const s = specialite.trim();
      // use LIKE to be tolerant to accents/case/extra text
      conditions.push(like(casCliniques.specialite, `%${s}%`));
    }
    if (niveau) {
      const nv = niveau.toLowerCase();
      if (nv.includes('debut')) {
        conditions.push(
          or(
            eq(casCliniques.niveau, 'débutant'),
            eq(casCliniques.niveau, 'debutant')
          )
        );
      } else if (nv.includes('avanc')) {
        conditions.push(
          or(
            eq(casCliniques.niveau, 'avancé'),
            eq(casCliniques.niveau, 'avance')
          )
        );
      } else {
        conditions.push(eq(casCliniques.niveau, niveau));
      }
    }
    if (casNumeroParam && !isNaN(parseInt(casNumeroParam))) {
      conditions.push(eq(casCliniques.casNumero, parseInt(casNumeroParam)));
    }

    // Search condition
    if (search) {
      const searchCondition = or(
        like(casCliniques.titreCas, `%${search}%`),
        like(casCliniques.descriptionSituation, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    let query = db.select().from(casCliniques);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'profil',
      'niveau',
      'casNumero',
      'titreCas',
      'descriptionSituation',
      'informationsCles',
      'attenduPrompt'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            error: `Required field '${field}' is missing`,
            code: 'MISSING_REQUIRED_FIELD'
          },
          { status: 400 }
        );
      }
    }

    // Validate casNumero is a number
    if (typeof body.casNumero !== 'number' || isNaN(body.casNumero)) {
      return NextResponse.json(
        {
          error: 'casNumero must be a valid number',
          code: 'INVALID_CAS_NUMERO'
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      profil: body.profil.trim(),
      specialite: body.specialite ? body.specialite.trim() : null,
      niveau: body.niveau.trim(),
      casNumero: body.casNumero,
      titreCas: body.titreCas.trim(),
      descriptionSituation: body.descriptionSituation.trim(),
      symptomes: body.symptomes ? body.symptomes.trim() : null,
      antecedents: body.antecedents ? body.antecedents.trim() : null,
      informationsCles: body.informationsCles.trim(),
      attenduPrompt: body.attenduPrompt.trim(),
      formatRecommande: body.formatRecommande ? body.formatRecommande.trim() : null,
      patientAge: body.patientAge !== undefined && body.patientAge !== null ? body.patientAge : null,
      patientSexe: body.patientSexe ? body.patientSexe.trim() : null,
      patientActe: body.patientActe ? body.patientActe.trim() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRecord = await db
      .insert(casCliniques)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(casCliniques)
      .where(eq(casCliniques.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Case not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Add fields if provided
    if (body.profil !== undefined) updates.profil = body.profil.trim();
    if (body.specialite !== undefined) updates.specialite = body.specialite ? body.specialite.trim() : null;
    if (body.niveau !== undefined) updates.niveau = body.niveau.trim();
    if (body.casNumero !== undefined) {
      if (typeof body.casNumero !== 'number' || isNaN(body.casNumero)) {
        return NextResponse.json(
          {
            error: 'casNumero must be a valid number',
            code: 'INVALID_CAS_NUMERO'
          },
          { status: 400 }
        );
      }
      updates.casNumero = body.casNumero;
    }
    if (body.titreCas !== undefined) updates.titreCas = body.titreCas.trim();
    if (body.descriptionSituation !== undefined) updates.descriptionSituation = body.descriptionSituation.trim();
    if (body.symptomes !== undefined) updates.symptomes = body.symptomes ? body.symptomes.trim() : null;
    if (body.antecedents !== undefined) updates.antecedents = body.antecedents ? body.antecedents.trim() : null;
    if (body.informationsCles !== undefined) updates.informationsCles = body.informationsCles.trim();
    if (body.attenduPrompt !== undefined) updates.attenduPrompt = body.attenduPrompt.trim();
    if (body.formatRecommande !== undefined) updates.formatRecommande = body.formatRecommande ? body.formatRecommande.trim() : null;
    if (body.patientAge !== undefined) updates.patientAge = body.patientAge !== null ? body.patientAge : null;
    if (body.patientSexe !== undefined) updates.patientSexe = body.patientSexe ? body.patientSexe.trim() : null;
    if (body.patientActe !== undefined) updates.patientActe = body.patientActe ? body.patientActe.trim() : null;

    const updated = await db
      .update(casCliniques)
      .set(updates)
      .where(eq(casCliniques.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(casCliniques)
      .where(eq(casCliniques.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Case not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(casCliniques)
      .where(eq(casCliniques.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Case deleted successfully',
        deleted: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}