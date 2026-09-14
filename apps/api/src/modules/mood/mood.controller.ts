import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/guards/supabase-auth.guard";
import { UsersService } from "../users/users.service";
import { MoodService } from "./mood.service";
import { CreateMoodEntryDto } from "./dto/create-mood-entry.dto";

@Controller("mood")
@UseGuards(SupabaseAuthGuard)
export class MoodController {
  constructor(
    private readonly moodService: MoodService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMoodEntryDto) {
    await this.usersService.ensureUser(user);
    return this.moodService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.moodService.findAllForUser(user.id);
  }
}
