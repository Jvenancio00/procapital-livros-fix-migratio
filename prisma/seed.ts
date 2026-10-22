import bcrypt from "bcryptjs";
import { BOOKS } from "../data/books";
import { EDITORAS } from "../data/editoras";
import { prisma } from "../lib/prisma";
import { normalizeIsbnForLookup } from "../lib/isbn";
import { MARKET_LIST } from "../lib/markets";
import { Role } from "@prisma/client";

const CATEGORY_TREE = [
  {
    slug: "escolar",
    name: "Escolar",
    description:
      "Manuais escolares e cadernos de atividades alinhados aos currículos nacionais, do ensino primário ao superior.",
    faq: [
      {
        pergunta: "Os manuais seguem o currículo oficial?",
        resposta:
          "Sim. Os títulos desta categoria seguem o currículo oficial em vigor para o respetivo nível de ensino, classe e ano letivo.",
      },
      {
        pergunta: "Como funcionam encomendas em quantidade para escolas e livrarias?",
        resposta:
          "Escolas, colégios, universidades e livrarias podem encomendar em lote no carrinho ou solicitar cotação comercial dedicada em /cotacoes.",
      },
    ],
    children: [
      { slug: "ensino-primario", name: "Ensino Primário" },
      { slug: "ensino-secundario", name: "Ensino Secundário" },
      { slug: "ensino-tecnico-profissional", name: "Ensino Técnico-Profissional" },
      { slug: "ensino-superior", name: "Ensino Superior" },
    ],
  },
  {
    slug: "ficcao",
    name: "Ficção",
    description:
      "Romance, conto, crónica e poesia de autores de Angola, Moçambique, Portugal, Brasil e demais países lusófonos.",
    faq: [],
    children: [
      { slug: "romance", name: "Romance" },
      { slug: "poesia", name: "Poesia" },
      { slug: "cronicas", name: "Crónicas" },
    ],
  },
  {
    slug: "infantil",
    name: "Infantil",
    description:
      "Obras ilustradas e literatura infantojuvenil de autores lusófonos para leitura autónoma e escolar.",
    faq: [],
    children: [
      { slug: "infantil-3-5-anos", name: "Infantil 3-5 anos" },
      { slug: "infantil-6-8-anos", name: "Infantil 6-8 anos" },
    ],
  },
  {
    slug: "nao-ficcao",
    name: "Não-ficção",
    description: "Ensaio, pedagogia, história, biografia e obras de referência.",
    faq: [],
    children: [],
  },
];

async function seedMarketsAndWarehouses() {
  for (const m of MARKET_LIST) {
    await prisma.marketConfig.upsert({
      where: { code: m.code },
      update: {
        name: m.name,
        currency: m.currency,
        isoCurrency: m.isoCurrency,
      },
      create: {
        code: m.code,
        name: m.name,
        currency: m.currency,
        isoCurrency: m.isoCurrency,
        taxRatePercent: m.defaultTaxRatePercent,
        shippingFlatFee: m.defaultShippingFlatFee,
        freeShippingThreshold: m.defaultFreeShippingThreshold,
        estimatedDeliveryDays: m.estimatedDeliveryDays,
        bankTransferEnabled: true,
        bankAccountDetails: m.defaultBankDetails,
        localMethodName: m.localMethodName,
        localMethodEnabled: false,
        cardGatewayEnabled: false,
        quoteEnabled: true,
        active: true,
      },
    });
  }

  const warehouses = [
    {
      code: "MZ-MPM-01",
      name: "Armazém Central Maputo",
      countryCode: "MZ" as const,
      city: "Maputo",
      address: "Rua Almeida Garrett, Bairro da Coop, n.º 366, Maputo",
      isPrimary: true,
    },
    {
      code: "AO-LAD-01",
      name: "Centro Logístico Luanda",
      countryCode: "AO" as const,
      city: "Luanda",
      address: "Maianga, Luanda",
      isPrimary: true,
    },
    {
      code: "PT-LIS-01",
      name: "Entreposto Editorial Lisboa",
      countryCode: "PT" as const,
      city: "Lisboa",
      address: "Lisboa, Portugal",
      isPrimary: true,
    },
    {
      code: "BR-SAO-01",
      name: "Hub Distribuição São Paulo",
      countryCode: "BR" as const,
      city: "São Paulo",
      address: "São Paulo, Brasil",
      isPrimary: true,
    },
  ];

  const warehouseByCountry = new Map<string, string>();
  for (const wh of warehouses) {
    const saved = await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: {
        name: wh.name,
        countryCode: wh.countryCode,
        city: wh.city,
        address: wh.address,
        isPrimary: wh.isPrimary,
      },
      create: wh,
    });
    warehouseByCountry.set(wh.countryCode, saved.id);
  }
  return warehouseByCountry;
}

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
  const removedNames = ["ndjira", "diname", "nzila"];
  await prisma.book.deleteMany({
    where: {
      OR: [
        { slug: { in: ["portugues-6a-classe", "niketche-uma-historia-de-poligamia"] } },
        { editora: { in: ["Ndjira", "Diname", "Nzila"], mode: "insensitive" } },
        { editoraRef: { slug: { in: removedNames } } },
      ],
      orderItems: { none: {} },
    },
  });
  await prisma.book.updateMany({
    where: {
      OR: [
        { slug: { in: ["portugues-6a-classe", "niketche-uma-historia-de-poligamia"] } },
        { editora: { in: ["Ndjira", "Diname", "Nzila"], mode: "insensitive" } },
        { editoraRef: { slug: { in: removedNames } } },
      ],
    },
    data: { active: false, featured: false, editoraId: null },
  });
  await prisma.editora.deleteMany({
    where: {
      OR: [
        { slug: { in: removedNames } },
        { name: { in: ["Ndjira", "Diname", "Nzila"], mode: "insensitive" } },
      ],
    },
  });

  const idByName = new Map<string, string>();
  for (let i = 0; i < EDITORAS.length; i += 1) {
    const e = EDITORAS[i];
    const country =
      e.country ??
      (e.address?.includes("Maputo") || e.address?.includes("Coop")
        ? "Moçambique"
        : null);
    const representationGroup = e.representationGroup ?? "NAO_EXCLUSIVO";
    const sortOrder = e.sortOrder ?? i + 1;

    const created = await prisma.editora.upsert({
      where: { slug: e.slug },
      update: {
        name: e.name,
        representationGroup,
        sortOrder,
        country,
        logo: e.logo,
        phone: e.phone,
        email: e.email,
        address: e.address,
        website: e.website,
      },
      create: {
        slug: e.slug,
        name: e.name,
        representationGroup,
        sortOrder,
        country,
        logo: e.logo,
        phone: e.phone,
        email: e.email,
        address: e.address,
        website: e.website,
      },
    });
    idByName.set(e.name, created.id);
  }
  return idByName;
}

async function seedBooks(
  categoryIdByName: Map<string, string>,
  editoraIdByName: Map<string, string>,
  warehouseByCountry: Map<string, string>
) {
  for (const book of BOOKS) {
    const categoryId = categoryIdByName.get(book.category);
    if (!categoryId) continue;

    const editoraId = editoraIdByName.get(book.editora) ?? null;
    const isbnNormalized = normalizeIsbnForLookup(book.isbn);

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
        isbnNormalized,
        coverUrl: book.coverUrl,
        pdfUrl: book.downloadUrl,
        pages: book.pages,
        year: book.year,
        free: Boolean(book.free),
        featured: Boolean(book.featured),
        educationLevel: book.educationLevel ?? null,
        schoolGrade: book.schoolGrade ?? null,
        subject: book.subject ?? null,
        academicYear: book.academicYear ?? null,
        countryOrigin: book.countryOrigin ?? null,
        allowQuote: book.allowQuote ?? true,
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
        isbnNormalized,
        coverUrl: book.coverUrl,
        pdfUrl: book.downloadUrl,
        pages: book.pages,
        year: book.year,
        free: Boolean(book.free),
        featured: Boolean(book.featured),
        educationLevel: book.educationLevel ?? null,
        schoolGrade: book.schoolGrade ?? null,
        subject: book.subject ?? null,
        academicYear: book.academicYear ?? null,
        countryOrigin: book.countryOrigin ?? null,
        allowQuote: book.allowQuote ?? true,
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
        create: { bookId: created.id, currency: p.currency, amount: p.amount, marketActive: true },
      });
    }

    // Semeia stock inicial apenas se ainda não existir registo de stock para esse armazém
    const isSchool = book.category === "Escolar";
    const defaultStockByCountry: Record<string, number> = {
      MZ: isSchool ? 180 : 45,
      AO: isSchool ? 140 : book.countryOrigin === "Angola" ? 65 : 30,
      PT: isSchool ? 25 : 35,
      BR: isSchool ? 20 : 30,
    };

    for (const [countryCode, warehouseId] of warehouseByCountry.entries()) {
      const existing = await prisma.stockItem.findUnique({
        where: { bookId_warehouseId: { bookId: created.id, warehouseId } },
      });
      if (!existing) {
        const initialQty = defaultStockByCountry[countryCode] ?? 25;
        const stockItem = await prisma.stockItem.create({
          data: {
            bookId: created.id,
            warehouseId,
            quantity: initialQty,
            reserved: 0,
            lowStockThreshold: isSchool ? 25 : 10,
          },
        });
        await prisma.stockMovement.create({
          data: {
            stockItemId: stockItem.id,
            type: "INITIAL_SEED",
            delta: initialQty,
            previousQty: 0,
            newQty: initialQty,
            reason: `Stock inicial de arranque (${countryCode})`,
            actorEmail: "system@procapitalmz.com",
          },
        });
      }
    }
  }
}

async function seedBlog() {
  const posts = [
    {
      slug: "distribuidora-de-livros-elo-essencial",
      title: "Distribuidora de livros: o elo essencial entre autores, editoras e livrarias",
      excerpt:
        "Como funciona uma distribuidora editorial, que vantagens operacionais traz a editoras, livrarias, escolas e instituições, e como escolher o parceiro certo.",
      content:
        "Uma distribuidora editorial profissional assegura logística integrada, consolidação comercial multi-editora, disponibilidade local por mercado e condições estruturadas para livrarias, escolas e bibliotecas universitárias.\n\nNa Pro Capital, trabalhamos diretamente com editoras em Moçambique, Angola, Portugal e Brasil para aproximar os manuais escolares e o catálogo literário lusófono de quem ensina, vende e lê.",
      publishedAt: new Date("2026-07-13"),
    },
    {
      slug: "preparacao-ano-letivo-manuais-escolares-cplp",
      title: "Planeamento antecipado do ano letivo: como escolas e livrarias garantem stock de manuais",
      excerpt:
        "Boas práticas na encomenda antecipada de manuais escolares por classe, disciplina e mercado, evitando ruturas no arranque das aulas.",
      content:
        "O sucesso logístico do início do ano letivo começa meses antes da abertura das salas de aula. Ao consolidar listas de manuais do Ensino Primário, Secundário e Técnico-Profissional num único pedido de cotação ou encomenda programada, escolas e livrarias asseguram prazos de entrega previsíveis, preços comerciais confirmados na moeda local e faturação institucional organizada.",
      publishedAt: new Date("2026-09-28"),
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { title: post.title, excerpt: post.excerpt },
      create: post,
    });
  }
}

async function seedAdmin() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_BOOTSTRAP_EMAIL/ADMIN_BOOTSTRAP_PASSWORD não definidos — a saltar criação de admin.");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email: email.trim().toLowerCase() },
    update: { role: Role.ADMIN },
    create: {
      email: email.trim().toLowerCase(),
      passwordHash,
      role: Role.ADMIN,
      name: "Administrador Pro Capital",
      emailVerified: new Date(),
    },
  });
}

async function seedEventos() {
  const eventos = [
    {
      slug: "lancamento-manual-8a-classe-2027",
      titulo: "Apresentação Editorial — Campanha Escolar 2026/2027",
      tipo: "LANCAMENTO" as const,
      descricao:
        "Apresentação das edições revistas de manuais escolares do Ensino Primário e Secundário, aberta a diretores pedagógicos, coordenadores escolares e livrarias parceiras.",
      local: "Auditório Pro Capital",
      endereco: "Rua Almeida Garrett, Bairro da Coop, n.º 366, Maputo",
      dataInicio: new Date("2026-11-12T14:00:00Z"),
      capacidade: 80,
      editora: "Alcance Editores / Plural Editores",
      livroSlug: "matematica-8a-classe",
    },
    {
      slug: "encontro-livreiros-editoras-lusofonia-2026",
      titulo: "Encontro Comercial de Editoras e Livrarias da Lusofonia",
      tipo: "FEIRA" as const,
      descricao:
        "Sessão profissional dedicada a catálogos multi-mercado, encomendas institucionais e distribuição entre Angola, Moçambique, Portugal e Brasil.",
      local: "Centro Cultural Franco-Moçambicano / Transmissão Online",
      endereco: "Maputo · Luanda · Lisboa · São Paulo",
      dataInicio: new Date("2026-12-03T09:30:00Z"),
      dataFim: new Date("2026-12-04T17:30:00Z"),
      capacidade: 200,
    },
    {
      slug: "feira-do-livro-maputo-2026",
      titulo: "Feira do Livro de Maputo 2026",
      tipo: "FEIRA" as const,
      descricao:
        "Presença institucional da Pro Capital com catálogo dedicado às editoras da CPLP, sessões com autores e atendimento comercial a escolas.",
      local: "Centro de Conferências Joaquim Chissano",
      endereco: "Av. 25 de Setembro, Maputo",
      dataInicio: new Date("2026-09-12T09:00:00Z"),
      dataFim: new Date("2026-09-14T18:00:00Z"),
      capacidade: 500,
    },
  ];

  for (const evento of eventos) {
    await prisma.evento.upsert({ where: { slug: evento.slug }, update: evento, create: evento });
  }
}

async function main() {
  const warehouseByCountry = await seedMarketsAndWarehouses();
  const categoryIdByName = await seedCategories();
  const editoraIdByName = await seedEditoras();
  await seedBooks(categoryIdByName, editoraIdByName, warehouseByCountry);
  await seedBlog();
  await seedAdmin();
  await seedEventos();
  console.log("Seed da plataforma Pro Capital concluído com sucesso.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
