import type { Category } from "@/data/books";

/**
 * Estrutura comum a todos os dicionários de tradução.
 * Cada ficheiro em lib/i18n/dictionaries/*.ts tem de satisfazer este tipo —
 * assim o TypeScript avisa imediatamente se faltar alguma chave numa tradução.
 */
export interface Dictionary {
  meta: {
    /** Valor usado em <html lang="..."> quando este idioma está ativo */
    htmlLang: string;
  };
  nav: {
    home: string;
    catalog: string;
    publishers: string;
    about: string;
    blog: string;
    contacts: string;
    categories: string;
    agreements: string;
    highlights: string;
    bestsellers: string;
    digitalBook: string;
    events: string;
    myLibrary: string;
    logout: string;
    login: string;
    clientArea: string;
    contactUs: string;
    favorites: string;
    cart: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    currency: string;
    solutions: string;
    expansion: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaCatalog: string;
    ctaClientArea: string;
    ctaAbout: string;
    ctaPartnership: string;
    highlightsLabel: string;
    deliveryNote: string;
    flowLabels: {
      publishers: string;
      procapital: string;
      network: string;
      readers: string;
    };
  };
  /** Secção institucional de métricas ("10 parceiros", "1000+ títulos", ...), logo abaixo do Hero */
  metrics: {
    eyebrow: string;
    title: string;
    items: { value: string; label: string }[];
  };
  search: {
    placeholder: string;
    button: string;
    categoryAll: string;
  };
  /** Rótulos traduzidos para as categorias — as chaves mantêm-se as do modelo de dados (data/books.ts) */
  categories: Record<Category, string>;
  bookCard: {
    viewDetails: string;
    addToCart: string;
    download: string;
    free: string;
    addToFavorites: string;
    removeFromFavorites: string;
  };
  catalog: {
    noResults: string;
    previous: string;
    next: string;
    pageOf: string; // ex: "Página {page} de {total}" — usa {page} e {total} como marcadores
  };
  footer: {
    tagline: string;
    navigationTitle: string;
    contactsTitle: string;
    rights: string;
    marketsTitle: string;
  };
  trustBar: {
    items: { title: string; description: string }[];
  };
  partnerMarquee: {
    trustText: string;
  };
  /** Grelha "Editoras parceiras", com CTA para novas editoras se candidatarem */
  partners: {
    eyebrow: string;
    title: string;
    description: string;
    becomeTitle: string;
    ctaBecome: string;
  };
  audience: {
    title: string;
    description: string;
    items: { title: string; description: string }[];
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    items: { quote: string; name: string; role: string }[];
  };
  home: {
    bestsellers: {
      eyebrow: string;
      title: string;
      description: string;
      viewAll: string;
    };
    catalogSection: {
      eyebrow: string;
      title: string;
      description: string;
      viewAll: string;
    };
    highlights: {
      eyebrow: string;
      title: string;
      description: string;
      viewAll: string;
    };
    whatWeDo: {
      eyebrow: string;
      title: string;
      description: string;
      items: { title: string; description: string }[];
    };
    presence: {
      eyebrow: string;
      title: string;
      description: string;
      ctaPartnership: string;
      ctaTeam: string;
      countries: { country: string; note: string }[];
    };
    /** Secção institucional discreta dirigida a investidores/parceiros institucionais */
    investors: {
      eyebrow: string;
      title: string;
      items: { title: string; description: string }[];
      cta: string;
    };
    ctaBottom: {
      title: string;
      description: string;
      button: string;
    };
    newsletter: {
      title: string;
      description: string;
      placeholder: string;
      button: string;
    };
  };
}
