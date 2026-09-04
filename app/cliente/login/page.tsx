import { redirect } from "next/navigation";

// Corrige o achado de dois sistemas de cliente paralelos: já não existe
// um formulário próprio que só verifica um email contra uma lista fixa,
// sem password nem verificação no servidor. Passa a existir uma única
// porta de entrada (NextAuth, com password e bcrypt) em /loja/entrar.
export default function ClientLoginRedirectPage() {
  redirect("/loja/entrar?callbackUrl=%2Fcliente%2Fcatalogo");
}
