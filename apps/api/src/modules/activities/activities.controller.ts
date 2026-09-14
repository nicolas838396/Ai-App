import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/guards/supabase-auth.guard";
import { UsersService } from "../users/users.service";
import { ActivitiesService } from "./activities.service";
import { CreateActivityLogDto } from "./dto/create-activity-log.dto";

@Controller("activities")
@UseGuards(SupabaseAuthGuard)
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  findAllActivities() {
    return this.activitiesService.findAllActivities();
  }

  @Post("log")
  async logActivity(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateActivityLogDto) {
    await this.usersService.ensureUser(user);
    return this.activitiesService.logActivity(user.id, dto);
  }

  @Get("log")
  findLogs(@CurrentUser() user: AuthenticatedUser) {
    return this.activitiesService.findLogsForUser(user.id);
  }

  @Get("correlation")
  correlation(@CurrentUser() user: AuthenticatedUser) {
    return this.activitiesService.correlationSummary(user.id);
  }
}
