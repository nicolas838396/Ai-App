import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/guards/supabase-auth.guard";
import { UsersService } from "../users/users.service";
import { ImportantDatesService } from "./important-dates.service";
import { CreateImportantDateDto } from "./dto/create-important-date.dto";
import { UpdateImportantDateDto } from "./dto/update-important-date.dto";

@Controller("important-dates")
@UseGuards(SupabaseAuthGuard)
export class ImportantDatesController {
  constructor(
    private readonly importantDatesService: ImportantDatesService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateImportantDateDto) {
    await this.usersService.ensureUser(user);
    return this.importantDatesService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.importantDatesService.findAllForUser(user.id);
  }

  @Patch(":id")
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateImportantDateDto,
  ) {
    return this.importantDatesService.update(user.id, id, dto);
  }

  @Delete(":id")
  async remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    await this.importantDatesService.remove(user.id, id);
    return { success: true };
  }
}
