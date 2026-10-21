import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog, requireAdminApi } from "@/lib/admin-auth";

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

  const editoras = await prisma.editora.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ editoras });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nome da editora é obrigatório." }, { status: 400 });
  }

  const slug = slugify(body?.slug ? String(body.slug) : name);
  const existing = await prisma.editora.findFirst({
    where: { OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }] },
  });
  if (existing && !body?.id) {
    return NextResponse.json(
      { error: `A editora "${existing.name}" já existe na base de dados.` },
      { status: 409 }
    );
  }

  const saved = body?.id
    ? await prisma.editora.update({
        where: { id: String(body.id) },
        data: {
          name,
          country: body.country ? String(body.country).trim() : null,
          logo: body.logo ? String(body.logo).trim() : null,
          phone: body.phone ? String(body.phone).trim() : null,
          email: body.email ? String(body.email).trim() : null,
          address: body.address ? String(body.address).trim() : null,
          website: body.website ? String(body.website).trim() : null,
          description: body.description ? String(body.description).trim() : null,
        },
      })
    : await prisma.editora.create({
        data: {
          slug,
          name,
          country: body.country ? String(body.country).trim() : null,
          logo: body.logo ? String(body.logo).trim() : null,
          phone: body.phone ? String(body.phone).trim() : null,
          email: body.email ? String(body.email).trim() : null,
          address: body.address ? String(body.address).trim() : null,
          website: body.website ? String(body.website).trim() : null,
          description: body.description ? String(body.description).trim() : null,
        },
      });

  await recordAuditLog({
    action: body?.id ? "EDITORA_UPDATED" : "EDITORA_CREATED",
    entityType: "Editora",
    entityId: saved.id,
    actorId: guard.actor.id,
    actorEmail: guard.actor.email,
    details: { name: saved.name, country: saved.country },
  });

  return NextResponse.json({ ok: true, editora: saved });
}
