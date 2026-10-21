import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog, requireAdminApi } from "@/lib/admin-auth";
import { validateAndNormalizeIsbn } from "@/lib/isbn";
import { Currency, EducationLevel } from "@/lib/enums";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const [books, categories, editoras] = await Promise.all([
    prisma.book.findMany({
      include: {
        category: { select: { id: true, name: true } },
        editoraRef: { select: { id: true, name: true } },
        prices: true,
        stockItems: { include: { warehouse: true } },
      },
      orderBy: [{ active: "desc" }, { title: "asc" }],
    }),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { name: "asc" } }),
    prisma.editora.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({ books, categories, editoras });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const author = String(body?.author ?? "").trim();
  const editoraName = String(body?.editora ?? "").trim();

  if (!title || !author || !editoraName) {
    return NextResponse.json(
      { error: "Título, autor e editora são obrigatórios." },
      { status: 400 }
    );
  }

  const isbnValidation = validateAndNormalizeIsbn(body?.isbn, { strictChecksum: true });
  if (!isbnValidation.valid) {
    return NextResponse.json(
      { error: isbnValidation.warning ?? "ISBN inválido." },
      { status: 400 }
    );
  }

  if (isbnValidation.normalized) {
    const duplicate = await prisma.book.findUnique({
      where: { isbnNormalized: isbnValidation.normalized },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: `Já existe um livro registado com este ISBN (${duplicate.title}).` },
        { status: 409 }
      );
    }
  }

  const category =
    (body?.categoryId
      ? await prisma.category.findUnique({ where: { id: body.categoryId } })
      : null) ??
    (await prisma.category.findFirst({ where: { slug: "escolar" } })) ??
    (await prisma.category.findFirst());

  if (!category) {
    return NextResponse.json({ error: "Nenhuma categoria configurada." }, { status: 400 });
  }

  const edSlug = slugify(editoraName) || "editora";
  const editoraRec = await prisma.editora.upsert({
    where: { slug: edSlug },
    update: {},
    create: { slug: edSlug, name: editoraName },
  });

  const baseSlug = slugify(title) || `livro-${Date.now()}`;
  const slugExists = await prisma.book.findUnique({ where: { slug: baseSlug } });
  const slug = slugExists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  const educationLevel = (Object.values(EducationLevel) as string[]).includes(
    body?.educationLevel
  )
    ? (body.educationLevel as EducationLevel)
    : null;

  const created = await prisma.book.create({
    data: {
      slug,
      title,
      author,
      editora: editoraRec.name,
      editoraId: editoraRec.id,
      categoryId: category.id,
      description: body?.description ? String(body.description).trim() : null,
      isbn: body?.isbn ? String(body.isbn).trim() : null,
      isbnNormalized: isbnValidation.normalized,
      coverUrl: body?.coverUrl ? String(body.coverUrl).trim() : null,
      pages: body?.pages ? Number(body.pages) : null,
      year: body?.year ? Number(body.year) : null,
      featured: Boolean(body?.featured),
      educationLevel,
      schoolGrade: body?.schoolGrade ? String(body.schoolGrade).trim() : null,
      subject: body?.subject ? String(body.subject).trim() : null,
      academicYear: body?.academicYear ? Number(body.academicYear) : null,
      countryOrigin: body?.countryOrigin ? String(body.countryOrigin).trim() : null,
      allowPreorder: Boolean(body?.allowPreorder),
      allowQuote: body?.allowQuote !== false,
    },
  });

  const priceInputs: { currency: Currency; value: unknown; active?: boolean }[] = [
    { currency: "KZ", value: body?.priceKZ, active: body?.activeKZ ?? true },
    { currency: "MT", value: body?.priceMT, active: body?.activeMT ?? true },
    { currency: "EUR", value: body?.priceEUR, active: body?.activeEUR ?? true },
    { currency: "BRL", value: body?.priceBRL, active: body?.activeBRL ?? true },
  ];

  for (const p of priceInputs) {
    const num = Number(p.value);
    if (Number.isFinite(num) && num >= 0) {
      await prisma.price.upsert({
        where: { bookId_currency: { bookId: created.id, currency: p.currency } },
        update: { amount: num, marketActive: p.active ?? true },
        create: {
          bookId: created.id,
          currency: p.currency,
          amount: num,
          marketActive: p.active ?? true,
        },
      });
    }
  }

  await recordAuditLog({
    action: "BOOK_CREATED",
    entityType: "Book",
    entityId: created.id,
    actorId: guard.actor.id,
    actorEmail: guard.actor.email,
    details: { slug: created.slug, title: created.title, isbn: created.isbn },
  });

  return NextResponse.json({ ok: true, book: created });
}

export async function PATCH(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  const id = String(body?.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Identificador do livro em falta." }, { status: 400 });
  }

  let isbnNormalized: string | null | undefined = undefined;
  if (body?.isbn !== undefined) {
    const check = validateAndNormalizeIsbn(body.isbn, { strictChecksum: false });
    if (!check.valid) {
      return NextResponse.json({ error: check.warning ?? "ISBN inválido." }, { status: 400 });
    }
    isbnNormalized = check.normalized;
  }

  const updated = await prisma.book.update({
    where: { id },
    data: {
      ...(body.title ? { title: String(body.title).trim() } : {}),
      ...(body.author ? { author: String(body.author).trim() } : {}),
      ...(body.editora ? { editora: String(body.editora).trim() } : {}),
      ...(body.categoryId ? { categoryId: String(body.categoryId) } : {}),
      ...(body.description !== undefined
        ? { description: body.description ? String(body.description).trim() : null }
        : {}),
      ...(body.isbn !== undefined
        ? { isbn: body.isbn ? String(body.isbn).trim() : null, isbnNormalized }
        : {}),
      ...(body.coverUrl !== undefined
        ? { coverUrl: body.coverUrl ? String(body.coverUrl).trim() : null }
        : {}),
      ...(body.featured !== undefined ? { featured: Boolean(body.featured) } : {}),
      ...(body.active !== undefined ? { active: Boolean(body.active) } : {}),
      ...(body.allowPreorder !== undefined
        ? { allowPreorder: Boolean(body.allowPreorder) }
        : {}),
      ...(body.allowQuote !== undefined ? { allowQuote: Boolean(body.allowQuote) } : {}),
      ...(body.educationLevel !== undefined
        ? { educationLevel: body.educationLevel || null }
        : {}),
      ...(body.schoolGrade !== undefined
        ? { schoolGrade: body.schoolGrade ? String(body.schoolGrade).trim() : null }
        : {}),
      ...(body.subject !== undefined
        ? { subject: body.subject ? String(body.subject).trim() : null }
        : {}),
      ...(body.academicYear !== undefined
        ? { academicYear: body.academicYear ? Number(body.academicYear) : null }
        : {}),
    },
  });

  if (Array.isArray(body.prices)) {
    for (const p of body.prices as {
      currency: Currency;
      amount: number;
      marketActive?: boolean;
    }[]) {
      if ((Object.values(Currency) as string[]).includes(p.currency)) {
        await prisma.price.upsert({
          where: { bookId_currency: { bookId: id, currency: p.currency } },
          update: {
            amount: Number(p.amount) || 0,
            ...(p.marketActive !== undefined ? { marketActive: Boolean(p.marketActive) } : {}),
          },
          create: {
            bookId: id,
            currency: p.currency,
            amount: Number(p.amount) || 0,
            marketActive: p.marketActive ?? true,
          },
        });
      }
    }
  }

  await recordAuditLog({
    action: "BOOK_UPDATED",
    entityType: "Book",
    entityId: id,
    actorId: guard.actor.id,
    actorEmail: guard.actor.email,
    details: { title: updated.title, active: updated.active, featured: updated.featured },
  });

  return NextResponse.json({ ok: true, book: updated });
}
