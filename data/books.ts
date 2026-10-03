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
  description?: string;
  rating?: number; // Avaliação média (1-5) — placeholder até existirem avaliações reais de utilizadores
  reviewCount?: number;
  pages?: number;
  year?: number;
  free?: boolean; // Só deve ser true para obras com direitos confirmados para distribuição gratuita
  downloadUrl?: string; // Necessário quando free=true
  coverUrl?: string; // Capa real fornecida pela editora (asset local em /public/covers) — tem prioridade sobre a procura por ISBN
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
  },  {
    slug: "da-minha-banda-cronicas",
    title: "Da Minha Banda, Crónicas",
    author: "Roberto de Carvalho",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 770,
    priceKZ: 6400,
    priceEUR: 6.0,
    priceBRL: 35.16,
    description:
      "Crónicas publicadas ao longo de décadas no Jornal de Angola, sobre o quotidiano e a memória angolana.",
  },
  {
    slug: "a-vida-verdadeira-de-domingos-xavier",
    title: "A Vida Verdadeira de Domingos Xavier",
    author: "Luandino Vieira",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 730,
    priceKZ: 6100,
    featured: true,
    bestseller: true,
    priceEUR: 5.8,
    priceBRL: 33.52,
    description:
      "Romance clássico da literatura angolana, do autor vencedor do Prémio Camões, sobre a luta contra o colonialismo.",
  },
  {
    slug: "ecos-da-minha-terra",
    title: "Ecos da Minha Terra",
    author: "Óscar Ribas",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 970,
    priceKZ: 8100,
    priceEUR: 7.6,
    priceBRL: 44.51,
    description:
      "Obra do decano dos escritores angolanos, com pesquisa etnográfica e criação literária sobre a região de Luanda.",
  },
  {
    slug: "fabulas-de-sanji",
    title: "Fábulas de Sanji",
    author: "António Jacinto",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 660,
    priceKZ: 5500,
    priceEUR: 5.2,
    priceBRL: 30.22,
    description:
      "Fábulas do poeta e antigo Ministro da Educação e Cultura de Angola, uma das vozes fundadoras da literatura angolana moderna.",
  },
  {
    slug: "sinos-de-alma-poemas",
    title: "Sinos de Alma — Poemas",
    author: "Cristóvão Neto",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 650,
    priceKZ: 5400,
    priceEUR: 5.1,
    priceBRL: 29.67,
    description:
      "Poesia de Cristóvão Neto, com menção honrosa do Prémio Sonangol de Literatura.",
  },
  {
    slug: "genese",
    title: "Génese",
    author: "Roderick Nehone",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 680,
    priceKZ: 5700,
    priceEUR: 5.4,
    priceBRL: 31.32,
    description:
      "Poemário vencedor do Prémio António Jacinto de Literatura, 1996 — a estreia literária do autor.",
  },
  {
    slug: "49-poemas",
    title: "49 Poemas",
    author: "Antero Abreu",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 700,
    priceKZ: 5800,
    priceEUR: 5.5,
    priceBRL: 31.87,
    description:
      "Coletânea de poesia de Antero Abreu, membro fundador da União dos Escritores Angolanos.",
  },
  {
    slug: "a-forma-dos-desejos",
    title: "A Forma dos Desejos",
    author: "João Tala",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 590,
    priceKZ: 4900,
    priceEUR: 4.6,
    priceBRL: 26.92,
    description:
      "Poemário de estreia de João Tala, membro da União dos Escritores Angolanos, publicado pela primeira vez em 1997.",
  },
  {
    slug: "nas-barbas-do-bando",
    title: "Nas Barbas do Bando",
    author: "David Mestre",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 660,
    priceKZ: 5500,
    priceEUR: 5.2,
    priceBRL: 30.22,
    description:
      "Trinta poemas escritos em Luanda entre 1977 e 1982, de um dos nomes maiores da poesia angolana moderna.",
  },
  {
    slug: "o-relogio-de-cafucolo",
    title: "O Relógio de Cafucôlo",
    author: "David Mestre",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 590,
    priceKZ: 4900,
    priceEUR: 4.6,
    priceBRL: 26.92,
    description:
      "Narrativa sobre os acontecimentos de 4 de Fevereiro de 1961 em Angola, do poeta e antigo diretor do Jornal de Angola.",
  },
  {
    slug: "inkuna-minha-terra",
    title: "Inkuna Minha Terra",
    author: "Fragata de Morais",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 760,
    priceKZ: 6300,
    priceEUR: 5.9,
    priceBRL: 34.62,
    description:
      "Obra com Menção Honrosa do Prémio Sonangol de Literatura, de um autor com percurso em teatro, cinema e diplomacia.",
  },
  {
    slug: "jindunguices",
    title: "Jindunguices",
    author: "Fragata de Morais",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 680,
    priceKZ: 5700,
    priceEUR: 5.4,
    priceBRL: 31.32,
    description:
      "Vencedora do Prémio Sagrada Esperança, 1999, do escritor, cronista e antigo Vice-Ministro da Educação e Cultura de Angola.",
  },
  {
    slug: "o-ano-do-cao",
    title: "O Ano do Cão",
    author: "Roderick Nehone",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 980,
    priceKZ: 8200,
    featured: true,
    bestseller: true,
    priceEUR: 7.7,
    priceBRL: 45.05,
    description:
      "Romance vencedor do Prémio Sonangol de Literatura em 1998, do advogado e docente universitário Roderick Nehone.",
  },
  {
    slug: "a-chaga",
    title: "A Chaga",
    author: "Castro Soromenho",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 1020,
    priceKZ: 8500,
    priceEUR: 8.0,
    priceBRL: 46.7,
    description:
      "Obra de um clássico da literatura angolana, com escrita direta e rigorosa sobre o processo colonial e as suas vítimas.",
  },
  {
    slug: "a-praga",
    title: "A Praga",
    author: "Óscar Ribas",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 590,
    priceKZ: 4900,
    priceEUR: 4.6,
    priceBRL: 26.92,
    description:
      "Narrativa do decano dos escritores angolanos, etnógrafo e ficcionista que dedicou a vida à cultura de Luanda.",
  },
  {
    slug: "assim-se-fez-madrugada",
    title: "Assim se Fez Madrugada",
    author: "Jofre Rocha",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 680,
    priceKZ: 5700,
    priceEUR: 5.4,
    priceBRL: 31.32,
    description:
      "Poesia de Jofre Rocha, ligada ao movimento «Vamos Descobrir Angola» e à afirmação da literatura angolana moderna.",
  },
  {
    slug: "cal-grafia-30-anos-de-poesia",
    title: "Cal & Grafia — 30 Anos de Poesia",
    author: "José Luís Mendonça",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 1080,
    priceKZ: 9000,
    priceEUR: 8.5,
    priceBRL: 49.45,
    description:
      "Trinta anos de percurso poético de José Luís Mendonça, uma das vozes mais destacadas da poesia angolana contemporânea.",
  },
  {
    slug: "em-kiluange-do-golungo",
    title: "Em Kiluange do Golungo",
    author: "António Jacinto",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 590,
    priceKZ: 4900,
    priceEUR: 4.6,
    priceBRL: 26.92,
    description:
      "Obra de António Jacinto, poeta e antigo Ministro da Educação e Cultura, fundador da União dos Escritores Angolanos.",
  },
  {
    slug: "figuras-e-mugimbisses",
    title: "Figuras e Mugimbisses",
    author: "Ricardo Manuel",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 880,
    priceKZ: 7300,
    priceEUR: 6.9,
    priceBRL: 40.11,
    description:
      "Quarenta e uma crónicas sobre o quotidiano luandense, publicadas no Jornal de Angola e no Correio da Semana entre 1989 e 1995.",
  },
  {
    slug: "idade-das-palavras",
    title: "Idade das Palavras",
    author: "João Maimona",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 700,
    priceKZ: 5800,
    priceEUR: 5.5,
    priceBRL: 31.87,
    description:
      "Poesia de João Maimona, vencedor do Prémio Sagrada Esperança do concurso literário INALD.",
  },
  {
    slug: "prometeu",
    title: "Prometeu",
    author: "António Jacinto",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 590,
    priceKZ: 4900,
    priceEUR: 4.6,
    priceBRL: 26.92,
    description:
      "Obra de António Jacinto, uma das figuras centrais da poesia angolana do século XX.",
  },
  {
    slug: "vovo-bartolomeu",
    title: "Vovô Bartolomeu",
    author: "António Jacinto",
    editora: "Editora das Letras",
    category: "Ficção",
    price: 590,
    priceKZ: 4900,
    priceEUR: 4.6,
    priceBRL: 26.92,
    description:
      "Considerado um marco da ficção angolana moderna, escrito originalmente em 1946 por António Jacinto.",
  },

  // Capas reais fornecidas pela Alcance Editores (Moçambique) — recortadas das folhas de
  // impressão originais (contracapa + lombada + capa) enviadas pelo editor.
  {
    slug: "pita-kufa-o-leito-da-morte",
    title: "Pita Kufa — O Leito da Morte",
    author: "Carlos Paradona Rufino Roque",
    editora: "Alcance Editores",
    category: "Ficção",
    price: 950,
    priceKZ: 7500,
    priceEUR: 7.9,
    priceBRL: 42.9,
    featured: true,
    isbn: "9789928700704",
    coverUrl: "/covers/pita-kufa-o-leito-da-morte.jpg",
    description:
      "Novo romance de Carlos Paradona Rufino Roque, autor moçambicano nascido em Inhaminga, distrito de Cheringoma, e membro da Associação dos Escritores Moçambicanos (AEMO). Roque publica desde 1980, com obras como A Gestação do Luar, Tchanaze — A Donzela de Sena (vencedora do Prémio Internacional PEN Translate 2022), N'tsai Tchassassa — A Virgem de Missangas, Carota N'tchakatcha — Feitiços e Mitos e Mueda — Nos Labirintos dos Ritos de Iniciação. É também jurado do Grande Prémio SONANGOL de Literatura, de Angola.",
  },
  {
    slug: "a-goda-la-ku-bola",
    title: "A Goda La Ku Bola — Diálogos Cívicos para Menores",
    author: "Elísio Macamo",
    editora: "Alcance Editores",
    category: "Não-ficção",
    price: 880,
    priceKZ: 6900,
    priceEUR: 6.9,
    priceBRL: 38.9,
    coverUrl: "/covers/a-goda-la-ku-bola.jpg",
    description:
      "Uma colectânea de diálogos cívicos dirigidos aos mais novos, por Elísio Macamo, professor de sociologia e estudos africanos na Universidade de Basileia, na Suíça. Nascido e criado em Xai-Xai, formou-se em Maputo, Salford e Londres (Inglaterra) e Bayreuth (Alemanha), e é autor de várias obras académicas sobre risco e desastres, reflexão intelectual em África, desenvolvimento, política e metodologia.",
  },
  {
    slug: "mishu-1952-1975",
    title: "Mishu 1952 – 1975",
    author: "Musumbuluku Nhuvu",
    editora: "Alcance Editores",
    category: "Ficção",
    price: 820,
    priceKZ: 6400,
    priceEUR: 6.5,
    priceBRL: 35.9,
    isbn: "9789928700384",
    coverUrl: "/covers/mishu-1952-1975.jpg",
    description:
      "Musumbuluku Nhuvu — pseudónimo de Narciso Matos, professor universitário e gestor educacional — regressa à Alcance Editores depois de Ndangu Wa Txindi na Musumbuluku (2021). \"Mishu\" significa manhã nascer do sol, na praia do Bilene, em Gaza, cenário que atravessa esta obra passada entre 1952 e 1975.",
  },
  {
    slug: "o-amor-o-gato-preto-e-outras-insonias",
    title: "O Amor, o Gato Preto e Outras Insónias",
    author: "José Paulo da Fonseca Pinto Lobo",
    editora: "Alcance Editores",
    category: "Ficção",
    price: 780,
    priceKZ: 6100,
    priceEUR: 6.2,
    priceBRL: 33.9,
    isbn: "9789928700391",
    coverUrl: "/covers/o-amor-o-gato-preto-e-outras-insonias.jpg",
    description:
      "Imaginaram alguma vez o inusitado de, em noites de insónia, acabarem a conversar com um gato preto? Nesta colectânea de textos poéticos, José Paulo da Fonseca Pinto Lobo — moçambicano nascido em Maputo em 1957, consultor de gestão e formador certificado — propõe uma jornada pelo Amor, pelas memórias do passado, pelas inquietações e certezas do presente e pelas esperanças do futuro. É também autor de Asas para Voar Raízes para Onde Voltar (2021) e Pelas Margens do Tempo (Lisboa, 2023).",
  },
  {
    slug: "o-mundo-da-matematica-1a-classe",
    title: "O Mundo da Matemática — 1ª Classe",
    author: "Castigo Wilson Fumo, Dinis Hilário Guibundana, Fabião Finiosse Nhabique e Glória Pedro Manhiça",
    editora: "Alcance Editores",
    category: "Escolar",
    price: 620,
    priceKZ: 4900,
    priceEUR: 4.5,
    priceBRL: 24.9,
    year: 2025,
    coverUrl: "/covers/o-mundo-da-matematica-1a-classe.jpg",
    description:
      "Manual oficial de Matemática para a 1ª classe, edição revista de 2025, propriedade do Ministério da Educação e Cultura de Moçambique, com coordenação geral de Ismael Cassamo Nhêze.",
  },
  {
    slug: "ouvir-e-falar-ler-e-escrever",
    title: "Ouvir e Falar, Ler e Escrever — Língua Portuguesa 1ª Classe",
    author: "Susana Sacramento Monteiro, Flávia de Alexandre Martins, Sinfrónia Marcelo Macome e Aniceto Joaquim Muchave",
    editora: "Alcance Editores",
    category: "Escolar",
    price: 620,
    priceKZ: 4900,
    priceEUR: 4.5,
    priceBRL: 24.9,
    year: 2025,
    coverUrl: "/covers/ouvir-e-falar-ler-e-escrever.jpg",
    description:
      "Manual oficial de Língua Portuguesa para a 1ª classe, edição revista de 2025, propriedade do Ministério da Educação e Cultura de Moçambique, com coordenação geral de Ismael Cassamo Nhêze.",
  },
  {
    slug: "educacao-visual-e-oficios-5a-classe",
    title: "Vamos Aprender com... Educação Visual e Ofícios — 5ª Classe",
    author: "Jorge Cupane, Loide Manjaze, Simião Parruque, Oluse Guilossa e Pedro Augusto",
    editora: "Alcance Editores",
    category: "Escolar",
    price: 650,
    priceKZ: 5100,
    priceEUR: 4.8,
    priceBRL: 26.5,
    year: 2025,
    coverUrl: "/covers/educacao-visual-e-oficios-5a-classe.jpg",
    description:
      "Livro do aluno da 5ª classe para Educação Visual e Ofícios, edição revista de 2025, coordenação editorial da Alcance Editores, propriedade do Ministério da Educação e Cultura de Moçambique.",
  },
  {
    slug: "educacao-visual-e-oficios-6a-classe",
    title: "Vamos Aprender com... Educação Visual e Ofícios — 6ª Classe",
    author: "Jorge Cupane, Loide Manjaze, Simião Parruque, Oluse Guilossa e Pedro Augusto",
    editora: "Alcance Editores",
    category: "Escolar",
    price: 650,
    priceKZ: 5100,
    priceEUR: 4.8,
    priceBRL: 26.5,
    year: 2025,
    coverUrl: "/covers/educacao-visual-e-oficios-6a-classe.jpg",
    description:
      "Livro do aluno da 6ª classe para Educação Visual e Ofícios, edição revista de 2025, coordenação editorial da Alcance Editores, propriedade do Ministério da Educação e Cultura de Moçambique.",
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
