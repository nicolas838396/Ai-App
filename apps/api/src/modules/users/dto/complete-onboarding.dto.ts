import {
  ArrayMaxSize,
  ArrayMinSize,
  Equals,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export const GOAL_OPTIONS = [
  "stress_reduzieren",
  "stimmung_verbessern",
  "gewohnheiten_aufbauen",
  "selbstverstaendnis",
  "schlaf_verbessern",
  "beziehungen",
  "sonstiges",
] as const;

export const CONCERN_OPTIONS = [
  "angst",
  "niedergeschlagenheit",
  "stress_ueberforderung",
  "schlafprobleme",
  "konzentration",
  "einsamkeit",
  "selbstwert",
  "keine",
  "sonstiges",
] as const;

export const STRESS_AREA_OPTIONS = [
  "arbeit",
  "beziehung",
  "familie",
  "gesundheit",
  "finanzen",
  "sonstiges",
] as const;

export const USAGE_FREQUENCY_OPTIONS = ["taeglich", "mehrmals_woechentlich", "bei_bedarf"] as const;

export const PRONOUN_OPTIONS = ["sie_ihr", "er_ihm", "divers", "keine_angabe"] as const;

export class CompleteOnboardingDto {
  @IsString()
  @MaxLength(60)
  firstName!: string;

  @IsDateString()
  birthDate!: string;

  @IsOptional()
  @IsIn(PRONOUN_OPTIONS)
  pronoun?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(GOAL_OPTIONS.length)
  @IsIn(GOAL_OPTIONS, { each: true })
  goals!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(CONCERN_OPTIONS.length)
  @IsIn(CONCERN_OPTIONS, { each: true })
  concerns!: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(STRESS_AREA_OPTIONS.length)
  @IsIn(STRESS_AREA_OPTIONS, { each: true })
  stressAreas?: string[];

  @IsIn(USAGE_FREQUENCY_OPTIONS)
  usageFrequency!: string;

  @IsBoolean()
  @Equals(true, { message: "Zustimmung zur Verarbeitung gesundheitsbezogener Daten ist erforderlich" })
  healthDataConsent!: boolean;
}
