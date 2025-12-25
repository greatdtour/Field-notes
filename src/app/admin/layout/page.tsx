import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { AdminLayoutEditor } from "@/components/AdminLayoutEditor";

export default async function AdminLayoutPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const sections = await prisma.pageSection.findMany({
    where: { page: "home" },
    orderBy: { order: "asc" },
  });

  return (
    <main className="page-shell pb-16">
      <section className="section-card p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Layout Builder</p>
        <h2 className="text-3xl font-semibold mt-4" style={{ fontFamily: "var(--font-display)" }}>
          Edit page sections
        </h2>
        <div className="mt-8">
          <AdminLayoutEditor initialSections={sections} />
        </div>
      </section>
    </main>
  );
}
