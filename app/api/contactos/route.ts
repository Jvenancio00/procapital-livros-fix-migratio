import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactReason } from "@prisma/client";
import { isValidEmailAddress, sendTransactionalEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const { name, email, phone, company, reason, message } = body;

  if (!name || !isValidEmailAddress(email) || !message || !reason) {
    return NextResponse.json({ error: "Campos obrigatórios em falta ou email inválido." }, { status: 400 });
  }
  if (!Object.values(ContactReason).includes(reason)) {
    return NextResponse.json({ error: "Motivo inválido." }, { status: 400 });
  }

  const request_ = await prisma.contactRequest.create({
    data: {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      company: company ? String(company).trim() : null,
      reason,
      message: String(message).trim(),
    },
  });

  const adminEmail = process.env.ADMIN_ALERT_EMAIL?.trim() || "comercial@procapitalmz.com";
  const emailResult = await sendTransactionalEmail({
    template: "COMMERCIAL_CONTACT",
    to: adminEmail,
    data: {
      name: request_.name,
      email: request_.email,
      company: request_.company ?? undefined,
      reason: request_.reason,
      message: request_.message,
    },
  });

  return NextResponse.json({
    id: request_.id,
    emailNotification: emailResult,
  });
}
