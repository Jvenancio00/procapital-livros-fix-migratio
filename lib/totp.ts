import { authenticator } from "otplib";

/**
 * 2FA por TOTP (Google Authenticator, Authy, etc.) — corrige "Problema 2 –
 * Segurança" da secção Entrar. Escolhido de propósito por não depender de
 * nenhum serviço externo (SMS/email de terceiros): a validação é só
 * criptografia local, ao contrário de 2FA por SMS, que exigiria contratar
 * uma operadora/gateway.
 */

export function generateTotpSecret() {
  return authenticator.generateSecret();
}

export function getTotpUri(secret: string, email: string) {
  return authenticator.keyuri(email, "Pro Capital", secret);
}

export function verifyTotpToken(secret: string, token: string) {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}
