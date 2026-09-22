import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateMoodEntryDto {
  @IsInt()
  @Min(1)
  @Max(10)
  score!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  reasons?: string[];
}
