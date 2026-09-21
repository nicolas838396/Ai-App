import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultActivities: Array<{ name: string; category: string }> = [
  // Bewegung
  { name: "Sport", category: "Bewegung" },
  { name: "Spaziergang", category: "Bewegung" },
  { name: "Laufen", category: "Bewegung" },
  { name: "Rad fahren", category: "Bewegung" },
  { name: "Schwimmen", category: "Bewegung" },
  { name: "Yoga", category: "Bewegung" },
  { name: "Krafttraining", category: "Bewegung" },
  { name: "Wandern", category: "Bewegung" },
  { name: "Tanzen", category: "Bewegung" },
  { name: "Ballsport", category: "Bewegung" },
  { name: "Dehnen", category: "Bewegung" },

  // Ernährung
  { name: "Gesund gegessen", category: "Ernährung" },
  { name: "Ungesund gegessen", category: "Ernährung" },
  { name: "Viel Zucker", category: "Ernährung" },
  { name: "Wenig Zucker", category: "Ernährung" },
  { name: "Kein Zucker", category: "Ernährung" },
  { name: "Koffein", category: "Ernährung" },
  { name: "Viel Wasser getrunken", category: "Ernährung" },
  { name: "Wenig Wasser getrunken", category: "Ernährung" },
  { name: "Alkohol", category: "Ernährung" },

  // Schlaf
  { name: "Gut geschlafen", category: "Schlaf" },
  { name: "Schlecht geschlafen", category: "Schlaf" },
  { name: "Früh im Bett", category: "Schlaf" },
  { name: "Spät im Bett", category: "Schlaf" },
  { name: "Handy vorm Schlafen", category: "Schlaf" },
  { name: "Ausgeschlafen aufgewacht", category: "Schlaf" },
  { name: "Mittagsschlaf", category: "Schlaf" },

  // Sozial
  { name: "Freunde getroffen", category: "Sozial" },
  { name: "Familie getroffen", category: "Sozial" },
  { name: "Partner/in getroffen", category: "Sozial" },
  { name: "Viel allein", category: "Sozial" },
  { name: "Neue Menschen kennengelernt", category: "Sozial" },
  { name: "Telefoniert", category: "Sozial" },
  { name: "Soziale Kontakte", category: "Sozial" },

  // Wetter (also loggable automatically via geolocation from the journal page)
  { name: "Sonnig", category: "Wetter" },
  { name: "Bewölkt", category: "Wetter" },
  { name: "Regnerisch", category: "Wetter" },
  { name: "Windig", category: "Wetter" },
  { name: "Stürmisch", category: "Wetter" },
  { name: "Schnee", category: "Wetter" },
  { name: "Nebel", category: "Wetter" },

  // Entspannung
  { name: "Meditation", category: "Entspannung" },
  { name: "Zeit in der Natur", category: "Entspannung" },
  { name: "Lesen", category: "Entspannung" },
  { name: "Musik gehört", category: "Entspannung" },
  { name: "Kreativ gewesen", category: "Entspannung" },

  // Alltag
  { name: "Arbeit/Studium", category: "Alltag" },
  { name: "Bildschirmzeit hoch", category: "Alltag" },
  { name: "Gelernt/Weitergebildet", category: "Alltag" },
  { name: "Haustier gekümmert", category: "Alltag" },
  { name: "Gespielt", category: "Alltag" },
];

async function main() {
  for (const activity of defaultActivities) {
    await prisma.activity.upsert({
      where: { name: activity.name },
      // Recategorizing an existing name (e.g. moving "Koffein" from the old
      // "Konsum" bucket into "Ernährung") should take effect on reseed.
      update: { category: activity.category },
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
