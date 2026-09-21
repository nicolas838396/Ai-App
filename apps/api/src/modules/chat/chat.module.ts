import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { TtsService } from "./tts.service";

@Module({
  imports: [UsersModule],
  controllers: [ChatController],
  providers: [ChatService, TtsService],
})
export class ChatModule {}
