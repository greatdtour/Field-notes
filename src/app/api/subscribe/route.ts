import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim();
  const wantsToPost = formData.get("wantsToPost") === "on";

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  await prisma.subscription.upsert({
    where: { email },
    update: { wantsToPost },
    create: { email, wantsToPost },
  });

  return NextResponse.redirect(new URL("/", request.url));
}
