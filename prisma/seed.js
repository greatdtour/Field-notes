const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@gdtfieldnotes.com";
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userEmail = "user@gdtfieldnotes.com";
  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "GDT Admin", password: adminPassword, role: "ADMIN" },
    create: {
      name: "GDT Admin",
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: userEmail },
    update: { name: "GDT User", password: userPassword, role: "USER" },
    create: {
      name: "GDT User",
      email: userEmail,
      password: userPassword,
      role: "USER",
    },
  });

  const categoryNames = ["Adventure", "Culture", "Food", "Nature"];
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const sections = [
    { page: "home", type: "hero", title: "GDT Field Notes", body: "Stories from roads less traveled." },
    { page: "home", type: "featured", title: "Featured Essays", body: "Editor picks and community favorites." },
    { page: "home", type: "field-notes", title: "Field Notes", body: "Browse essays by category and place." },
    { page: "home", type: "about", title: "About Us", body: "We collect travel narratives grounded in place, people, and culture." },
    { page: "home", type: "subscribe", title: "Subscribe", body: "Get new essays in your inbox." },
    { page: "home", type: "partner", title: "Partner Interest", body: "Vendors can propose collaborations and partnerships." },
    { page: "home", type: "footer", title: "Footer", body: "GDT Field Notes" },
  ];

  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index];
    await prisma.pageSection.upsert({
      where: { id: `${section.page}-${section.type}` },
      update: {
        title: section.title,
        body: section.body,
        order: index,
        visible: true,
      },
      create: {
        id: `${section.page}-${section.type}`,
        page: section.page,
        type: section.type,
        title: section.title,
        body: section.body,
        order: index,
        visible: true,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
