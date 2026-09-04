import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BOOKS } from "../data/books";
import { EDITORAS } from "../data/editoras";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Categorias hierárquicas — corrige "Categorias rígidas"/"Hierarquia
// inexistente". Os 4 nomes de topo mantêm-se iguais aos de data/books.ts
// para que a migração dos livros existentes não exija reclassificar cada
// título à mão; as subcategorias ficam prontas para uso futuro.
// ---------------------------------------------------------------------------
const CATEGORY_TREE = [
  {
    slug: "escolar",
    name: "Escolar",
    description: "Manuais escolares alinhados aos currículos nacionais, do ensino primário ao superior.",
    faq: [
      { pergunta: "Os manuais seguem o currículo oficial?", resposta: "Sim, os títulos desta categoria seguem o currículo nacional do respetivo país e ano letivo." },
    ],
    children: [
      { slug: "ensino-primario", name: "Ensino Primário" },
      { slug: "ensino-secundario", name: "Ensino Secundário" },
      { slug: "ensino-superior", name: "Ensino Superior" },
    ],
  },
  {
    slug: "ficcao",
    name: "Ficção",
    description: "Romance, ficção científica e literatura policial de autores lusófonos e internacionais.",
    faq: [],
    children: [
      { slug: "romance", name: "Romance" },
      { slug: "policial", name: "Policial" },
      { slug: "ficcao-cientifica", name: "Ficção Científica" },
    ],
  },
  {
    slug: "infantil",
    name: "Infantil",
    description: "Livros para crianças organizados por faixa etária, dos 3 aos 8 anos.",
    faq: [],
    children: [
      { slug: "infantil-3-5-anos", name: "Infantil 3-5 anos" },
      { slug: "infantil-6-8-anos", name: "Infantil 6-8 anos" },
    ],
  },
  {
    slug: "nao-ficcao",
    name: "Não-ficção",
    description: "Ensaio, biografia e obras de referência.",
    faq: [],
    children: [],
  },
];

async function seedCategories() {
  const idByName = new Map<string, string>();
  for (const top of CATEGORY_TREE) {
    const parent = await prisma.category.upsert({
      where: { slug: top.slug },
      update: { name: top.name, description: top.description, faq: top.faq },
      create: { slug: top.slug, name: top.name, description: top.description, faq: top.faq },
    });
    idByName.set(top.name, parent.id);

    for (const child of top.children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: parent.id },
        create: { slug: child.slug, name: child.name, parentId: parent.id },
      });
    }
  }
  return idByName;
}

async function seedEditoras() {
  const idByName = new Map<string, string>();
  for (const e of EDITORAS) {
    const created = await prisma.editora.upsert({
      where: { slug: e.slug },
      update: {
        name: e.name,
        country: e.country,
        logo: e.logo,
        phone: e.phone,
        email: e.email,
        address: e.address,
      },
      create: {
        slug: e.slug,
        name: e.name,
        country: e.country,
        logo: e.logo,
        phone: e.phone,
        email: e.email,
        address: e.address,
      },
    });
    idByName.set(e.name, created.id);
  }
  return idByName;
}

async function seedBooks(categoryIdByName: Map<string, string>, editoraIdByName: Map<string, string>) {
  for (const book of BOOKS) {
    const categoryId = categoryIdByName.get(book.category);
    if (!categoryId) {
      console.warn(`Categoria "${book.category}" não encontrada para o livro ${book.slug} — a saltar.`);
      continue;
    }
    const editoraId = editoraIdByName.get(book.editora) ?? null;

    const created = await prisma.book.upsert({
      where: { slug: book.slug },
      update: {
        title: book.title,
        author: book.author,
        editora: book.editora,
        editoraId,
        categoryId,
        description: book.description,
        isbn: book.isbn,
        coverUrl: book.coverUrl,
        pdfUrl: book.downloadUrl,
        pages: book.pages,
        year: book.year,
        free: Boolean(book.free),
        featured: Boolean(book.featured),
      },
      create: {
        slug: book.slug,
        title: book.title,
        author: book.author,
        editora: book.editora,
        editoraId,
        categoryId,
        description: book.description,
        isbn: book.isbn,
        coverUrl: book.coverUrl,
        pdfUrl: book.downloadUrl,
        pages: book.pages,
        year: book.year,
        free: Boolean(book.free),
        featured: Boolean(book.featured),
      },
    });

    const prices: { currency: "KZ" | "MT" | "EUR" | "BRL"; amount: number }[] = [
      { currency: "KZ", amount: book.priceKZ },
      { currency: "MT", amount: book.price },
      { currency: "EUR", amount: book.priceEUR },
      { currency: "BRL", amount: book.priceBRL },
    ];
    for (const p of prices) {
      await prisma.price.upsert({
        where: { bookId_currency: { bookId: created.id, currency: p.currency } },
        update: { amount: p.amount },
        create: { bookId: created.id, currency: p.currency, amount: p.amount },
      });
    }
  }
}

async function seedBlog() {
  await prisma.blogPost.upsert({
    where: { slug: "distribuidora-de-livros-elo-essencial" },
    update: {},
    create: {
      slug: "distribuidora-de-livros-elo-essencial",
      title: "Distribuidora de livros: o elo essencial entre autores, editoras e livrarias",
      excerpt:
        "Como funciona uma distribuidora de livros, que vantagens traz a editoras, livrarias, escolas e autores, e como escolher o parceiro certo.",
      content:
        "Este artigo foi originalmente publicado como página estática do site. O conteúdo completo mantém-se disponível em /blog/distribuidora-de-livros-elo-essencial — este registo serve para o artigo aparecer também listado a partir da base de dados, junto com os próximos artigos.",
      publishedAt: new Date("2026-07-13"),
    },
  });
}

// Cria o primeiro administrador a partir de variáveis de ambiente, em vez
// de uma lista de emails fixa no código (ver lib/auth.ts).
async function seedAdmin() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_BOOTSTRAP_EMAIL/ADMIN_BOOTSTRAP_PASSWORD não definidos — a saltar criação de admin.");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN },
    create: { email, passwordHash, role: Role.ADMIN, name: "Administrador" },
  });
}

async function seedEventos() {
  const eventos = [
    {
      slug: "feira-do-livro-maputo-2026",
      titulo: "Feira do Livro de Maputo 2026",
      tipo: "FEIRA" as const,
      descricao:
        "A Pro Capital estará presente com um stand dedicado às editoras da CPLP, com descontos especiais e sessões de autógrafos.",
      local: "Centro de Conferências Joaquim Chissano",
      endereco: "Av. 25 de Setembro, Maputo",
      dataInicio: new Date("2026-09-12T09:00:00Z"),
      dataFim: new Date("2026-09-14T18:00:00Z"),
      capacidade: 500,
    },
    {
      slug: "lancamento-manual-8a-classe-2027",
      titulo: "Lançamento — Manuais Escolares 2027",
      tipo: "LANCAMENTO" as const,
      descricao:
        "Apresentação da nova edição dos manuais escolares para o ano letivo de 2027, com sessão aberta a professores e diretores de escola.",
      local: "Auditório Pro Capital",
      endereco: "Maputo",
      dataInicio: new Date("2026-11-05T14:00:00Z"),
      capacidade: 80,
      editora: "Plural Editores",
      livroSlug: "matematica-8a-classe",
    },
    {
      slug: "workshop-leitura-infantil",
      titulo: "Workshop: Incentivar a Leitura na Infância",
      tipo: "WORKSHOP" as const,
      descricao:
        "Workshop prático para educadores e encarregados de educação sobre como criar hábitos de leitura em crianças dos 3 aos 8 anos.",
      local: "Biblioteca Municipal da Matola",
      dataInicio: new Date("2026-08-22T09:30:00Z"),
      capacidade: 40,
    },
  ];

  for (const evento of eventos) {
    await prisma.evento.upsert({ where: { slug: evento.slug }, update: {}, create: evento });
  }
  console.log(`Seed de eventos concluído: ${eventos.length} eventos criados/atualizados.`);
}

async function main() {
  const categoryIdByName = await seedCategories();
  const editoraIdByName = await seedEditoras();
  await seedBooks(categoryIdByName, editoraIdByName);
  await seedBlog();
  await seedAdmin();
  await seedEventos();
  console.log("Seed concluído.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
