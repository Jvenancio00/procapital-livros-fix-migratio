import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade e Proteção de Dados",
  description:
    "Saiba como a Pro Capital recolhe, utiliza, conserva e protege os dados pessoais submetidos em encomendas, cotações B2B, formulários de contacto e analítica web.",
  alternates: { canonical: `${SITE_URL}/privacidade` },
  openGraph: {
    title: "Política de Privacidade e Proteção de Dados | Pro Capital",
    description:
      "Informação transparente sobre o tratamento de dados pessoais, cookies, analítica e direitos dos titulares na Pro Capital.",
    url: `${SITE_URL}/privacidade`,
    images: [DEFAULT_OG_IMAGE],
  },
};

const SECTIONS = [
  {
    title: "1. Responsável pelo Tratamento de Dados",
    paragraphs: [
      "A Pro Capital — Distribuidora de Livros, com sede operacional na Rua Almeida Garrett, Bairro da Coop, n.º 366, Maputo, Moçambique, é a entidade responsável pelo tratamento dos dados pessoais recolhidos através deste portal editorial e comercial.",
      "Para qualquer questão relacionada com privacidade, proteção de dados ou exercício de direitos, os titulares podem contactar diretamente o endereço comercial@procapitalmz.com ou o telefone +258 87 704 6220.",
    ],
  },
  {
    title: "2. Dados Pessoais Recolhidos",
    paragraphs: [
      "Recolhemos estritamente os dados necessários à prestação dos nossos serviços de distribuição editorial, venda online e atendimento B2B: nome, endereço de correio eletrónico, contacto telefónico, denominação da escola/livraria/empresa (quando aplicável), identificação fiscal (NUIT/NIF/CNPJ/NIPC quando solicitada fatura), morada de expedição e mensagens ou listas de livros submetidas.",
      "Na Área de Cliente e Biblioteca Digital, registamos também o histórico de encomendas, faturas proforma emitidas e notas/marcadores criados pelo próprio leitor nas edições digitais da sua conta.",
    ],
  },
  {
    title: "3. Finalidades e Fundamento do Tratamento",
    paragraphs: [
      "Os dados recolhidos destinam-se exclusivamente a: (a) responder a pedidos de contacto, parceria editorial, convénios e cotações comerciais B2B; (b) processar encomendas, reservas de stock, faturação e entregas nos mercados de Moçambique, Angola, Portugal e Brasil; (c) disponibilizar o acesso à conta de cliente e Biblioteca Digital; e (d) enviar comunicações sobre catálogos e lançamentos apenas quando o utilizador subscreve voluntariamente o boletim informativo.",
    ],
  },
  {
    title: "4. Cookies, Sessão e Analítica de Navegação",
    paragraphs: [
      "Utilizamos cookies técnicos estritamente necessários para manter a sessão autenticada, guardar preferências locais (idioma, mercado/moeda, carrinho e favoritos) e assegurar a segurança dos formulários.",
      "Quando configurada a medição estatística agregada (como Google Analytics 4 com anonimização de endereço IP), os indicadores destinam-se apenas a compreender páginas mais consultadas e melhorar o catálogo, sem comercialização ou cedência de perfis a terceiros.",
    ],
  },
  {
    title: "5. Partilha e Conservação de Dados",
    paragraphs: [
      "A Pro Capital não vende nem aluga dados pessoais a terceiros. Os dados de entrega e faturação são partilhados apenas na medida estritamente indispensável com transportadoras logísticas, prestadores de pagamento selecionados pelo comprador ou obrigações fiscais legais aplicáveis em cada mercado.",
      "Os registos comerciais e fiscais são conservados pelos prazos legais aplicáveis; os contactos gerais e subscrições de boletim podem ser removidos a qualquer momento mediante pedido do titular.",
    ],
  },
  {
    title: "6. Direitos dos Titulares",
    paragraphs: [
      "Qualquer utilizador tem o direito de solicitar o acesso, retificação, atualização, limitação ou eliminação dos seus dados pessoais, bem como retirar o consentimento para comunicações informativas.",
      "Para exercer estes direitos, basta enviar pedido escrito para comercial@procapitalmz.com indicando o endereço de email associado ao contacto ou conta.",
    ],
  },
];

export default function PrivacidadePage() {
  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Informação Legal & Transparência"
        title="Política de Privacidade e Proteção de Dados"
        description="Compromisso da Pro Capital com o tratamento responsável, transparente e seguro das informações de leitores, escolas, livrarias e editoras parceiras."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Política de Privacidade" },
        ]}
      />

      <section className="mx-auto max-w-4xl space-y-6 px-5 sm:px-8">
        {SECTIONS.map((sec) => (
          <article
            key={sec.title}
            className="rounded-2xl border border-line bg-white p-7 sm:p-8"
          >
            <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">
              {sec.title}
            </h2>
            <div className="mt-3.5 space-y-3 text-sm leading-relaxed text-ink/75">
              {sec.paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </article>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-cream-deep/55 p-6 text-sm">
          <div>
            <p className="font-semibold text-ink">
              Última revisão: outubro de 2026 · Pro Capital (Maputo, Moçambique)
            </p>
            <p className="mt-0.5 text-xs text-ink/65">
              Contacto direto: comercial@procapitalmz.com · +258 87 704 6220
            </p>
          </div>
          <Link
            href="/contactos"
            className="inline-flex items-center rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Contactar responsável
          </Link>
        </div>
      </section>
    </div>
  );
}
