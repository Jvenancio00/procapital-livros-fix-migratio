-- Migração idempotente: Atualização do catálogo e diretório oficial de editoras/autores Pro Capital
-- 1. Remove editoras Ndjira, Diname e Nzila e todos os respetivos livros associados.
-- 2. Introduz classificação oficial (EXCLUSIVO, NAO_EXCLUSIVO, AUTOR) e ordenação editorial.
-- 3. Mantém/adiciona Alcance Editores, Moçambique Editora (Exclusivo), Plural Editores, FFLC — Fundação Fernando Leite Couto, Gala-Gala Edições, Ethale (Não Exclusivo) e Renato Matusse (Autores).

DO $$ BEGIN
  CREATE TYPE "RepresentationGroup" AS ENUM ('EXCLUSIVO', 'NAO_EXCLUSIVO', 'AUTOR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Editora"
  ADD COLUMN IF NOT EXISTS "representationGroup" "RepresentationGroup" NOT NULL DEFAULT 'NAO_EXCLUSIVO',
  ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 100;

-- Remove livros das editoras removidas (Ndjira, Diname, Nzila) sem encomendas históricas associadas
DELETE FROM "Book" b
WHERE (
  b."slug" IN ('portugues-6a-classe', 'niketche-uma-historia-de-poligamia')
  OR LOWER(TRIM(b."editora")) IN ('ndjira', 'diname', 'nzila')
  OR b."editoraId" IN (
    SELECT e."id"
    FROM "Editora" e
    WHERE e."slug" IN ('ndjira', 'diname', 'nzila')
       OR LOWER(TRIM(e."name")) IN ('ndjira', 'diname', 'nzila')
  )
)
AND NOT EXISTS (
  SELECT 1 FROM "OrderItem" oi WHERE oi."bookId" = b."id"
);

-- Caso exista algum registo histórico de encomenda na BD de produção, desativa o livro e desvincula a FK antes de apagar a editora
UPDATE "Book" b
SET "active" = false,
    "featured" = false,
    "editoraId" = NULL
WHERE b."slug" IN ('portugues-6a-classe', 'niketche-uma-historia-de-poligamia')
   OR LOWER(TRIM(b."editora")) IN ('ndjira', 'diname', 'nzila')
   OR b."editoraId" IN (
     SELECT e."id"
     FROM "Editora" e
     WHERE e."slug" IN ('ndjira', 'diname', 'nzila')
        OR LOWER(TRIM(e."name")) IN ('ndjira', 'diname', 'nzila')
   );

-- Remove definitivamente as editoras Ndjira, Diname e Nzila
DELETE FROM "Editora"
WHERE "slug" IN ('ndjira', 'diname', 'nzila')
   OR LOWER(TRIM("name")) IN ('ndjira', 'diname', 'nzila');

-- Sincroniza editoras e autores oficiais em Título Exclusivo, Não Exclusivo e Autores
INSERT INTO "Editora" ("id", "slug", "name", "representationGroup", "sortOrder", "country", "logo", "phone", "email", "address")
VALUES
  ('ed_alcance_editores', 'alcance-editores', 'Alcance Editores', 'EXCLUSIVO', 1, 'Moçambique', '/editoras/alcance.jpg', '+258 82 67 14 444', 'comercial@alcanceeditores.com', 'Rua Gil Vicente n.º 79, Bairro da Coop, Maputo'),
  ('ed_mocambique_editora', 'mocambique-editora', 'Moçambique Editora', 'EXCLUSIVO', 2, 'Moçambique', '/editoras/mocambique-editora.jpg', '+258 84 32 61 460', 'comercial@me.co.mz', 'Avenida Marginal n.º 4441, Glória Mall Loja n.º 47, Maputo'),
  ('ed_plural_editores', 'plural-editores', 'Plural Editores', 'NAO_EXCLUSIVO', 10, 'Moçambique', NULL, NULL, NULL, NULL),
  ('ed_fflc', 'fundacao-fernando-leite-couto', 'FFLC — Fundação Fernando Leite Couto', 'NAO_EXCLUSIVO', 11, 'Moçambique', NULL, NULL, NULL, NULL),
  ('ed_gala_gala', 'gala-gala-edicoes', 'Gala-Gala Edições', 'NAO_EXCLUSIVO', 12, 'Moçambique', NULL, NULL, NULL, NULL),
  ('ed_ethale', 'ethale', 'Ethale', 'NAO_EXCLUSIVO', 13, 'Moçambique', NULL, NULL, NULL, NULL),
  ('ed_renato_matusse', 'renato-matusse', 'Renato Matusse', 'AUTOR', 20, 'Moçambique', NULL, NULL, NULL, NULL)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "representationGroup" = EXCLUDED."representationGroup",
  "sortOrder" = EXCLUDED."sortOrder",
  "country" = COALESCE(EXCLUDED."country", "Editora"."country"),
  "logo" = COALESCE(EXCLUDED."logo", "Editora"."logo"),
  "phone" = COALESCE(EXCLUDED."phone", "Editora"."phone"),
  "email" = COALESCE(EXCLUDED."email", "Editora"."email"),
  "address" = COALESCE(EXCLUDED."address", "Editora"."address");

-- Ordena também as restantes editoras parceiras da CPLP (Angola, Portugal e Brasil) como NAO_EXCLUSIVO
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 30 WHERE "slug" = 'editora-das-letras';
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 31 WHERE "slug" = 'editorial-caminho';
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 32 WHERE "slug" = 'dom-quixote';
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 33 WHERE "slug" = 'paz-e-terra';
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 34 WHERE "slug" = 'sa-da-costa-editora';
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 35 WHERE "slug" = 'alta-life';
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 36 WHERE "slug" = 'editora-moderna';
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 37 WHERE "slug" = 'estudo-didactico';
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 38 WHERE "slug" = 'pae-editora-distribuidora-livros';
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 39 WHERE "slug" = 'editora-popular';
UPDATE "Editora" SET "representationGroup" = 'NAO_EXCLUSIVO', "sortOrder" = 40 WHERE "slug" = 'editora-progresso';
