# Inventário de marcas editoriais

Diagnóstico do catálogo estático `data/editoras.ts`. A base de dados de produção pode conter dados diferentes e não foi consultada. “—” significa que não existe logo configurado; nenhum ficheiro foi criado ou descarregado.

| Slug | Nome | País | Grupo | Logo configurado | Ficheiro existe |
|---|---|---|---|---|---|
| alcance-editores | Alcance Editores | Moçambique | EXCLUSIVO | /editoras/alcance.jpg | Sim |
| mocambique-editora | Moçambique Editora | Moçambique | EXCLUSIVO | /editoras/mocambique-editora.jpg | Sim |
| plural-editores | Plural Editores | Moçambique | NAO_EXCLUSIVO | — | — |
| fundacao-fernando-leite-couto | FFLC — Fundação Fernando Leite Couto | Moçambique | NAO_EXCLUSIVO | — | — |
| gala-gala-edicoes | Gala-Gala Edições | Moçambique | NAO_EXCLUSIVO | — | — |
| ethale | Ethale | Moçambique | NAO_EXCLUSIVO | — | — |
| renato-matusse | Renato Matusse | Moçambique | AUTOR | — | — |
| editora-das-letras | Editora das Letras | Angola | NAO_EXCLUSIVO | — | — |
| editorial-caminho | Editorial Caminho | Portugal | NAO_EXCLUSIVO | — | — |
| dom-quixote | Dom Quixote | Portugal | NAO_EXCLUSIVO | — | — |
| paz-e-terra | Paz e Terra | Brasil | NAO_EXCLUSIVO | — | — |
| sa-da-costa-editora | Sá da Costa Editora | Portugal | NAO_EXCLUSIVO | — | — |
| alta-life | Alta Life | Brasil | NAO_EXCLUSIVO | — | — |
| editora-moderna | Editora Moderna | Angola | NAO_EXCLUSIVO | — | — |
| estudo-didactico | Estudo Didáctico | Portugal | NAO_EXCLUSIVO | — | — |
| pae-editora-distribuidora-livros | PAE Editora e Distribuidora de Livros Ltda | Brasil | NAO_EXCLUSIVO | — | — |
| editora-popular | Editora Popular | Angola | NAO_EXCLUSIVO | — | — |
| editora-progresso | Editora Progresso | Angola | NAO_EXCLUSIVO | — | — |

## Ficheiros a fornecer

Os caminhos abaixo são **propostas**, não ficheiros existentes. Preferir SVG ou PNG com fundo transparente, altura de referência de pelo menos 160 px e peso inferior a 60 KB. Para o autor, fornecer apenas retrato autorizado. A extensão deve corresponder ao ficheiro efetivamente recebido; atualizar `logo` em `data/editoras.ts` e validar o aspeto sobre fundo branco. Quando a base de dados contém um `logo` não vazio para a mesma editora, esse valor prevalece; se estiver vazio, é usado o ficheiro indicado no catálogo estático.

| Editora ou autor | Ficheiro proposto em `public` | Campo em `data/editoras.ts` |
|---|---|---|
| Plural Editores | /editoras/plural-editores.png | logo: "/editoras/plural-editores.png" |
| FFLC — Fundação Fernando Leite Couto | /editoras/fundacao-fernando-leite-couto.png | logo: "/editoras/fundacao-fernando-leite-couto.png" |
| Gala-Gala Edições | /editoras/gala-gala-edicoes.png | logo: "/editoras/gala-gala-edicoes.png" |
| Ethale | /editoras/ethale.png | logo: "/editoras/ethale.png" |
| Renato Matusse | /editoras/renato-matusse.png | logo: "/editoras/renato-matusse.png" |
| Editora das Letras | /editoras/editora-das-letras.png | logo: "/editoras/editora-das-letras.png" |
| Editorial Caminho | /editoras/editorial-caminho.png | logo: "/editoras/editorial-caminho.png" |
| Dom Quixote | /editoras/dom-quixote.png | logo: "/editoras/dom-quixote.png" |
| Paz e Terra | /editoras/paz-e-terra.png | logo: "/editoras/paz-e-terra.png" |
| Sá da Costa Editora | /editoras/sa-da-costa-editora.png | logo: "/editoras/sa-da-costa-editora.png" |
| Alta Life | /editoras/alta-life.png | logo: "/editoras/alta-life.png" |
| Editora Moderna | /editoras/editora-moderna.png | logo: "/editoras/editora-moderna.png" |
| Estudo Didáctico | /editoras/estudo-didactico.png | logo: "/editoras/estudo-didactico.png" |
| PAE Editora e Distribuidora de Livros Ltda | /editoras/pae-editora-distribuidora-livros.png | logo: "/editoras/pae-editora-distribuidora-livros.png" |
| Editora Popular | /editoras/editora-popular.png | logo: "/editoras/editora-popular.png" |
| Editora Progresso | /editoras/editora-progresso.png | logo: "/editoras/editora-progresso.png" |
