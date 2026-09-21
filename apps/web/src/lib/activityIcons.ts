import {
  Dumbbell,
  Footprints,
  Zap,
  Bike,
  Waves,
  Flower2,
  Mountain,
  Music,
  Volleyball,
  PersonStanding,
  Salad,
  Pizza,
  Candy,
  Cookie,
  ShieldCheck,
  Coffee,
  Droplets,
  Droplet,
  Wine,
  BedDouble,
  Bed,
  Moon,
  MoonStar,
  Smartphone,
  Sunrise,
  Users,
  Home,
  HeartHandshake,
  User,
  UserPlus,
  PhoneCall,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Tornado,
  CloudSnow,
  CloudFog,
  TreePine,
  Book,
  Palette,
  Briefcase,
  GraduationCap,
  Dog,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

// Activity names come straight from the backend (a plain, free-text
// `name` column) — this maps the known catalog to a fitting icon for the
// journal's tap-to-log picker. Anything not listed falls back to a
// per-category icon, so a newly-seeded activity never renders without one.
const NAME_ICONS: Record<string, LucideIcon> = {
  // Bewegung
  Sport: Dumbbell,
  Spaziergang: Footprints,
  Laufen: Zap,
  "Rad fahren": Bike,
  Schwimmen: Waves,
  Yoga: Flower2,
  Krafttraining: Dumbbell,
  Wandern: Mountain,
  Tanzen: Music,
  Ballsport: Volleyball,
  Dehnen: PersonStanding,

  // Ernährung
  "Gesund gegessen": Salad,
  "Ungesund gegessen": Pizza,
  "Viel Zucker": Candy,
  "Wenig Zucker": Cookie,
  "Kein Zucker": ShieldCheck,
  Koffein: Coffee,
  "Viel Wasser getrunken": Droplets,
  "Wenig Wasser getrunken": Droplet,
  Alkohol: Wine,

  // Schlaf
  "Gut geschlafen": BedDouble,
  "Schlecht geschlafen": Bed,
  "Schlaf < 6h": Bed,
  "Schlaf 6-8h": BedDouble,
  "Früh im Bett": Moon,
  "Spät im Bett": MoonStar,
  "Handy vorm Schlafen": Smartphone,
  "Ausgeschlafen aufgewacht": Sunrise,
  Mittagsschlaf: Bed,

  // Sozial
  "Freunde getroffen": Users,
  "Familie getroffen": Home,
  "Partner/in getroffen": HeartHandshake,
  "Viel allein": User,
  "Neue Menschen kennengelernt": UserPlus,
  Telefoniert: PhoneCall,
  "Soziale Kontakte": Users,

  // Wetter
  Sonnig: Sun,
  Bewölkt: Cloud,
  Regnerisch: CloudRain,
  Windig: Wind,
  Stürmisch: Tornado,
  Schnee: CloudSnow,
  Nebel: CloudFog,

  // Entspannung
  Meditation: Flower2,
  "Zeit in der Natur": TreePine,
  Lesen: Book,
  "Musik gehört": Music,
  "Kreativ gewesen": Palette,

  // Alltag
  "Arbeit/Studium": Briefcase,
  "Bildschirmzeit hoch": Smartphone,
  "Gelernt/Weitergebildet": GraduationCap,
  "Haustier gekümmert": Dog,
  Gespielt: Gamepad2,
};

const CATEGORY_FALLBACK_ICONS: Record<string, LucideIcon> = {
  Bewegung: Dumbbell,
  Ernährung: Salad,
  Schlaf: Bed,
  Sozial: Users,
  Wetter: Cloud,
  Entspannung: Flower2,
  Alltag: Briefcase,
  Konsum: Wine,
};

export function getActivityIcon(name: string, category: string): LucideIcon {
  return NAME_ICONS[name] ?? CATEGORY_FALLBACK_ICONS[category] ?? Dumbbell;
}

export const WEATHER_ACTIVITY_NAMES = ["Sonnig", "Bewölkt", "Regnerisch", "Windig", "Stürmisch", "Schnee", "Nebel"];
