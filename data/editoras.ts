export interface Editora {
  slug: string;
  name: string;
  country?: string;
  logo?: string; // caminho em /public, ex: "/editoras/nome.png" — opcional até termos o ficheiro real
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}

// Editoras reais confirmadas, mais placeholders para as que faltam chegar.
export const EDITORAS: Editora[] = [
  {
    slug: "mocambique-editora",
    name: "Moçambique Editora",
    logo: "/editoras/mocambique-editora.jpg",
    phone: "+258 84 32 61 460",
    email: "comercial@me.co.mz",
    address: "Avenida Marginal n.º 4441, Glória Mall Loja n.º 47, Maputo",
  },
  {
    slug: "alcance-editores",
    name: "Alcance Editores",
    logo: "/editoras/alcance.jpg",
    phone: "+258 82 67 14 444",
    email: "comercial@alcanceeditores.com",
    address: "Rua Gil Vicente n.º 79, Bairro da Coop",
  },
  {
    slug: "editora-das-letras",
    name: "Editora das Letras",
    country: "Angola",
  },
  {
    slug: "editora-moderna",
    name: "Editora Moderna",
    country: "Angola",
  },
  {
    slug: "estudo-didactico",
    name: "Estudo Didáctico",
    country: "Portugal",
  },
  {
    slug: "pae-editora-distribuidora-livros",
    name: "PAE Editora e Distribuidora de Livros Ltda",
    country: "Brasil",
  },
  {
    slug: "editora-popular",
    name: "Editora Popular",
    country: "Angola",
  },
  {
    slug: "editora-progresso",
    name: "Editora Progresso",
    country: "Angola",
  },
  {
    slug: "editorial-caminho",
    name: "Editorial Caminho",
    country: "Portugal",
  },
  {
    slug: "ndjira",
    name: "Ndjira",
    country: "Moçambique",
  },
  {
    slug: "nzila",
    name: "Nzila",
    country: "Moçambique",
  },
  {
    slug: "plural-editores",
    name: "Plural Editores",
    country: "Moçambique",
  },
  {
    slug: "diname",
    name: "Diname",
    country: "Moçambique",
  },
  {
    slug: "paz-e-terra",
    name: "Paz e Terra",
    country: "Brasil",
  },
  {
    slug: "dom-quixote",
    name: "Dom Quixote",
    country: "Portugal",
  },
  {
    slug: "alta-life",
    name: "Alta Life",
    country: "Brasil",
  },
  {
    slug: "sa-da-costa-editora",
    name: "Sá da Costa Editora",
    country: "Portugal",
  },
];
