import { IsIn, IsInt, IsString, MaxLength, MinLength } from "class-validator";

export const STORY_LENGTH_OPTIONS = [5, 10, 15, 20, 25, 30] as const;

export class GenerateBedtimeStoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title!: string;

  @IsInt()
  @IsIn(STORY_LENGTH_OPTIONS)
  lengthMinutes!: number;

  @IsIn(["de", "en"])
  language!: "de" | "en";
}
