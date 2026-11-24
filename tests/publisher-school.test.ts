import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import EditoraMark, { editoraInitials } from "../components/EditoraMark";
import HeroSection from "../components/HeroSection";
import { LanguageProvider } from "../context/LanguageContext";
import { DICTIONARIES } from "../lib/i18n/languages";
import { resolveEditoraLogo } from "../data/editoras";

function render(child: React.ReactNode) {
  // LanguageProvider requires children in its TypeScript props.
  // eslint-disable-next-line react/no-children-prop
  return renderToStaticMarkup(createElement(LanguageProvider, { children: child }));
}

test("marca substituta mostra iniciais decorativas, nome, país e aviso", () => {
  const html = render(createElement(EditoraMark, { name: "Plural Editores", country: "Moçambique", stacked: true }));
  assert.equal(editoraInitials("Plural Editores"), "PL");
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /Plural Editores/);
  assert.match(html, /Moçambique/);
  assert.match(html, /Símbolo provisório/);
  assert.match(html, /flex-col text-center/);
});

test("primeiro botão do hero leva aos livros escolares", () => {
  const html = render(createElement(HeroSection, { featuredBooks: [], stats: { totalBooks: 0, totalPublishers: 0, schoolBooks: 0, activeMarkets: 0 } }));
  const school = html.indexOf('href="/livros-escolares"');
  const catalog = html.indexOf('href="/catalogo"');
  const partnership = html.indexOf('href="/contactos?motivo=PARCERIA"');
  assert.ok(school >= 0 && school < catalog && catalog < partnership);
});

test("novos textos estão preenchidos nos seis idiomas", () => {
  assert.equal(Object.keys(DICTIONARIES).length, 6);
  for (const dict of Object.values(DICTIONARIES)) {
    assert.ok(dict.hero.tagline.trim());
    assert.ok(dict.hero.ctaSchool.trim());
    assert.ok(dict.publisherMark.provisional.trim());
    assert.ok(dict.schoolPriority.count.trim());
    assert.ok(dict.schoolPriority.quote.trim());
  }
});


test("logo da BD tem prioridade e catálogo estático supre campo vazio", () => {
  assert.equal(resolveEditoraLogo("alcance-editores", null), "/editoras/alcance.jpg");
  assert.equal(resolveEditoraLogo("alcance-editores", "/editoras/outro.png"), "/editoras/outro.png");
  assert.equal(resolveEditoraLogo("plural-editores", null), undefined);
});
