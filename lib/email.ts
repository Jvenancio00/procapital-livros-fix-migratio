import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export type EmailTemplateKey =
  | "REGISTRATION_WELCOME"
  | "EMAIL_VERIFICATION"
  | "PASSWORD_RESET"
  | "ORDER_CONFIRMATION"
  | "PAYMENT_STATUS"
  | "ORDER_STATUS_UPDATE"
  | "SHIPMENT_CONFIRMATION"
  | "QUOTE_REQUEST"
  | "COMMERCIAL_CONTACT"
  | "LOW_STOCK_ALERT";

export interface EmailSendResult {
  sent: boolean;
  status: "SENT" | "UNCONFIGURED" | "FAILED" | "INVALID_EMAIL";
  provider: "smtp" | "resend" | "none";
  errorMessage?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmailAddress(email: string | null | undefined): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  return trimmed.length <= 254 && EMAIL_REGEX.test(trimmed);
}

export function getConfiguredEmailProvider(): "smtp" | "resend" | "none" {
  if (process.env.SMTP_HOST?.trim()) return "smtp";
  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  return "none";
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapEditorialLayout(title: string, subtitle: string, bodyHtml: string, ctaLabel?: string, ctaUrl?: string) {
  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background-color:#faf8f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e7e2d8;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="background:#0f172a;padding:24px 32px;border-bottom:3px solid #f59e0b;">
              <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#f59e0b;font-weight:700;">PRO CAPITAL · DISTRIBUIDORA EDITORIAL</div>
              <h1 style="margin:10px 0 4px;font-size:22px;color:#ffffff;font-family:Georgia,serif;">${escapeHtml(title)}</h1>
              <p style="margin:0;font-size:13px;color:#cbd5e1;">${escapeHtml(subtitle)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;font-size:14px;line-height:1.65;color:#1e293b;">
              ${bodyHtml}
              ${
                ctaLabel && ctaUrl
                  ? `<div style="margin:26px 0 8px;">
                      <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#991b1b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:13px;">${escapeHtml(ctaLabel)}</a>
                    </div>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:18px 32px;border-top:1px solid #e7e2d8;font-size:12px;color:#64748b;">
              Pro Capital, Lda · NUIT 401430857 · Rua Almeida Garrett, n.º 366, Maputo · comercial@procapitalmz.com
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildTemplateContent(
  template: EmailTemplateKey,
  data: Record<string, string | number | undefined>
): { subject: string; html: string; text: string } {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_URL;
  const str = (key: string, fallback = "") => String(data[key] ?? fallback);

  switch (template) {
    case "REGISTRATION_WELCOME":
      return {
        subject: "Bem-vindo à Pro Capital — Conta criada",
        text: `Olá ${str("name", "Leitor")},\nA sua conta na Pro Capital foi criada com sucesso (${str("email")}).\nAceda ao catálogo em ${baseUrl}/catalogo`,
        html: wrapEditorialLayout(
          "Bem-vindo à Pro Capital",
          "Plataforma editorial e comercial lusófona",
          `<p>Olá <strong>${escapeHtml(str("name", "Parceiro"))}</strong>,</p>
           <p>A sua conta foi registada com o endereço <strong>${escapeHtml(str("email"))}</strong> (${escapeHtml(str("profileLabel", "Leitor particular"))}).</p>
           <p>Pode consultar catálogos por país, encomendar livros escolares e solicitar cotações B2B diretamente na plataforma.</p>`,
          "Explorar catálogo",
          `${baseUrl}/catalogo`
        ),
      };

    case "EMAIL_VERIFICATION":
      return {
        subject: "Verifique o seu email — Pro Capital",
        text: `Confirme o seu endereço de email na Pro Capital através da ligação: ${str("verifyUrl")}`,
        html: wrapEditorialLayout(
          "Confirmação de endereço de email",
          "Valide o seu acesso na plataforma Pro Capital",
          `<p>Olá <strong>${escapeHtml(str("name", "Utilizador"))}</strong>,</p>
           <p>Clique no botão abaixo para confirmar o seu endereço de email. A ligação é válida por 24 horas.</p>`,
          "Confirmar email",
          str("verifyUrl", `${baseUrl}/loja/entrar`)
        ),
      };

    case "PASSWORD_RESET":
      return {
        subject: "Recuperação de palavra-passe — Pro Capital",
        text: `Para redefinir a sua palavra-passe na Pro Capital, aceda a: ${str("resetUrl")} (válido por 60 minutos).`,
        html: wrapEditorialLayout(
          "Recuperação de palavra-passe",
          "Pedido de reposição de credenciais",
          `<p>Recebemos um pedido para redefinir a palavra-passe associada a <strong>${escapeHtml(str("email"))}</strong>.</p>
           <p>Esta ligação expira em 60 minutos. Se não efetuou este pedido, pode ignorar esta mensagem.</p>`,
          "Redefinir palavra-passe",
          str("resetUrl", `${baseUrl}/loja/recuperar-senha`)
        ),
      };

    case "ORDER_CONFIRMATION":
      return {
        subject: `Encomenda ${str("orderNumber")} registada — Pro Capital`,
        text: `A sua encomenda ${str("orderNumber")} no valor total de ${str("totalFormatted")} (${str("marketName")}) foi registada com estado "${str("statusLabel")}". Acompanhe em ${baseUrl}/loja/encomendas/${str("orderId")}`,
        html: wrapEditorialLayout(
          `Encomenda ${str("orderNumber")}`,
          `Mercado: ${str("marketName")} · Estado: ${str("statusLabel")}`,
          `<p>Olá <strong>${escapeHtml(str("buyerName", "Cliente"))}</strong>,</p>
           <p>Registámos a sua encomenda <strong>${escapeHtml(str("orderNumber"))}</strong> com reserva de stock garantida.</p>
           <p><strong>Total:</strong> ${escapeHtml(str("totalFormatted"))}<br/>
              <strong>Método de pagamento:</strong> ${escapeHtml(str("paymentMethod"))}</p>
           ${str("paymentInstructions") ? `<p style="background:#faf8f5;border-left:3px solid #991b1b;padding:12px;">${escapeHtml(str("paymentInstructions"))}</p>` : ""}`,
          "Acompanhar encomenda",
          `${baseUrl}/loja/encomendas/${str("orderId")}`
        ),
      };

    case "PAYMENT_STATUS":
      return {
        subject: `Estado de pagamento atualizado (${str("orderNumber")}) — Pro Capital`,
        text: `O pagamento da encomenda ${str("orderNumber")} encontra-se no estado: ${str("paymentStatusLabel")}.`,
        html: wrapEditorialLayout(
          "Atualização de Pagamento",
          `Encomenda ${str("orderNumber")}`,
          `<p>O pagamento referente à encomenda <strong>${escapeHtml(str("orderNumber"))}</strong> foi atualizado para: <strong>${escapeHtml(str("paymentStatusLabel"))}</strong>.</p>
           ${str("notes") ? `<p>Observações: ${escapeHtml(str("notes"))}</p>` : ""}`,
          "Ver detalhes da encomenda",
          `${baseUrl}/loja/encomendas/${str("orderId")}`
        ),
      };

    case "ORDER_STATUS_UPDATE":
      return {
        subject: `Encomenda ${str("orderNumber")} — ${str("statusLabel")}`,
        text: `O estado da sua encomenda ${str("orderNumber")} mudou para ${str("statusLabel")}.`,
        html: wrapEditorialLayout(
          `Estado da Encomenda: ${str("statusLabel")}`,
          `Referência ${str("orderNumber")}`,
          `<p>Informamos que a sua encomenda <strong>${escapeHtml(str("orderNumber"))}</strong> passou para o estado <strong>${escapeHtml(str("statusLabel"))}</strong>.</p>`,
          "Consultar encomenda",
          `${baseUrl}/loja/encomendas/${str("orderId")}`
        ),
      };

    case "SHIPMENT_CONFIRMATION":
      return {
        subject: `Encomenda ${str("orderNumber")} expedida — Pro Capital`,
        text: `A sua encomenda ${str("orderNumber")} foi expedida. Morada: ${str("shippingAddress")}.`,
        html: wrapEditorialLayout(
          "Encomenda Expedida",
          `Referência ${str("orderNumber")}`,
          `<p>A sua encomenda <strong>${escapeHtml(str("orderNumber"))}</strong> saiu do armazém com destino a <strong>${escapeHtml(str("shippingAddress", "morada indicada"))}</strong>.</p>`,
          "Seguir encomenda",
          `${baseUrl}/loja/encomendas/${str("orderId")}`
        ),
      };

    case "QUOTE_REQUEST":
      return {
        subject: `Pedido de Cotação ${str("quoteNumber")} — Pro Capital`,
        text: `Recebemos o pedido de cotação ${str("quoteNumber")} de ${str("contactName")} (${str("organizationName")}).`,
        html: wrapEditorialLayout(
          `Pedido de Cotação ${str("quoteNumber")}`,
          `${str("organizationName", "Cliente Institucional")} · ${str("marketName", "CPLP")}`,
          `<p>Olá <strong>${escapeHtml(str("contactName"))}</strong>,</p>
           <p>Recebemos o seu pedido de cotação comercial <strong>${escapeHtml(str("quoteNumber"))}</strong> com <strong>${escapeHtml(str("itemCount", "1"))}</strong> título(s).</p>
           <p>A equipa comercial da Pro Capital analisará a disponibilidade por armazém e responderá com proposta formal.</p>`,
          "Consultar catálogo escolar",
          `${baseUrl}/livros-escolares`
        ),
      };

    case "COMMERCIAL_CONTACT":
      return {
        subject: `Contacto Comercial recebido (${str("reason")}) — Pro Capital`,
        text: `Contacto de ${str("name")} (${str("email")}): ${str("message")}`,
        html: wrapEditorialLayout(
          "Contacto Comercial Registado",
          `Motivo: ${str("reason")}`,
          `<p>Recebemos a mensagem de <strong>${escapeHtml(str("name"))}</strong> (${escapeHtml(str("email"))}${str("company") ? ` · ${escapeHtml(str("company"))}` : ""}):</p>
           <blockquote style="margin:16px 0;padding:12px 16px;background:#faf8f5;border-left:3px solid #f59e0b;">${escapeHtml(str("message"))}</blockquote>`
        ),
      };

    case "LOW_STOCK_ALERT":
      return {
        subject: `[Alerta de Stock Baixo] ${str("bookTitle")} (${str("warehouseCode")})`,
        text: `Alerta de stock baixo: "${str("bookTitle")}" no armazém ${str("warehouseName")} tem apenas ${str("available")} unidades disponíveis (mínimo configurado: ${str("threshold")}).`,
        html: wrapEditorialLayout(
          "Alerta Administrativo de Stock Baixo",
          `Armazém ${str("warehouseName")} (${str("warehouseCode")})`,
          `<p>O título <strong>${escapeHtml(str("bookTitle"))}</strong> atingiu o limite de alerta de stock:</p>
           <ul>
             <li><strong>Disponível atual:</strong> ${escapeHtml(str("available"))} un.</li>
             <li><strong>Limite mínimo:</strong> ${escapeHtml(str("threshold"))} un.</li>
             <li><strong>ISBN:</strong> ${escapeHtml(str("isbn", "N/D"))}</li>
           </ul>`,
          "Abrir gestão de stock",
          `${baseUrl}/admin/stock`
        ),
      };
  }
}

export async function sendTransactionalEmail(params: {
  template: EmailTemplateKey;
  to: string;
  data: Record<string, string | number | undefined>;
}): Promise<EmailSendResult> {
  const recipient = params.to.trim();
  const rendered = buildTemplateContent(params.template, params.data);

  if (!isValidEmailAddress(recipient)) {
    await prisma.emailLog
      .create({
        data: {
          template: params.template,
          recipient: recipient || "(vazio)",
          subject: rendered.subject,
          status: "INVALID_EMAIL",
          provider: "none",
          errorMessage: "Endereço de email inválido.",
          metaJson: params.data as object,
        },
      })
      .catch(() => {});
    return {
      sent: false,
      status: "INVALID_EMAIL",
      provider: "none",
      errorMessage: "Endereço de email inválido.",
    };
  }

  const provider = getConfiguredEmailProvider();
  const from = process.env.EMAIL_FROM?.trim() || "Pro Capital <comercial@procapitalmz.com>";

  if (provider === "none") {
    await prisma.emailLog
      .create({
        data: {
          template: params.template,
          recipient,
          subject: rendered.subject,
          status: "UNCONFIGURED",
          provider: "none",
          errorMessage:
            "Fornecedor de email não configurado (defina SMTP_HOST ou RESEND_API_KEY).",
          metaJson: params.data as object,
        },
      })
      .catch(() => {});
    return {
      sent: false,
      status: "UNCONFIGURED",
      provider: "none",
      errorMessage: "Serviço de email ainda não configurado no servidor.",
    };
  }

  try {
    if (provider === "smtp") {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST!.trim(),
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER?.trim()
          ? {
              user: process.env.SMTP_USER.trim(),
              pass: process.env.SMTP_PASS ?? "",
            }
          : undefined,
      });
      await transporter.sendMail({
        from,
        to: recipient,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      });
    } else {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        }),
      });
      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        throw new Error(`Resend HTTP ${response.status}: ${errBody}`);
      }
    }

    await prisma.emailLog
      .create({
        data: {
          template: params.template,
          recipient,
          subject: rendered.subject,
          status: "SENT",
          provider,
          metaJson: params.data as object,
        },
      })
      .catch(() => {});

    return { sent: true, status: "SENT", provider };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido no envio";
    await prisma.emailLog
      .create({
        data: {
          template: params.template,
          recipient,
          subject: rendered.subject,
          status: "FAILED",
          provider,
          errorMessage,
          metaJson: params.data as object,
        },
      })
      .catch(() => {});
    return { sent: false, status: "FAILED", provider, errorMessage };
  }
}
