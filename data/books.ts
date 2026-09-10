export const CATEGORIES = ["Escolar", "Ficção", "Infantil", "Não-ficção"] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Book {
  slug: string;
  title: string;
  author: string;
  editora: string;
  category: Category;
  price: number; // Preço em Meticais (MT) — usado no fluxo B2B (Área de Cliente)
  priceKZ: number; // Preço em Kwanzas (KZ) — usado na loja digital ao consumidor
  priceEUR: number; // Preço em Euros — valor definido editorialmente, não calculado no cliente
  priceBRL: number; // Preço em Reais — valor definido editorialmente, não calculado no cliente
  featured?: boolean;
  bestseller?: boolean;
  isbn?: string; // ISBN-13 real, usado para procurar a capa na Open Library Covers API
  /**
   * Capa explícita (por exemplo, arte da editora). Quando não vem, `BookCover`
   * resolve a capa pela Open Library/Google Books através do ISBN; o seed
   * grava este campo em `Book.coverUrl` para o backoffice ter um valor real.
   */
  coverUrl?: string;
  description?: string;
  rating?: number; // Avaliação média (1-5) — placeholder até existirem avaliações reais de utilizadores
  reviewCount?: number;
  pages?: number;
  year?: number;
  free?: boolean; // Só deve ser true para obras com direitos confirmados para distribuição gratuita
  downloadUrl?: string; // Necessário quando free=true
}

// Catálogo com títulos, autores e editoras reais do espaço lusófono/CPLP.
export const BOOKS: Book[] = [
  {
    slug: "matematica-8a-classe",
    title: "Matemática — 8ª Classe",
    author: "Ministério da Educação e Desenvolvimento Humano",
    editora: "Plural Editores",
    category: "Escolar",
    price: 850,
    priceKZ: 6500,
    priceEUR: 6.0,
    priceBRL: 35.9,
    featured: true,
    rating: 4.3,
    reviewCount: 18,
    pages: 176,
    year: 2023,
    description:
      "Manual escolar alinhado ao currículo nacional para a 8ª classe, com teoria, exemplos resolvidos e exercícios progressivos para consolidar os conteúdos de Matemática do ano letivo.",
  },
  {
    slug: "portugues-6a-classe",
    title: "Português — 6ª Classe",
    author: "Ministério da Educação e Desenvolvimento Humano",
    editora: "Diname",
    category: "Escolar",
    price: 780,
    priceKZ: 6000,
    priceEUR: 5.9,
    priceBRL: 32.9,
    bestseller: true,
    rating: 4.1,
    reviewCount: 12,
    pages: 152,
    year: 2023,
    description:
      "Manual oficial de Português para a 6ª classe, com textos, gramática e atividades de compreensão e escrita organizados de acordo com o programa curricular.",
  },
  {
    slug: "ciencias-naturais-caderno-exercicios",
    title: "Ciências Naturais — Caderno de Exercícios",
    author: "Ministério da Educação e Desenvolvimento Humano",
    editora: "Plural Editores",
    category: "Escolar",
    price: 690,
    priceKZ: 5200,
    priceEUR: 4.9,
    priceBRL: 28.5,
    rating: 4.0,
    reviewCount: 7,
    pages: 96,
    year: 2023,
    description:
      "Caderno de exercícios complementar ao manual de Ciências Naturais, pensado para reforço e revisão dos conteúdos em sala de aula ou em casa.",
  },
  {
    slug: "terra-sonambula",
    title: "Terra Sonâmbula",
    author: "Mia Couto",
    editora: "Editorial Caminho",
    category: "Ficção",
    price: 950,
    priceKZ: 9500,
    priceEUR: 8.9,
    priceBRL: 52.9,
    featured: true,
    isbn: "9789722126342",
    rating: 4.7,
    reviewCount: 214,
    pages: 208,
    year: 1992,
    description:
      "Romance que entrelaça a caminhada de um velho e um menino por uma Moçambique devastada pela guerra civil com os cadernos de um viajante encontrados pelo caminho, misturando realismo e imaginário oral moçambicano.",
  },
  {
    slug: "niketche-uma-historia-de-poligamia",
    title: "Niketche: Uma História de Poligamia",
    author: "Paulina Chiziane",
    editora: "Ndjira",
    category: "Ficção",
    price: 900,
    priceKZ: 9000,
    priceEUR: 8.5,
    priceBRL: 49.9,
    bestseller: true,
    isbn: "9789722128186",
    rating: 4.6,
    reviewCount: 156,
    pages: 320,
    year: 2002,
    description:
      "Narrado por uma mulher que descobre a poligamia do marido, o romance explora a solidariedade entre as várias esposas e os costumes em torno do casamento no sul de Moçambique.",
  },
  {
    slug: "mayombe",
    title: "Mayombe",
    author: "Pepetela",
    editora: "Dom Quixote",
    category: "Ficção",
    price: 1100,
    priceKZ: 11000,
    priceEUR: 10.5,
    priceBRL: 59.9,
    isbn: "9789722011167",
    rating: 4.8,
    reviewCount: 302,
    pages: 288,
    year: 1980,
    description:
      "Ambientado numa base guerrilheira na floresta do Mayombe durante a luta pela independência de Angola, o romance acompanha um grupo de combatentes e as suas tensões ideológicas e pessoais.",
  },
  {
    slug: "ynari-a-menina-das-cinco-trancas",
    title: "Ynari: A Menina das Cinco Tranças",
    author: "Ondjaki",
    editora: "Editorial Caminho",
    category: "Infantil",
    price: 650,
    priceKZ: 6800,
    priceEUR: 6.5,
    priceBRL: 37.9,
    featured: true,
    isbn: "9789722116367",
    rating: 4.5,
    reviewCount: 63,
    pages: 32,
    year: 2004,
    description:
      "Uma menina curiosa torna-se amiga de um gigante temido pela aldeia, numa história infantil sobre amizade, diferença e coragem de olhar para além do medo dos outros.",
  },
  {
    slug: "o-gato-e-o-escuro",
    title: "O Gato e o Escuro",
    author: "Mia Couto",
    editora: "Editorial Caminho",
    category: "Infantil",
    price: 600,
    priceKZ: 6200,
    priceEUR: 5.9,
    priceBRL: 33.9,
    bestseller: true,
    isbn: "9789722114158",
    rating: 4.4,
    reviewCount: 41,
    pages: 32,
    year: 2001,
    description:
      "Uma história ilustrada para os mais pequenos sobre um gato que se torna amigo da escuridão, ajudando as crianças a perder o medo da noite através da imaginação e do humor.",
  },
  {
    slug: "a-bicicleta-que-tinha-bigodes",
    title: "A Bicicleta que Tinha Bigodes",
    author: "Ondjaki",
    editora: "Editorial Caminho",
    category: "Infantil",
    price: 620,
    priceKZ: 6400,
    priceEUR: 5.9,
    priceBRL: 34.9,
    isbn: "9789722124553",
    rating: 4.3,
    reviewCount: 29,
    pages: 96,
    year: 2003,
    description:
      "Um menino sonha com uma bicicleta muito especial, prometida como prémio num concurso de rádio em Angola — um conto que mistura fantasia, humor e o quotidiano de uma infância sem luz elétrica.",
  },
  {
    slug: "pedagogia-do-oprimido",
    title: "Pedagogia do Oprimido",
    author: "Paulo Freire",
    editora: "Paz e Terra",
    category: "Não-ficção",
    price: 980,
    priceKZ: 9800,
    priceEUR: 9.5,
    priceBRL: 53.9,
    featured: true,
    isbn: "9788577534180",
    rating: 4.7,
    reviewCount: 511,
    pages: 256,
    year: 1968,
    description:
      "Obra fundadora da pedagogia crítica, propõe uma educação dialógica e libertadora como alternativa ao modelo tradicional de ensino, com forte influência em todo o mundo lusófono.",
  },
  {
    slug: "lutar-por-mocambique",
    title: "Lutar por Moçambique",
    author: "Eduardo Mondlane",
    editora: "Sá da Costa Editora",
    category: "Não-ficção",
    price: 1050,
    priceKZ: 10500,
    priceEUR: 9.9,
    priceBRL: 57.9,
    bestseller: true,
    rating: 4.6,
    reviewCount: 87,
    pages: 251,
    year: 1975,
    description:
      "Escrito pelo fundador e primeiro presidente da FRELIMO, este relato histórico e político analisa as origens e o desenrolar da luta pela independência de Moçambique.",
  },
  {
    slug: "longa-caminhada-ate-a-liberdade",
    title: "Longa Caminhada até à Liberdade",
    author: "Nelson Mandela",
    editora: "Alta Life",
    category: "Não-ficção",
    price: 1200,
    priceKZ: 12500,
    priceEUR: 11.9,
    priceBRL: 68.9,
    isbn: "9786555200737",
    rating: 4.9,
    reviewCount: 892,
    pages: 656,
    year: 1994,
    description:
      "Autobiografia de Nelson Mandela, que percorre a sua infância, o ativismo contra o apartheid, os 27 anos de prisão e o caminho até se tornar o primeiro presidente eleito democraticamente na África do Sul.",
  },
];

export function formatPrice(price: number) {
  return `${price.toLocaleString("pt-PT")} MT`;
}

export function formatPriceKZ(price: number) {
  return `${price.toLocaleString("pt-PT")} Kz`;
}

export function getBookBySlug(slug: string) {
  return BOOKS.find((book) => book.slug === slug);
}

export function getRelatedBooks(book: Book, limit = 4) {
  return BOOKS.filter(
    (candidate) =>
      candidate.slug !== book.slug && candidate.category === book.category
  ).slice(0, limit);
}
