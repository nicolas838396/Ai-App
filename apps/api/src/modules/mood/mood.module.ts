import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { MoodController } from "./mood.controller";
import { MoodService } from "./mood.service";

@Module({
  imports: [UsersModule],
  controllers: [MoodController],
  providers: [MoodService],
})
export class MoodModule {}
