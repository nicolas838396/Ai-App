import { IsOptional, IsString, MaxLength } from "class-validator";

export class SendMessageDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  content?: string;

  // A data URL (data:image/jpeg;base64,...). Decoded size and daily count
  // are enforced in the service, not here, so the error messages can be
  // specific.
  @IsOptional()
  @IsString()
  @MaxLength(8_000_000)
  imageDataUrl?: string;
}
