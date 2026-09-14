import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class SendMessageDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  content!: string;
}
