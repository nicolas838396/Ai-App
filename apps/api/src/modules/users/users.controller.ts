import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/guards/supabase-auth.guard";
import { UsersService } from "./users.service";
import { CompleteOnboardingDto } from "./dto/complete-onboarding.dto";

@Controller("users")
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.ensureUser(user);
  }

  @Patch("me/onboarding")
  async completeOnboarding(@CurrentUser() user: AuthenticatedUser, @Body() dto: CompleteOnboardingDto) {
    await this.usersService.ensureUser(user);
    return this.usersService.completeOnboarding(user.id, dto);
  }
}
