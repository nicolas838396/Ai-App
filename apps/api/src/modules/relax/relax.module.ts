import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { RelaxController } from "./relax.controller";
import { RelaxService } from "./relax.service";

@Module({
  imports: [UsersModule],
  controllers: [RelaxController],
  providers: [RelaxService],
})
export class RelaxModule {}
