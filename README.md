# Mental Health App

KI-Begleiter, Stimmungs-/Gesundheits-Tracking, Aktivitäts-Korrelation und digitales Tagebuch.

## Architektur

```
apps/
  web/      Next.js (App Router) – Landing Page, Login, Dashboard. Später: React Native Mobile-App teilt das Backend.
  api/      NestJS – REST API, Business-Logik, KI-Chat-Proxy zu Claude
packages/
  shared/   Gemeinsame TypeScript-Typen & Zod-Schemas (FE + BE)
```

**Tech-Stack & Begründung**

| Baustein | Wahl | Warum |
|---|---|---|
| Frontend | Next.js (React) | Web zuerst, teilt später Typen/API-Client mit einer React-Native-App |
| Backend | NestJS (TypeScript) | Modularer Aufbau (Mood/Journal/Activities/Chat als eigene Module) – lässt sich bei Bedarf in Services aufteilen, ohne dass man von Tag 1 an Microservices betreiben muss |
| Datenbank | PostgreSQL via Supabase + Prisma | Managed Postgres, eingebaute Auth & Row-Level-Security (wichtig bei Gesundheitsdaten), Storage für spätere Uploads – bleibt Standard-Postgres, kein Lock-in |
| Cache/Queue | Upstash Redis | Serverless, pay-per-use, für Rate-Limiting/Background-Jobs |
| KI-Chat | Anthropic Claude API | Ausschließlich serverseitig aufgerufen, Key nie im Client |
| Hosting | Vercel (Web) + Fly.io/Render (API, Docker) + Supabase (DB/Auth) | Kein eigenes Ops-Team nötig, horizontal skalierbar ohne Architekturwechsel |

## Skalierungspfad

Start (paar hundert Nutzer) → Wachstum (hunderttausende bis Millionen), **ohne Architekturwechsel**:

- **API**: zustandslos (kein In-Memory-Session-State) → mehr Container-Instanzen hinter Load Balancer hochfahren (Fly.io/Render Autoscaling)
- **DB**: erst vertikal skalieren (mehr Compute bei Supabase), dann Read-Replicas für Leseabfragen (Korrelations-Analysen, Verlaufsdaten), Connection-Pooling via PgBouncer (in Supabase enthalten)
- **Redis**: Upstash skaliert automatisch mit Request-Volumen
- **KI-Chat**: zustandslos pro Request, horizontal beliebig skalierbar; Kosten wachsen linear mit Anthropic-API-Nutzung
- **CDN**: Next.js/Vercel liefert statische Assets automatisch über Edge-CDN aus
- Erst bei sehr hohem Wachstum (Millionen aktive Nutzer) wird ein Wechsel zu AWS/eigenem Kubernetes nötig – bis dahin sind es reine Konfigurations-/Scaling-Parameter, kein Rewrite

## Sicherheit & Datenschutz

- Gesundheitsdaten sind besonders sensibel (DSGVO Art. 9) → Row-Level-Security in Supabase, JWT-Verifikation serverseitig, HTTPS überall, Rate-Limiting gegen Missbrauch
- Der KI-Chat ist **kein Ersatz für Therapie**; das System-Prompt weist bei Hinweisen auf Krisen auf professionelle Hilfe hin (wird in einer eigenen Aufgabe um einen echten Krisen-Modus/Hotline-Hinweis erweitert)

## Lokale Entwicklung

Voraussetzungen: Node 20+, [pnpm](https://pnpm.io), Docker.

```bash
# 1. Postgres + Redis lokal starten
docker compose up -d

# 2. Abhängigkeiten installieren
pnpm install

# 3. Env-Dateien anlegen
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# In apps/api/.env: DATABASE_URL, SUPABASE_URL, ANTHROPIC_API_KEY eintragen
# In apps/web/.env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY eintragen

# 4. Datenbank-Schema anwenden + Beispiel-Aktivitäten seeden
pnpm db:migrate
pnpm --filter api exec prisma db seed

# 5. Beide Apps starten
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/health

Für Supabase-Werte: kostenloses Projekt auf https://supabase.com anlegen. `DATABASE_URL` unter Project Settings → Database (Connect-Dialog) kopieren, `SUPABASE_URL` unter Project Settings → API.
Für `ANTHROPIC_API_KEY`: API-Key unter https://console.anthropic.com erstellen.

## Deployment (Kurzfassung)

- **Web** → Vercel, Root-Verzeichnis `apps/web`, Env-Vars aus `.env.example` setzen
- **API** → Fly.io/Render, `apps/api/Dockerfile` verwenden, Env-Vars setzen, `prisma migrate deploy` als Release-Command
- **DB/Auth** → Supabase-Projekt (Production)
- **Redis** → Upstash-Instanz

## Status

Dies ist das Infrastruktur-Grundgerüst: Monorepo, Auth-Anbindung, Datenmodell (erster Entwurf), CRUD-Endpunkte für Mood/Journal/Activities, ein einfacher KI-Chat-Endpunkt und eine erste (noch simple) Aktivitäts-Korrelation. Die eigentliche Produkt-/UI-Gestaltung folgt in einzelnen Aufgaben.
