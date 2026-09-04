import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Distribuidora de livros: o elo essencial entre autores, editoras e livrarias | Pro Capital",
  description:
    "Como funciona uma distribuidora de livros, que vantagens traz a editoras, livrarias, escolas e autores, e como escolher o parceiro certo em Moçambique e na CPLP.",
};

export default function ArtigoDistribuidoraPage() {
  return (
    <div>
      <section className="border-b border-line bg-cream-deep/60">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-ink"
          >
            <ArrowLeft size={15} />
            Voltar ao blog
          </Link>

          <div className="mt-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-foreground/50">
            <span>13 de julho de 2026</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />4 min de leitura
            </span>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Distribuidora de livros: o elo essencial entre autores, editoras
            e livrarias
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="space-y-6 text-base leading-relaxed text-foreground/80">
          <p>
            Entre quem escreve um livro e quem o lê existe uma cadeia de
            trabalho pouco visível, mas decisiva: a distribuição. Uma
            distribuidora de livros é a empresa que garante que um título
            chega das editoras às livrarias, às escolas e, por fim, às mãos
            do leitor — em tempo útil e com previsibilidade. Sem esse elo, o
            mercado editorial em Moçambique teria muito mais dificuldade em
            fazer circular o conhecimento.
          </p>

          <h2 className="pt-4 font-serif text-2xl font-semibold text-ink">
            O que faz uma distribuidora de livros
          </h2>
          <p>
            Na prática, uma distribuidora compra ou recebe em consignação
            grandes volumes de livros junto das editoras e organiza a sua
            venda a livrarias, escolas e outros pontos de venda. Esse
            trabalho cobre quatro frentes principais:
          </p>
          <ul className="space-y-2">
            {[
              "Gestão de stock — manter os títulos disponíveis e organizados, evitando ruturas.",
              "Logística de entrega — fazer chegar os livros a livrarias e escolas em todo o país, incluindo revendedores mais pequenos.",
              "Negociação comercial — definir condições justas e claras com cada parceiro.",
              "Promoção de catálogo — dar visibilidade a lançamentos e às editoras representadas.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
          <p>
            Ao assumir estas tarefas, a distribuidora liberta as editoras da
            necessidade de negociar diretamente com cada livraria ou escola,
            e liberta os pontos de venda da necessidade de gerir dezenas de
            fornecedores diferentes.
          </p>

          <h2 className="pt-4 font-serif text-2xl font-semibold text-ink">
            Vantagens para cada parceiro
          </h2>
          <p>
            <strong className="text-ink">Para as editoras</strong>, trabalhar
            com uma distribuidora significa alcançar mais pontos de venda sem
            multiplicar negociações, reduzir a carga logística de cada venda
            e ganhar visibilidade para novos lançamentos e reedições.
          </p>
          <p>
            <strong className="text-ink">Para livrarias e escolas</strong>, a
            vantagem está em ter um único interlocutor para um catálogo
            diversificado, condições comerciais mais consistentes e apoio
            próximo na reposição de stock — particularmente importante para
            escolas, que precisam de garantir manuais disponíveis no início
            do ano letivo.
          </p>
          <p>
            <strong className="text-ink">Para os autores</strong>, significa
            maior exposição em diferentes pontos de venda, uma chegada mais
            rápida das suas obras ao público e apoio na divulgação de
            lançamentos — algo particularmente valioso para autores
            moçambicanos que procuram alcançar leitores fora da sua região.
          </p>

          <h2 className="pt-4 font-serif text-2xl font-semibold text-ink">
            Como escolher a distribuidora certa
          </h2>
          <p>
            Para uma livraria, escola ou editora que está a avaliar
            parceiros de distribuição, vale a pena observar:
          </p>
          <ul className="space-y-2">
            {[
              "Um catálogo atualizado e relevante para o seu público.",
              "Reputação e histórico de confiança no mercado editorial.",
              "Condições comerciais claras e justas.",
              "Apoio próximo, ágil e disponível quando é preciso.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>

          <h2 className="pt-4 font-serif text-2xl font-semibold text-ink">
            O papel da Pro Capital
          </h2>
          <p>
            É exatamente este o compromisso da Pro Capital em Moçambique:
            ligar editoras, livrarias, escolas e leitores com um catálogo
            diversificado e um serviço próximo, para que o acesso ao livro
            certo nunca dependa de onde se está no país.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-line bg-cream-deep/50 p-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-lg font-semibold text-ink">
            Quer distribuir ou revender connosco?
          </p>
          <Link
            href="/contactos"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand-dark"
          >
            Fale connosco
            <ArrowRight size={16} />
          </Link>
        </div>
      </article>
    </div>
  );
}
