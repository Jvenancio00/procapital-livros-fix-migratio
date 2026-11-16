-- Capas disponibilizadas pela Alcance Editores. Sem preços ou stock inventados.
-- Categorias podem ainda não existir numa instalação nova (a seed corre depois).
INSERT INTO "Category" ("id", "slug", "name") VALUES
  ('cat_alcance_ficcao', 'ficcao', 'Ficção'),
  ('cat_alcance_infantil', 'infantil', 'Infantil'),
  ('cat_alcance_nao_ficcao', 'nao-ficcao', 'Não-ficção')
ON CONFLICT DO NOTHING;

WITH capas(slug, title, author, category, cover) AS (
  VALUES
  ('mandalas-para-criancas', 'Mandalas para Crianças', 'Autoria não indicada', 'Infantil', '/covers/mandalas-para-criancas.jpg'),
  ('mandalas-criativas', 'Mandalas Criativas', 'Autoria não indicada', 'Infantil', '/covers/mandalas-criativas.jpg'),
  ('a-hora-maconde', 'A Hora Maconde', 'Marcelo Panguana', 'Ficção', '/covers/a-hora-maconde.jpg'),
  ('assim-nao-senhor-presidente', 'Assim Não, Senhor Presidente!', 'Ungulani Ba Ka Khosa', 'Ficção', '/covers/assim-nao-senhor-presidente.jpg'),
  ('feliciano-gundana', 'Feliciano Gundana: Percurso de um Patriota', 'Joel das Neves Tembe', 'Não-ficção', '/covers/feliciano-gundana.jpg'),
  ('marcelino-dos-santos', 'Marcelino dos Santos: Personalidade Multifacetada e Homem do Povo', 'João Leopoldo da Costa, Simão Jaime, Hélder Jauana e Agostinho Manganhele', 'Não-ficção', '/covers/marcelino-dos-santos.jpg'),
  ('matoa-a-febre-do-batuque', 'Matoa: A Febre do Batuque', 'Hélder Muteia', 'Ficção', '/covers/matoa-a-febre-do-batuque.jpg'),
  ('mueda-nos-labirintos-dos-ritos-de-iniciacao', 'Mueda: Nos Labirintos dos Ritos de Iniciação', 'Carlos Paradona Rufino Roque', 'Não-ficção', '/covers/mueda-nos-labirintos-dos-ritos-de-iniciacao.jpg'),
  ('na-terra-dos-sonhos', 'Na Terra dos Sonhos', 'Agnaldo Bata', 'Ficção', '/covers/na-terra-dos-sonhos.jpg'),
  ('nos-os-do-macurungo', 'Nós, os do Macurungo', 'Adelino Timóteo', 'Ficção', '/covers/nos-os-do-macurungo.jpg'),
  ('os-lobos-uma-familia-goesa', 'Os Lobos: Uma Família Goesa', 'Álvaro Carmo Vaz', 'Ficção', '/covers/os-lobos-uma-familia-goesa.jpg'),
  ('samora-machel-uma-vida-interrompida', 'Samora Machel: Uma vida interrompida / A life cut short', 'Allen F. Isaacman e Barbara S. Isaacman', 'Não-ficção', '/covers/samora-machel-uma-vida-interrompida.jpg'),
  ('sia-vuma-100-anos', 'Sia Vuma 100 Anos', 'Organização: Ricardo Santos', 'Não-ficção', '/covers/sia-vuma-100-anos.jpg'),
  ('ualalapi', 'Ualalapi', 'Ungulani Ba Ka Khosa', 'Ficção', '/covers/ualalapi.jpg'),
  ('xicandarinha', 'Xicandarinha', 'Calane da Silva', 'Ficção', '/covers/xicandarinha.jpg'),
  ('zero-sobre-zero', 'Zero Sobre Zero: O Espião que Veio de Kigali', 'Aurélio Furdela', 'Ficção', '/covers/zero-sobre-zero.jpg'),
  ('mais-uma-batalha', 'Mais Uma Batalha', 'Madu Costa', 'Infantil', '/covers/mais-uma-batalha.jpg'),
  ('os-meninos-que-transformaram-estrelas-em-livros', 'Os Meninos que Transformaram Estrelas em Livros', 'Calane da Silva', 'Infantil', '/covers/os-meninos-que-transformaram-estrelas-em-livros.jpg'),
  ('os-meninos-a-bola-e-o-macaquinho', 'Os Meninos, a Bola e o Macaquinho', 'Alex Dau e Yolanda Mondlane', 'Infantil', '/covers/os-meninos-a-bola-e-o-macaquinho.jpg')
)
INSERT INTO "Book" ("id", "slug", "title", "author", "editora", "editoraId", "categoryId", "coverUrl", "countryOrigin", "allowQuote", "updatedAt")
SELECT 'alcance_cover_' || c.slug, c.slug, c.title, c.author, 'Alcance Editores', e."id", cat."id", c.cover, 'Moçambique', true, CURRENT_TIMESTAMP
FROM capas c
JOIN "Editora" e ON e."slug" = 'alcance-editores'
JOIN "Category" cat ON cat."name" = c.category
ON CONFLICT ("slug") DO NOTHING;

-- Não altera preços, stock, estado, ou metadados de registos existentes.
-- Pita Kufa já existe no catálogo; recebe a capa fornecida, no mesmo URL.
UPDATE "Book" SET "coverUrl" = '/covers/pita-kufa-o-leito-da-morte.jpg', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'pita-kufa-o-leito-da-morte' AND lower(trim("editora")) = 'alcance editores';

WITH capas(slug, title, author, category, cover) AS (
  VALUES
  ('mandalas-para-criancas', 'Mandalas para Crianças', 'Autoria não indicada', 'Infantil', '/covers/mandalas-para-criancas.jpg'),
  ('mandalas-criativas', 'Mandalas Criativas', 'Autoria não indicada', 'Infantil', '/covers/mandalas-criativas.jpg'),
  ('a-hora-maconde', 'A Hora Maconde', 'Marcelo Panguana', 'Ficção', '/covers/a-hora-maconde.jpg'),
  ('assim-nao-senhor-presidente', 'Assim Não, Senhor Presidente!', 'Ungulani Ba Ka Khosa', 'Ficção', '/covers/assim-nao-senhor-presidente.jpg'),
  ('feliciano-gundana', 'Feliciano Gundana: Percurso de um Patriota', 'Joel das Neves Tembe', 'Não-ficção', '/covers/feliciano-gundana.jpg'),
  ('marcelino-dos-santos', 'Marcelino dos Santos: Personalidade Multifacetada e Homem do Povo', 'João Leopoldo da Costa, Simão Jaime, Hélder Jauana e Agostinho Manganhele', 'Não-ficção', '/covers/marcelino-dos-santos.jpg'),
  ('matoa-a-febre-do-batuque', 'Matoa: A Febre do Batuque', 'Hélder Muteia', 'Ficção', '/covers/matoa-a-febre-do-batuque.jpg'),
  ('mueda-nos-labirintos-dos-ritos-de-iniciacao', 'Mueda: Nos Labirintos dos Ritos de Iniciação', 'Carlos Paradona Rufino Roque', 'Não-ficção', '/covers/mueda-nos-labirintos-dos-ritos-de-iniciacao.jpg'),
  ('na-terra-dos-sonhos', 'Na Terra dos Sonhos', 'Agnaldo Bata', 'Ficção', '/covers/na-terra-dos-sonhos.jpg'),
  ('nos-os-do-macurungo', 'Nós, os do Macurungo', 'Adelino Timóteo', 'Ficção', '/covers/nos-os-do-macurungo.jpg'),
  ('os-lobos-uma-familia-goesa', 'Os Lobos: Uma Família Goesa', 'Álvaro Carmo Vaz', 'Ficção', '/covers/os-lobos-uma-familia-goesa.jpg'),
  ('samora-machel-uma-vida-interrompida', 'Samora Machel: Uma vida interrompida / A life cut short', 'Allen F. Isaacman e Barbara S. Isaacman', 'Não-ficção', '/covers/samora-machel-uma-vida-interrompida.jpg'),
  ('sia-vuma-100-anos', 'Sia Vuma 100 Anos', 'Organização: Ricardo Santos', 'Não-ficção', '/covers/sia-vuma-100-anos.jpg'),
  ('ualalapi', 'Ualalapi', 'Ungulani Ba Ka Khosa', 'Ficção', '/covers/ualalapi.jpg'),
  ('xicandarinha', 'Xicandarinha', 'Calane da Silva', 'Ficção', '/covers/xicandarinha.jpg'),
  ('zero-sobre-zero', 'Zero Sobre Zero: O Espião que Veio de Kigali', 'Aurélio Furdela', 'Ficção', '/covers/zero-sobre-zero.jpg'),
  ('mais-uma-batalha', 'Mais Uma Batalha', 'Madu Costa', 'Infantil', '/covers/mais-uma-batalha.jpg'),
  ('os-meninos-que-transformaram-estrelas-em-livros', 'Os Meninos que Transformaram Estrelas em Livros', 'Calane da Silva', 'Infantil', '/covers/os-meninos-que-transformaram-estrelas-em-livros.jpg'),
  ('os-meninos-a-bola-e-o-macaquinho', 'Os Meninos, a Bola e o Macaquinho', 'Alex Dau e Yolanda Mondlane', 'Infantil', '/covers/os-meninos-a-bola-e-o-macaquinho.jpg')
)
UPDATE "Book" b SET "coverUrl" = c.cover, "updatedAt" = CURRENT_TIMESTAMP
FROM capas c
WHERE b."slug" = c.slug AND lower(trim(b."editora")) = 'alcance editores';
