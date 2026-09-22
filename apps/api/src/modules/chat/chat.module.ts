import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ImportantDatesModule } from "../important-dates/important-dates.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { TtsService } from "./tts.service";

@Module({
  imports: [UsersModule, ImportantDatesModule],
  controllers: [ChatController],
  providers: [ChatService, TtsService],
})
export class ChatModule {}
