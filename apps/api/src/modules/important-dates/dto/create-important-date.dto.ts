import { IsBoolean, IsDateString, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export const IMPORTANT_DATE_CATEGORIES = ["work", "family", "birthday", "relationship", "other"] as const;
export type ImportantDateCategory = (typeof IMPORTANT_DATE_CATEGORIES)[number];

export class CreateImportantDateDto {
  @IsString()
  @MaxLength(100)
  title!: string;

  @IsIn(IMPORTANT_DATE_CATEGORIES)
  category!: ImportantDateCategory;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  emoji?: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsBoolean()
  recurringYearly?: boolean;
}
