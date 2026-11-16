-- Inserção segura de títulos sob cotação, sem preços ou stock artificiais.
INSERT INTO "Category" ("id", "slug", "name") VALUES
 ('cat_alcance_escolar', 'escolar', 'Escolar'),
 ('cat_alcance_infantil', 'infantil', 'Infantil'),
 ('cat_alcance_nao_ficcao', 'nao-ficcao', 'Não-ficção')
ON CONFLICT DO NOTHING;
WITH capas(slug, title, author, category, cover) AS (VALUES
  ('os-pastores-de-letras', 'Os Pastores de Letras', 'Carlos dos Santos', 'Infantil', '/covers/os-pastores-de-letras.jpg'),
  ('zua-e-mwedzi-vao-a-caca-das-palavras', 'Zua e Mwêdzi Vão à Caça das Palavras', 'Lucílio Manjate', 'Infantil', '/covers/zua-e-mwedzi-vao-a-caca-das-palavras.jpg'),
  ('a-riqueza-de-ser-diferente', 'A Riqueza de Ser Diferente', 'Cátia Fernandes e Rafo Díaz', 'Infantil', '/covers/a-riqueza-de-ser-diferente.jpg'),
  ('cada-pessoa-e-uma-cor', 'Cada Pessoa É Uma Cor', 'Mauro Manhiça', 'Infantil', '/covers/cada-pessoa-e-uma-cor.jpg'),
  ('dicionario-dictionary-portugues-ingles', 'Dicionário - Dictionary Português/Inglês', 'Autoria não indicada', 'Escolar', '/covers/dicionario-dictionary-portugues-ingles.jpg'),
  ('dicionario-portugues-ingles-english-portuguese', 'Dicionário - Dictionary Português/Inglês English/Portuguese', 'Autoria não indicada', 'Escolar', '/covers/dicionario-portugues-ingles-english-portuguese.jpg'),
  ('gramatica-da-lingua-portuguesa-2-ciclo', 'Gramática da Língua Portuguesa — 2.º Ciclo', 'Maria do Céu Vieira Lopes', 'Escolar', '/covers/gramatica-da-lingua-portuguesa-2-ciclo.jpg'),
  ('o-meu-primeiro-livro-de-gramatica', 'O Meu Primeiro Livro de Gramática', 'Isilda Lourenço Afonso', 'Escolar', '/covers/o-meu-primeiro-livro-de-gramatica.jpg'),
  ('didactique-du-francais-langue-etrangere', 'Didactique du Français Langue Étrangère', 'Amélia Lemos e Albino Chavale', 'Escolar', '/covers/didactique-du-francais-langue-etrangere.jpg'),
  ('didactics-of-english-language', 'Didactics of English Language', 'Carlos Quenesse Mataruca e Sarita Monjane Henriksen', 'Escolar', '/covers/didactics-of-english-language.jpg'),
  ('didactica-de-quimica', 'Didáctica de Química', 'Ana Paula Luciano Alichi Camuendo', 'Escolar', '/covers/didactica-de-quimica.jpg'),
  ('didactica-de-portugues', 'Didáctica de Português', 'Artur Bernardo Minzo', 'Escolar', '/covers/didactica-de-portugues.jpg'),
  ('didactica-de-matematica', 'Didáctica de Matemática', 'Vasco Agostinho João Cuambe', 'Escolar', '/covers/didactica-de-matematica.jpg'),
  ('didactica-de-lingua-materna', 'Didáctica de Língua Materna', 'Orlando Bahule', 'Escolar', '/covers/didactica-de-lingua-materna.jpg'),
  ('didactica-de-geografia', 'Didáctica de Geografia', 'Alice Freia e Suzete Buque', 'Escolar', '/covers/didactica-de-geografia.jpg'),
  ('100-acordaos-da-jurisdicao-administrativa', '100 Acórdãos da Jurisdição Administrativa', 'Januário Fernando Guibunda', 'Não-ficção', '/covers/100-acordaos-da-jurisdicao-administrativa.jpg'),
  ('principal-legislacao-de-proteccao-dos-direitos-da-crianca-e-da-mulher', 'Principal Legislação de Protecção dos Direitos da Criança e da Mulher', 'Edson da Graça Francisco Macuácua', 'Não-ficção', '/covers/principal-legislacao-de-proteccao-dos-direitos-da-crianca-e-da-mulher.jpg'),
  ('principal-legislacao-financeira-e-avisos-do-banco-de-mocambique', 'Principal Legislação Financeira e Avisos do Banco de Moçambique', 'Edson da Graça Francisco Macuácua', 'Não-ficção', '/covers/principal-legislacao-financeira-e-avisos-do-banco-de-mocambique.jpg'),
  ('principal-legislacao-sobre-descentralizacao-em-mocambique', 'Principal Legislação sobre Descentralização em Moçambique', 'Edson da Graça Francisco Macuácua', 'Não-ficção', '/covers/principal-legislacao-sobre-descentralizacao-em-mocambique.jpg'))
INSERT INTO "Book" ("id", "slug", "title", "author", "editora", "editoraId", "categoryId", "coverUrl", "countryOrigin", "allowQuote", "updatedAt")
SELECT 'alcance_cover_' || c.slug, c.slug, c.title, c.author, 'Alcance Editores', e."id", cat."id", c.cover, 'Moçambique', true, CURRENT_TIMESTAMP
FROM capas c JOIN "Editora" e ON e."slug" = 'alcance-editores'
JOIN "Category" cat ON cat."name" = c.category
ON CONFLICT ("slug") DO NOTHING;
-- Atualiza somente as capas de livros da editora; preserva dados comerciais e estado.
WITH capas(slug, title, author, category, cover) AS (VALUES
  ('os-pastores-de-letras', 'Os Pastores de Letras', 'Carlos dos Santos', 'Infantil', '/covers/os-pastores-de-letras.jpg'),
  ('zua-e-mwedzi-vao-a-caca-das-palavras', 'Zua e Mwêdzi Vão à Caça das Palavras', 'Lucílio Manjate', 'Infantil', '/covers/zua-e-mwedzi-vao-a-caca-das-palavras.jpg'),
  ('a-riqueza-de-ser-diferente', 'A Riqueza de Ser Diferente', 'Cátia Fernandes e Rafo Díaz', 'Infantil', '/covers/a-riqueza-de-ser-diferente.jpg'),
  ('cada-pessoa-e-uma-cor', 'Cada Pessoa É Uma Cor', 'Mauro Manhiça', 'Infantil', '/covers/cada-pessoa-e-uma-cor.jpg'),
  ('dicionario-dictionary-portugues-ingles', 'Dicionário - Dictionary Português/Inglês', 'Autoria não indicada', 'Escolar', '/covers/dicionario-dictionary-portugues-ingles.jpg'),
  ('dicionario-portugues-ingles-english-portuguese', 'Dicionário - Dictionary Português/Inglês English/Portuguese', 'Autoria não indicada', 'Escolar', '/covers/dicionario-portugues-ingles-english-portuguese.jpg'),
  ('gramatica-da-lingua-portuguesa-2-ciclo', 'Gramática da Língua Portuguesa — 2.º Ciclo', 'Maria do Céu Vieira Lopes', 'Escolar', '/covers/gramatica-da-lingua-portuguesa-2-ciclo.jpg'),
  ('o-meu-primeiro-livro-de-gramatica', 'O Meu Primeiro Livro de Gramática', 'Isilda Lourenço Afonso', 'Escolar', '/covers/o-meu-primeiro-livro-de-gramatica.jpg'),
  ('didactique-du-francais-langue-etrangere', 'Didactique du Français Langue Étrangère', 'Amélia Lemos e Albino Chavale', 'Escolar', '/covers/didactique-du-francais-langue-etrangere.jpg'),
  ('didactics-of-english-language', 'Didactics of English Language', 'Carlos Quenesse Mataruca e Sarita Monjane Henriksen', 'Escolar', '/covers/didactics-of-english-language.jpg'),
  ('didactica-de-quimica', 'Didáctica de Química', 'Ana Paula Luciano Alichi Camuendo', 'Escolar', '/covers/didactica-de-quimica.jpg'),
  ('didactica-de-portugues', 'Didáctica de Português', 'Artur Bernardo Minzo', 'Escolar', '/covers/didactica-de-portugues.jpg'),
  ('didactica-de-matematica', 'Didáctica de Matemática', 'Vasco Agostinho João Cuambe', 'Escolar', '/covers/didactica-de-matematica.jpg'),
  ('didactica-de-lingua-materna', 'Didáctica de Língua Materna', 'Orlando Bahule', 'Escolar', '/covers/didactica-de-lingua-materna.jpg'),
  ('didactica-de-geografia', 'Didáctica de Geografia', 'Alice Freia e Suzete Buque', 'Escolar', '/covers/didactica-de-geografia.jpg'),
  ('100-acordaos-da-jurisdicao-administrativa', '100 Acórdãos da Jurisdição Administrativa', 'Januário Fernando Guibunda', 'Não-ficção', '/covers/100-acordaos-da-jurisdicao-administrativa.jpg'),
  ('principal-legislacao-de-proteccao-dos-direitos-da-crianca-e-da-mulher', 'Principal Legislação de Protecção dos Direitos da Criança e da Mulher', 'Edson da Graça Francisco Macuácua', 'Não-ficção', '/covers/principal-legislacao-de-proteccao-dos-direitos-da-crianca-e-da-mulher.jpg'),
  ('principal-legislacao-financeira-e-avisos-do-banco-de-mocambique', 'Principal Legislação Financeira e Avisos do Banco de Moçambique', 'Edson da Graça Francisco Macuácua', 'Não-ficção', '/covers/principal-legislacao-financeira-e-avisos-do-banco-de-mocambique.jpg'),
  ('principal-legislacao-sobre-descentralizacao-em-mocambique', 'Principal Legislação sobre Descentralização em Moçambique', 'Edson da Graça Francisco Macuácua', 'Não-ficção', '/covers/principal-legislacao-sobre-descentralizacao-em-mocambique.jpg'))
UPDATE "Book" b SET "coverUrl" = c.cover, "updatedAt" = CURRENT_TIMESTAMP
FROM capas c WHERE b."slug" = c.slug AND lower(trim(b."editora")) = 'alcance editores';
UPDATE "Book" SET "coverUrl" = '/covers/educacao-visual-e-oficios-5a-classe.jpg', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'educacao-visual-e-oficios-5a-classe' AND lower(trim("editora")) = 'alcance editores';
