import { IsIn } from "class-validator";

export class StoryIdeasDto {
  @IsIn(["de", "en"])
  language!: "de" | "en";
}
