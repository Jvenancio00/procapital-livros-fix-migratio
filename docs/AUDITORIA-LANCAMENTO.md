# Revisão de lançamento — estado parcial

Este documento regista uma revisão técnica inicial, não uma certificação de lançamento. As alterações desta branch não estão publicadas até serem integradas e instaladas em produção.

## A. Implementado e verificado localmente

- URL canónico por defeito aponta para `https://procapital-livros-fix-migration.vercel.app`; a variável `NEXT_PUBLIC_SITE_URL` continua a permitir uma futura migração. Foi verificado localmente o canonical da home; `robots` em preview continua bloqueado e o teste unitário verifica a configuração de produção.
- Português é o primeiro idioma quando não há preferência explícita guardada; os seis idiomas e a escolha guardada continuam disponíveis. Não é uma tradução integral do site.
- Preferências antigas de mercado/moeda inconsistentes passam a usar a moeda correspondente ao mercado guardado. Não foram alterados preços, taxas de conversão, pagamento ou checkout.
- Removido o valor fictício de 20 unidades quando o stock de uma obra é desconhecido no catálogo, cartões e ficha: apresenta-se consulta e a compra imediata deixa de ser oferecida por esse stock inexistente; títulos com stock conhecido ou pré-encomenda mantêm a lógica existente.
- Os indicadores do hero descrevem os dados contados: títulos de catálogo, editoras no diretório, títulos com classificação de ensino e mercados configurados. Não são prova de parceiros contratados nem de operação comercial em cada país.
- Removidas promessas de resposta em 24 horas em contactos, cotações, FAQ, agradecimento e página institucional; FAQ deixa de prometer prazos de entrega fixos.
- `npx tsc --noEmit`: passou. `npm run lint`: 0 erros, 19 avisos. `npm run build`: passou sem BD configurada. `npx tsx --test tests/launch-readiness.test.ts tests/seo-robots.test.ts tests/publisher-school.test.ts tests/school-category.test.ts`: 10 testes passaram.
- HTTP local sem BD: `/`, `/catalogo`, `/livro/matematica-8a-classe`, `/editoras`, `/sobre`, `/contactos`, `/convenios`, `/cotacoes`, `/carrinho`, `/checkout`, `/loja/entrar`, `/robots.txt`, `/sitemap.xml` responderam 200. Verificou-se no HTML local o canonical da Vercel, o título português e stock desconhecido sob consulta. Isto não testa interações, pagamentos ou formulários.

## B. Implementado, sujeito a validação

- A referência comercial `comercial@procapitalmz.com` foi anteriormente fornecida pelo proprietário e mantida, mas a caixa, entrega SMTP e propriedade do domínio de email não foram verificadas. A receção de pedidos depende da base de dados e da configuração de email; a resposta HTTP bem-sucedida não prova entrega do email.
- Os títulos e preços de fallback estão no repositório e a aplicação pode apresentá-los quando a BD está vazia ou indisponível. A sua validade comercial e a proveniência dos dados não foram verificadas. Há também preços estáticos usados como fallback quando faltam linhas de preços da BD. O proprietário deve confirmar catálogo e preços por mercado antes de disponibilizar vendas; alterações de preços e checkout não foram feitas nesta revisão.
- Não foram confirmadas as condições de pré-encomenda, frete, descontos por quantidade e prazos existentes em `lib/markets.ts` e no carrinho; podem contradizer a comunicação de consulta. Rever com o proprietário antes de transações reais.
- O projeto contém duas imagens de editoras cuja origem e autorização continuam por verificar; os demais símbolos permanecem identificados como provisórios.

## C. Pendências do proprietário

1. **Domínio e Vercel** — enviar captura de Project → Settings → Domains e confirmar propriedade/estado do domínio personalizado; não há acesso ao painel. A captura anterior mostrava ambos os domínios personalizados com configuração inválida; não demonstra se estão registados ou a quem pertencem. Na Vercel, em Settings → Environment Variables, ajustar `NEXT_PUBLIC_SITE_URL` em Production para o URL gratuito e publicar novamente. Remover associações personalizadas apenas depois de confirmar propriedade e impacto; não alterar DNS ou email sem revisão. Necessário para SEO correto em produção.
2. **Catálogo e operação** — confirmar listas de obras e editoras, direitos/representações, preços por moeda, stock por armazém, mercados realmente atendidos, portes, descontos, pré-encomendas, prazos e condições. Formato: tabela por ISBN/slug, mercado, moeda e montante, mais documento de regras comerciais. Bloqueia lançamento de vendas até confirmado.
3. **Comunicação e dados legais** — confirmar email, telefone, morada, NUIT, horário, receção de pedidos e dados de faturação; fornecer documentos aprovados e revisão jurídica das políticas existentes. Bloqueia comunicações e documentos definitivos.
4. **Integrações** — configurar e verificar com o proprietário BD de teste, fornecedor de email e, se aplicável, gateways de pagamento em modo de teste; nenhuma credencial deve ser enviada na conversa ou guardada no repositório. Bloqueia afirmações de envio/pagamento operacional.
5. **Identidade e credibilidade** — fornecer logótipos autorizados, fotografias reais e quaisquer testemunhos e documentos comprovados, ou manter os espaços provisórios. Pode ser fase posterior, desde que não sejam apresentados factos não confirmados.

## D. Pendências técnicas e limites

- Na consulta pública, o endereço Vercel respondeu com a página do site; `https://procapitalmz.com/` devolveu uma listagem `Index of /`. Isto não prova registo, propriedade, estado de TLS em todas as redes ou estado da configuração atual no painel Vercel. Nenhum domínio ou DNS foi modificado.
- A versão servida publicamente tinha sitemap no domínio personalizado. O código alterado só terá efeito depois do deployment e se a variável de ambiente não o sobrepuser. Revalidar canonical, sitemap, robots, Open Graph e links de partilha após deployment.
- Não foram executados Lighthouse, navegador/Playwright, testes responsivos, acessibilidade visual, consola ou auditoria de todos os links. O ambiente anterior não tinha Chromium executável. Não há comparação LCP/CLS.
- Não foram testados ponta a ponta login, carrinho, upload, checkout, gateways, email e formulários com BD de teste; nenhum pedido, email ou transação real foi produzido. Falta exercitar fluxos com contas e dados de teste isolados.
- A tradução integral dos seis idiomas, inventário completo de páginas, SEO e dados estruturados, revisão de todas as estatísticas/contactos e políticas, filtros e fluxos B2B/B2C continuam pendentes. Muitos textos fora dos dicionários continuam em português mesmo com outros idiomas selecionados.
- O botão de pausa das animações foi removido a pedido anterior; movimento automático com mais de cinco segundos pode falhar WCAG 2.2.2. A solução de acessibilidade requer decisão do proprietário.
- O projeto utiliza fallback para dados estáticos se a base de dados não estiver disponível, descontos e valores de entrega existentes não confirmados e configuração separada de preços/mercado. Antes do lançamento, fazer auditoria técnica e comercial completa; este relatório não atesta que o site está pronto para receber pagamentos.
