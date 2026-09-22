import { IsBoolean, IsDateString, IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { IMPORTANT_DATE_CATEGORIES, type ImportantDateCategory } from "./create-important-date.dto";

export class UpdateImportantDateDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsIn(IMPORTANT_DATE_CATEGORIES)
  category?: ImportantDateCategory;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  emoji?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsBoolean()
  recurringYearly?: boolean;
}
