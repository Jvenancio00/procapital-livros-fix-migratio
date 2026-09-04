import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactReason } from "@prisma/client";

// Corrige a secção "Fale Connosco": antes, o formulário só abria o cliente
// de email do visitante (mailto:), sem nenhum registo no lado do servidor
// — se o email falhasse ou não fosse enviado, o contacto perdia-se sem
// deixar rasto. Agora fica sempre gravado, com o motivo qualificado
// (Problema 2 do relatório), o que já permite medir quantos contactos
// chegam e de que tipo (Problema 4).
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, reason, message } = body;

  if (!name || !email || !message || !reason) {
    return NextResponse.json({ error: "Campos obrigatórios em falta." }, { status: 400 });
  }
  if (!Object.values(ContactReason).includes(reason)) {
    return NextResponse.json({ error: "Motivo inválido." }, { status: 400 });
  }

  const request_ = await prisma.contactRequest.create({
    data: { name, email, phone: phone || null, reason, message },
  });

  return NextResponse.json({ id: request_.id });
}
