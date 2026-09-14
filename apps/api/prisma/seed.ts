import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultActivities: Array<{ name: string; category: string }> = [
  { name: "Sport", category: "Bewegung" },
  { name: "Spaziergang", category: "Bewegung" },
  { name: "Schlaf < 6h", category: "Schlaf" },
  { name: "Schlaf 6-8h", category: "Schlaf" },
  { name: "Meditation", category: "Entspannung" },
  { name: "Soziale Kontakte", category: "Sozial" },
  { name: "Arbeit/Studium", category: "Alltag" },
  { name: "Bildschirmzeit hoch", category: "Alltag" },
  { name: "Alkohol", category: "Konsum" },
  { name: "Koffein", category: "Konsum" },
  { name: "Zeit in der Natur", category: "Entspannung" },
  { name: "Lesen", category: "Entspannung" },
];

async function main() {
  for (const activity of defaultActivities) {
    await prisma.activity.upsert({
      where: { name: activity.name },
      update: {},
      create: activity,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
