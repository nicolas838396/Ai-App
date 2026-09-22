import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/guards/supabase-auth.guard";
import { UsersService } from "../users/users.service";
import { RelaxService } from "./relax.service";
import { StoryIdeasDto } from "./dto/story-ideas.dto";
import { GenerateBedtimeStoryDto } from "./dto/generate-bedtime-story.dto";

@Controller("relax")
@UseGuards(SupabaseAuthGuard)
export class RelaxController {
  constructor(
    private readonly relaxService: RelaxService,
    private readonly usersService: UsersService,
  ) {}

  @Post("bedtime-story-ideas")
  async storyIdeas(@CurrentUser() user: AuthenticatedUser, @Body() dto: StoryIdeasDto) {
    await this.usersService.ensureUser(user);
    return this.relaxService.generateStoryIdeas(dto.language);
  }

  @Post("bedtime-story")
  async bedtimeStory(@CurrentUser() user: AuthenticatedUser, @Body() dto: GenerateBedtimeStoryDto) {
    await this.usersService.ensureUser(user);
    return this.relaxService.generateStory(dto.title, dto.lengthMinutes, dto.language);
  }
}
