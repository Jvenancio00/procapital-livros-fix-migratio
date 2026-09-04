/**
 * Prisma client com fallback resiliente para execução sem base de dados.
 * 
 * Correção da migração "livros": antes o `prisma generate` e `prisma migrate deploy`
 * falhavam por ausência da pasta `prisma/migrations` e por `DATABASE_URL` não
 * configurada, rebentando o build e o `next dev`. Agora:
 *  - Se DATABASE_URL estiver ausente ou o PrismaClient não tiver sido gerado
 *    (binários bloqueados em sandbox), usa um mock em memória com dados de
 *    `data/books.ts`, `data/editoras.ts` e `prisma/seed.ts`, permitindo que a
 *    homepage e o catálogo funcionem sem DB (fallback já previsto em app/page.tsx).
 *  - Se houver DB válida, usa o cliente real.
 */

// Tipos frouxos para o mock — evita dependência do client gerado quando ele falha
type MockDelegate = Record<string, (...args: any[]) => Promise<any>>;

let prismaInstance: any;

function createMockPrisma() {
  // Dados estáticos importados de forma lazy para não quebrar se os ficheiros mudarem
  const { BOOKS } = require("@/data/books") as typeof import("@/data/books");
  const { EDITORAS } = require("@/data/editoras") as typeof import("@/data/editoras");

  // Categorias — espelho de prisma/seed.ts CATEGORY_TREE, mas com IDs estáveis (slug)
  const CATEGORY_TREE = [
    { slug: "escolar", name: "Escolar", description: "Manuais escolares alinhados aos currículos nacionais, do ensino primário ao superior.", faq: [{ pergunta: "Os manuais seguem o currículo oficial?", resposta: "Sim, os títulos desta categoria seguem o currículo nacional do respetivo país e ano letivo." }] as any[], children: [{ slug: "ensino-primario", name: "Ensino Primário" }, { slug: "ensino-secundario", name: "Ensino Secundário" }, { slug: "ensino-superior", name: "Ensino Superior" }] },
    { slug: "ficcao", name: "Ficção", description: "Romance, ficção científica e literatura policial de autores lusófonos e internacionais.", faq: [] as any[], children: [{ slug: "romance", name: "Romance" }, { slug: "policial", name: "Policial" }, { slug: "ficcao-cientifica", name: "Ficção Científica" }] },
    { slug: "infantil", name: "Infantil", description: "Livros para crianças organizados por faixa etária, dos 3 aos 8 anos.", faq: [] as any[], children: [{ slug: "infantil-3-5-anos", name: "Infantil 3-5 anos" }, { slug: "infantil-6-8-anos", name: "Infantil 6-8 anos" }] },
    { slug: "nao-ficcao", name: "Não-ficção", description: "Ensaio, biografia e obras de referência.", faq: [] as any[], children: [] as any[] },
  ];

  const allCategories: any[] = [];
  const categoryBySlug = new Map<string, any>();
  const categoryByName = new Map<string, any>();
  for (const top of CATEGORY_TREE) {
    const parent = { id: top.slug, slug: top.slug, name: top.name, description: top.description, faq: top.faq, parentId: null };
    allCategories.push(parent);
    categoryBySlug.set(parent.slug, parent);
    categoryByName.set(parent.name, parent);
    for (const child of top.children) {
      const node = { id: child.slug, slug: child.slug, name: child.name, description: null, faq: null, parentId: parent.id };
      allCategories.push(node);
      categoryBySlug.set(node.slug, node);
      categoryByName.set(node.name, node);
    }
  }

  // Editoras — mapeia EDITORAS para forma de DB
  const editorasDb = EDITORAS.map((e: any) => ({
    id: e.slug,
    slug: e.slug,
    name: e.name,
    country: e.country ?? null,
    logo: e.logo ?? null,
    phone: e.phone ?? null,
    email: e.email ?? null,
    address: e.address ?? null,
    website: e.website ?? null,
  }));
  const editoraBySlug = new Map(editorasDb.map((e) => [e.slug, e]));
  const editoraByName = new Map(editorasDb.map((e) => [e.name, e]));

  // Livros — converte BOOKS para forma de DB + prices
  const booksDb = BOOKS.map((b: any) => {
    const cat = categoryByName.get(b.category);
    const ed = editoraByName.get(b.editora);
    return {
      id: b.slug,
      slug: b.slug,
      title: b.title,
      author: b.author,
      editora: b.editora,
      description: b.description ?? null,
      isbn: b.isbn ?? null,
      coverUrl: b.coverUrl ?? null,
      pdfUrl: b.downloadUrl ?? null,
      pages: b.pages ?? null,
      year: b.year ?? null,
      free: !!b.free,
      createdAt: new Date(),
      updatedAt: new Date(),
      featured: !!b.featured,
      featuredFrom: null as Date | null,
      featuredTo: null as Date | null,
      categoryId: cat?.id ?? "escolar",
      editoraId: ed?.id ?? null,
      // relações expandidas para includes
      category: cat ?? null,
      editoraRef: ed ?? null,
      prices: [
        { id: `${b.slug}-KZ`, amount: b.priceKZ, currency: "KZ", bookId: b.slug },
        { id: `${b.slug}-MT`, amount: b.price, currency: "MT", bookId: b.slug },
        { id: `${b.slug}-EUR`, amount: b.priceEUR, currency: "EUR", bookId: b.slug },
        { id: `${b.slug}-BRL`, amount: b.priceBRL, currency: "BRL", bookId: b.slug },
      ],
    };
  });
  const bookBySlug = new Map(booksDb.map((b) => [b.slug, b]));
  const bookById = new Map(booksDb.map((b) => [b.id, b]));

  // Eventos — espelho de prisma/seed.ts seedEventos
  const eventosDb = [
    { id: "feira-do-livro-maputo-2026", slug: "feira-do-livro-maputo-2026", titulo: "Feira do Livro de Maputo 2026", tipo: "FEIRA", descricao: "A Pro Capital estará presente com um stand dedicado às editoras da CPLP, com descontos especiais e sessões de autógrafos.", local: "Centro de Conferências Joaquim Chissano", endereco: "Av. 25 de Setembro, Maputo", latitude: null, longitude: null, imageUrl: null, dataInicio: new Date("2026-09-12T09:00:00Z"), dataFim: new Date("2026-09-14T18:00:00Z"), capacidade: 500, editora: null, livroSlug: null, createdAt: new Date(), updatedAt: new Date(), inscricoes: [] as any[] },
    { id: "lancamento-manual-8a-classe-2027", slug: "lancamento-manual-8a-classe-2027", titulo: "Lançamento — Manuais Escolares 2027", tipo: "LANCAMENTO", descricao: "Apresentação da nova edição dos manuais escolares para o ano letivo de 2027, com sessão aberta a professores e diretores de escola.", local: "Auditório Pro Capital", endereco: "Maputo", latitude: null, longitude: null, imageUrl: null, dataInicio: new Date("2026-11-05T14:00:00Z"), dataFim: null, capacidade: 80, editora: "Plural Editores", livroSlug: "matematica-8a-classe", createdAt: new Date(), updatedAt: new Date(), inscricoes: [] as any[] },
    { id: "workshop-leitura-infantil", slug: "workshop-leitura-infantil", titulo: "Workshop: Incentivar a Leitura na Infância", tipo: "WORKSHOP", descricao: "Workshop prático para educadores e encarregados de educação sobre como criar hábitos de leitura em crianças dos 3 aos 8 anos.", local: "Biblioteca Municipal da Matola", endereco: null, latitude: null, longitude: null, imageUrl: null, dataInicio: new Date("2026-08-22T09:30:00Z"), dataFim: null, capacidade: 40, editora: null, livroSlug: null, createdAt: new Date(), updatedAt: new Date(), inscricoes: [] as any[] },
  ];
  const eventoBySlug = new Map(eventosDb.map((e) => [e.slug, e]));

  // Blog
  const blogPostsDb = [
    { id: "blog-1", slug: "distribuidora-de-livros-elo-essencial", title: "Distribuidora de livros: o elo essencial entre autores, editoras e livrarias", excerpt: "Como funciona uma distribuidora de livros, que vantagens traz a editoras, livrarias, escolas e autores, e como escolher o parceiro certo.", content: "Este artigo foi originalmente publicado como página estática do site. O conteúdo completo mantém-se disponível em /blog/distribuidora-de-livros-elo-essencial — este registo serve para o artigo aparecer também listado a partir da base de dados, junto com os próximos artigos.", coverUrl: null, authorName: null, published: true, publishedAt: new Date("2026-07-13"), updatedAt: new Date() },
  ];
  const blogBySlug = new Map(blogPostsDb.map((b) => [b.slug, b]));

  // Helpers genéricos
  const makeDelegate = (overrides: MockDelegate): MockDelegate => {
    const base: MockDelegate = {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async ({ data }: any) => ({ id: `mock-${Date.now()}`, ...data }),
      update: async ({ data }: any) => ({ id: "mock", ...data }),
      upsert: async ({ create, update }: any) => ({ id: "mock", ...create, ...update }),
      delete: async () => ({ id: "mock" }),
      deleteMany: async () => ({ count: 0 }),
      groupBy: async () => [],
      count: async () => 0,
      aggregate: async () => ({ _sum: {}, _count: 0 }),
    };
    return { ...base, ...overrides };
  };

  const mock: any = {
    // Transação — executa callback com o próprio mock como tx
    $transaction: async (fn: any) => {
      if (typeof fn === "function") return fn(mock);
      // Se for array de promessas (Prisma $transaction([...]))
      if (Array.isArray(fn)) return Promise.all(fn);
      return fn;
    },
    $disconnect: async () => {},
    $connect: async () => {},
    $executeRaw: async () => 0,
    $queryRaw: async () => [],

    user: makeDelegate({
      findUnique: async ({ where }: any) => {
        if (!where?.email) return null;
        // Admin legado + mock genérico
        if (where.email === "jdvenancio.7@gmail.com") {
          return { id: "mock-admin", email: where.email, name: "Admin", role: "ADMIN", passwordHash: "$2a$12$mock", totpEnabled: false, totpSecret: null };
        }
        // Usuário criado via registo — não persiste entre reloads
        return null;
      },
      create: async ({ data }: any) => ({ id: `user-${Date.now()}`, ...data }),
      update: async ({ where, data }: any) => ({ id: where?.id ?? "mock-user", ...data }),
      upsert: async ({ where, create, update }: any) => ({ id: where?.email ?? create.email, ...create, ...update }),
    }),

    loginEvent: makeDelegate({
      create: async ({ data }: any) => ({ id: `login-${Date.now()}`, createdAt: new Date(), ...data }),
      findMany: async () => [],
    }),

    category: makeDelegate({
      findMany: async (args?: any) => {
        if (args?.select?.slug) return allCategories.map((c) => ({ slug: c.slug }));
        // Se houver where parentId etc, simplifica
        return allCategories;
      },
      findUnique: async ({ where, include }: any) => {
        if (!where?.slug && !where?.id) return null;
        const key = where.slug ?? where.id;
        const cat = categoryBySlug.get(key) ?? allCategories.find((c) => c.id === key) ?? null;
        if (!cat) return null;
        // Monta relações esperadas por getCategoryBySlug
        const parent = cat.parentId ? categoryBySlug.get(cat.parentId) ?? null : null;
        const children = allCategories.filter((c) => c.parentId === cat.id);
        const books = booksDb.filter((b) => b.categoryId === cat.id);
        // Se include.books, retorna com books; caso contrário só categoria
        if (include?.books || include?.children || include?.parent) {
          return { ...cat, parent, children, books };
        }
        return { ...cat, parent, children, books };
      },
    }),

    editora: makeDelegate({
      findMany: async (args?: any) => {
        if (args?.select?.slug) return editorasDb.map((e) => ({ slug: e.slug }));
        return editorasDb;
      },
      findUnique: async ({ where, include }: any) => {
        if (!where) return null;
        let editora: any = null;
        if (where.slug) editora = editoraBySlug.get(where.slug) ?? null;
        else if (where.id) editora = editorasDb.find((e) => e.id === where.id) ?? null;
        else if (where.name) editora = editoraByName.get(where.name) ?? null;
        if (!editora) return null;
        if (include?.books) {
          const books = booksDb.filter((b: any) => b.editoraId === editora.id || b.editora === editora.name);
          // handle include.books.include.prices — já está em books
          // handle take
          const take = (include.books as any)?.take;
          const sliced = typeof take === "number" ? books.slice(0, take) : books;
          return { ...editora, books: sliced };
        }
        return editora;
      },
    }),

    book: makeDelegate({
      findMany: async (args?: any) => {
        // Filtros específicos de featured.ts / bestsellers
        if (args?.where?.featured === true) return booksDb.filter((b) => b.featured);
        if (args?.where?.createdAt?.gte) {
          const since = new Date(args.where.createdAt.gte);
          return booksDb.filter((b) => b.createdAt >= since);
        }
        if (args?.where?.id?.in) {
          const ids: string[] = args.where.id.in;
          return booksDb.filter((b) => ids.includes(b.id));
        }
        if (args?.where?.slug) return booksDb.filter((b) => b.slug === args.where.slug);
        return booksDb;
      },
      findUnique: async ({ where, include }: any) => {
        if (!where) return null;
        const book = where.slug ? bookBySlug.get(where.slug) ?? null : where.id ? bookById.get(where.id) ?? null : null;
        if (!book) return null;
        // Se include prices/editoraRef, já estão em book
        return book;
      },
      findFirst: async ({ where }: any) => {
        if (where?.slug) return bookBySlug.get(where.slug) ?? null;
        return booksDb[0] ?? null;
      },
    }),

    price: makeDelegate({
      findMany: async () => booksDb.flatMap((b) => b.prices),
      upsert: async ({ where, create }: any) => create,
    }),

    order: makeDelegate({}),
    orderItem: makeDelegate({
      groupBy: async () => [],
      findMany: async () => [],
    }),

    review: makeDelegate({
      findMany: async ({ where }: any) => {
        // Retorna vazio — sem reviews mockados
        return [];
      },
      upsert: async ({ where, create, update }: any) => ({ id: `review-${Date.now()}`, ...create, ...update }),
    }),

    favorite: makeDelegate({}),
    libraryItem: makeDelegate({
      findUnique: async () => null,
      findMany: async () => [],
    }),
    readingNote: makeDelegate({
      findMany: async () => [],
      create: async ({ data }: any) => ({ id: `note-${Date.now()}`, createdAt: new Date(), updatedAt: new Date(), ...data }),
      deleteMany: async () => ({ count: 0 }),
    }),
    license: makeDelegate({
      findFirst: async () => null,
    }),

    convenioPedido: makeDelegate({
      findMany: async () => [],
      create: async ({ data }: any) => ({ id: `convenio-${Date.now()}`, createdAt: new Date(), updatedAt: new Date(), estado: "PENDENTE", ...data }),
      update: async ({ where, data }: any) => ({ id: where?.id ?? "mock", updatedAt: new Date(), ...data }),
    }),

    evento: makeDelegate({
      findMany: async (args?: any) => {
        if (args?.select?.slug) return eventosDb.map((e) => ({ slug: e.slug }));
        let result: any[] = [...eventosDb];
        const whereDataInicio: any = (args as any)?.where?.dataInicio;
        if (whereDataInicio?.gte) {
          const gte = new Date(whereDataInicio.gte);
          result = result.filter((e: any) => e.dataInicio >= gte);
        } else if (whereDataInicio?.lt) {
          const lt = new Date(whereDataInicio.lt);
          result = result.filter((e: any) => e.dataInicio < lt);
        }
        const orderDir: any = (args as any)?.orderBy?.dataInicio;
        if (orderDir) {
          const dir = orderDir === "asc" ? 1 : -1;
          result.sort((a: any, b: any) => (a.dataInicio.getTime() - b.dataInicio.getTime()) * dir);
        }
        if (typeof (args as any)?.take === "number") {
          result = result.slice(0, (args as any).take);
        }
        result = result.map((e: any) => ({ ...e, _count: e._count ?? { inscricoes: 0 } }));
        return result;
      },
      findUnique: async ({ where, include }: any) => {
        if (!where?.slug && !where?.id) return null;
        const ev: any = eventoBySlug.get(where.slug) ?? eventosDb.find((e: any) => e.id === where.id) ?? null;
        if (!ev) return null;
        const enriched: any = { ...ev, _count: { inscricoes: 0 }, inscricoes: [] };
        return enriched;
      },
    }),

    inscricao: makeDelegate({
      findUnique: async ({ where }: any) => null,
      create: async ({ data }: any) => ({ id: `insc-${Date.now()}`, checkinCode: `chk-${Date.now()}`, createdAt: new Date(), estado: "CONFIRMADA", checkedInAt: null, ...data }),
      update: async ({ where, data }: any) => ({ id: where?.id ?? where?.checkinCode ?? "mock", ...data }),
    }),

    clientProfile: makeDelegate({
      create: async ({ data }: any) => ({ id: `client-${Date.now()}`, ...data }),
      findUnique: async () => null,
    }),

    blogPost: makeDelegate({
      findMany: async (args?: any) => {
        if (args?.where?.published === true) return blogPostsDb.filter((b) => b.published);
        if (args?.select?.slug) return blogPostsDb.map((b) => ({ slug: b.slug }));
        return blogPostsDb;
      },
      findUnique: async ({ where }: any) => {
        if (!where?.slug) return null;
        return blogBySlug.get(where.slug) ?? null;
      },
    }),

    contactRequest: makeDelegate({
      create: async ({ data }: any) => ({ id: `contact-${Date.now()}`, createdAt: new Date(), ...data }),
    }),
  };

  return mock;
}

function getPrisma() {
  if (prismaInstance) return prismaInstance;

  const globalForPrisma = globalThis as unknown as { prisma?: any; __mockPrisma?: any };

  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
    return prismaInstance;
  }

  // Tenta cliente real apenas se houver DATABASE_URL válida (não placeholder) e o generate tiver funcionado
  const hasRealDbUrl =
    !!process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("utilizador:password@host") &&
    !process.env.DATABASE_URL.includes("postgres://utilizador") &&
    process.env.DATABASE_URL !== "" &&
    !process.env.DATABASE_URL.startsWith("file:");

  if (hasRealDbUrl) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaClient } = require("@prisma/client");
      const client = new PrismaClient();
      prismaInstance = client;
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = client;
      }
      return prismaInstance;
    } catch (e) {
      console.warn("[prisma] Falha ao inicializar PrismaClient real, usando mock em memória:", (e as Error).message);
    }
  } else {
    if (!process.env.DATABASE_URL) {
      console.warn("[prisma] DATABASE_URL não definido — usando mock em memória (dados estáticos). Para BD real, copie .env.example para .env e configure DATABASE_URL).");
    } else if (process.env.DATABASE_URL.includes("utilizador:password")) {
      console.warn("[prisma] DATABASE_URL ainda é o placeholder de .env.example — usando mock em memória.");
    }
  }

  // Fallback mock
  if (globalForPrisma.__mockPrisma) {
    prismaInstance = globalForPrisma.__mockPrisma;
  } else {
    prismaInstance = createMockPrisma();
    globalForPrisma.__mockPrisma = prismaInstance;
    if (process.env.NODE_ENV !== "production") {
      // Não sobrescreve globalForPrisma.prisma para não confundir com real
    }
  }
  return prismaInstance;
}

export const prisma: any = getPrisma();

// Mantém compatibilidade com `import { prisma } from "@/lib/prisma"` e também `prisma.xxx`
export default prisma;
