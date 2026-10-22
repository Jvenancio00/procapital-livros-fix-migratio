export type RepresentationGroup = "EXCLUSIVO" | "NAO_EXCLUSIVO" | "AUTOR";

export const REPRESENTATION_GROUP_LABELS: Record<RepresentationGroup, string> = {
  EXCLUSIVO: "Título Exclusivo",
  NAO_EXCLUSIVO: "Não Exclusivo",
  AUTOR: "Autores",
};

export interface Editora {
  slug: string;
  name: string;
  representationGroup?: RepresentationGroup;
  sortOrder?: number;
  country?: string;
  logo?: string; // caminho em /public, ex: "/editoras/nome.png" — opcional até termos o ficheiro real
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  description?: string;
}

// Diretório oficial de editoras e autores representados pela Pro Capital
// Organizado segundo o regime comercial: Título Exclusivo, Não Exclusivo e Autores.
export const EDITORAS: Editora[] = [
  // 1. Título Exclusivo
  {
    slug: "alcance-editores",
    name: "Alcance Editores",
    representationGroup: "EXCLUSIVO",
    sortOrder: 1,
    country: "Moçambique",
    logo: "/editoras/alcance.jpg",
    phone: "+258 82 67 14 444",
    email: "comercial@alcanceeditores.com",
    address: "Rua Gil Vicente n.º 79, Bairro da Coop, Maputo",
  },
  {
    slug: "mocambique-editora",
    name: "Moçambique Editora",
    representationGroup: "EXCLUSIVO",
    sortOrder: 2,
    country: "Moçambique",
    logo: "/editoras/mocambique-editora.jpg",
    phone: "+258 84 32 61 460",
    email: "comercial@me.co.mz",
    address: "Avenida Marginal n.º 4441, Glória Mall Loja n.º 47, Maputo",
  },

  // 2. Não Exclusivo
  {
    slug: "plural-editores",
    name: "Plural Editores",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 10,
    country: "Moçambique",
  },
  {
    slug: "fundacao-fernando-leite-couto",
    name: "FFLC — Fundação Fernando Leite Couto",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 11,
    country: "Moçambique",
  },
  {
    slug: "gala-gala-edicoes",
    name: "Gala-Gala Edições",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 12,
    country: "Moçambique",
  },
  {
    slug: "ethale",
    name: "Ethale",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 13,
    country: "Moçambique",
  },

  // 3. Autores Representados
  {
    slug: "renato-matusse",
    name: "Renato Matusse",
    representationGroup: "AUTOR",
    sortOrder: 20,
    country: "Moçambique",
  },

  // Parceiras CPLP (Angola, Portugal e Brasil — Não Exclusivo)
  {
    slug: "editora-das-letras",
    name: "Editora das Letras",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 30,
    country: "Angola",
    phone: "+244 935 996 748",
    email: "geral@editoradasletras.com",
    address: "Rua Kwamme Nkruma n.º 252, Maianga, Luanda",
    website: "https://www.editoradasletras.com",
  },
  {
    slug: "editorial-caminho",
    name: "Editorial Caminho",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 31,
    country: "Portugal",
  },
  {
    slug: "dom-quixote",
    name: "Dom Quixote",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 32,
    country: "Portugal",
  },
  {
    slug: "paz-e-terra",
    name: "Paz e Terra",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 33,
    country: "Brasil",
  },
  {
    slug: "sa-da-costa-editora",
    name: "Sá da Costa Editora",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 34,
    country: "Portugal",
  },
  {
    slug: "alta-life",
    name: "Alta Life",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 35,
    country: "Brasil",
  },
  {
    slug: "editora-moderna",
    name: "Editora Moderna",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 36,
    country: "Angola",
  },
  {
    slug: "estudo-didactico",
    name: "Estudo Didáctico",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 37,
    country: "Portugal",
  },
  {
    slug: "pae-editora-distribuidora-livros",
    name: "PAE Editora e Distribuidora de Livros Ltda",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 38,
    country: "Brasil",
  },
  {
    slug: "editora-popular",
    name: "Editora Popular",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 39,
    country: "Angola",
  },
  {
    slug: "editora-progresso",
    name: "Editora Progresso",
    representationGroup: "NAO_EXCLUSIVO",
    sortOrder: 40,
    country: "Angola",
  },
];
