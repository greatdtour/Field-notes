import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await request.json();
  const postId = String(body?.postId || "");

  if (!postId) {
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  }

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { postId, userId: user.id } });
  }

  const likes = await prisma.like.count({ where: { postId } });
  return NextResponse.json({ ok: true, likes });
}
