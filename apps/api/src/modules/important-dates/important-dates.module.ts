import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ImportantDatesController } from "./important-dates.controller";
import { ImportantDatesService } from "./important-dates.service";

@Module({
  imports: [UsersModule],
  controllers: [ImportantDatesController],
  providers: [ImportantDatesService],
  exports: [ImportantDatesService],
})
export class ImportantDatesModule {}
