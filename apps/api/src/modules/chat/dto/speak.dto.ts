import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

export class SpeakDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  text!: string;

  @IsIn(["male", "female"])
  gender!: "male" | "female";
}
