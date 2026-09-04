// DESCONTINUADO: este ficheiro deixou de ser usado depois da unificação
// dos dois sistemas de cliente (ver /api/cliente/perfil e
// hooks/useClientAuth.tsx). Mantido apenas como referência para migrar
// manualmente estes 5 clientes/descontos para ClientProfile na base de
// dados, se ainda não tiverem sido lá inseridos.
export interface AuthorizedClient {
  id: string;
  email: string;
  company: string;
  type: "livraria" | "revendedor" | "escola";
  discount: number; // percentage (0-100)
}

export const AUTHORIZED_CLIENTS: AuthorizedClient[] = [
  {
    id: "liv-001",
    email: "info@livrariamaputo.mz",
    company: "Livraria Maputo",
    type: "livraria",
    discount: 20,
  },
  {
    id: "liv-002",
    email: "pedidos@livrariageral.mz",
    company: "Livraria Geral",
    type: "livraria",
    discount: 18,
  },
  {
    id: "rev-001",
    email: "vendas@revendedor-norte.mz",
    company: "Revendedor Norte",
    type: "revendedor",
    discount: 15,
  },
  {
    id: "esc-001",
    email: "biblioteca@escolasecundaria.mz",
    company: "Escola Secundária Central",
    type: "escola",
    discount: 12,
  },
  {
    id: "pro-001",
    email: "geral@procapital.co.mz",
    company: "Pro Capital",
    type: "revendedor",
    discount: 25,
  },
];
