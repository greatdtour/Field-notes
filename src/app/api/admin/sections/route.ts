import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const sections = Array.isArray(body?.sections) ? body.sections : [];

  for (const section of sections) {
    await prisma.pageSection.upsert({
      where: { id: section.id },
      update: {
        title: section.title ?? null,
        body: section.body ?? null,
        order: Number(section.order) || 0,
        visible: Boolean(section.visible),
        type: String(section.type || "custom"),
      },
      create: {
        id: String(section.id),
        page: String(section.page || "home"),
        type: String(section.type || "custom"),
        title: section.title ?? null,
        body: section.body ?? null,
        order: Number(section.order) || 0,
        visible: Boolean(section.visible),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
