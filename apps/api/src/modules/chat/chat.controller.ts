import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/guards/supabase-auth.guard";
import { UsersService } from "../users/users.service";
import { ChatService } from "./chat.service";
import { TtsService } from "./tts.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { SpeakDto } from "./dto/speak.dto";

@Controller("chat")
@UseGuards(SupabaseAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly ttsService: TtsService,
    private readonly usersService: UsersService,
  ) {}

  @Post("message")
  async sendMessage(@CurrentUser() user: AuthenticatedUser, @Body() dto: SendMessageDto) {
    await this.usersService.ensureUser(user);
    return this.chatService.sendMessage(user.id, dto);
  }

  @Get("conversations")
  findConversations(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.findConversationsForUser(user.id);
  }

  @Post("speech")
  async speak(@CurrentUser() user: AuthenticatedUser, @Body() dto: SpeakDto, @Res() res: Response) {
    await this.usersService.ensureUser(user);
    const audio = await this.ttsService.synthesize(user.id, dto.text, dto.gender);
    res.set({ "Content-Type": "audio/mpeg", "Content-Length": audio.length });
    res.send(audio);
  }
}
