import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/guards/supabase-auth.guard";
import { UsersService } from "../users/users.service";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dto/send-message.dto";

@Controller("chat")
@UseGuards(SupabaseAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
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
}
