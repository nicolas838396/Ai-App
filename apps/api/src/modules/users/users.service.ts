import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthenticatedUser } from "../../common/guards/supabase-auth.guard";

// Supabase owns the auth.users table; we lazily mirror a row into our own
// `users` table the first time we see a given user so app tables can hold a
// plain foreign key without querying the auth schema.
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureUser(authUser: AuthenticatedUser) {
    return this.prisma.user.upsert({
      where: { id: authUser.id },
      update: {},
      create: {
        id: authUser.id,
        email: authUser.email ?? `${authUser.id}@unknown.local`,
      },
    });
  }
}
