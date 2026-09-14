import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateActivityLogDto {
  @IsString()
  activityId!: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationMin?: number;
}
