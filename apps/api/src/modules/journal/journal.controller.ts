import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/guards/supabase-auth.guard";
import { UsersService } from "../users/users.service";
import { JournalService } from "./journal.service";
import { CreateJournalEntryDto } from "./dto/create-journal-entry.dto";

@Controller("journal")
@UseGuards(SupabaseAuthGuard)
export class JournalController {
  constructor(
    private readonly journalService: JournalService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateJournalEntryDto) {
    await this.usersService.ensureUser(user);
    return this.journalService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.journalService.findAllForUser(user.id);
  }
}
