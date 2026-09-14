import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { JournalController } from "./journal.controller";
import { JournalService } from "./journal.service";

@Module({
  imports: [UsersModule],
  controllers: [JournalController],
  providers: [JournalService],
})
export class JournalModule {}
