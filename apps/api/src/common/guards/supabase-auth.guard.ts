import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { jwtVerify } from "jose";
import type { Request } from "express";

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

// Supabase signs access tokens with HS256 using the project's JWT secret.
// Verifying it here means the API never needs to call out to Supabase to
// authenticate a request.
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const token = authHeader.slice("Bearer ".length);
    const secret = this.configService.get<string>("SUPABASE_JWT_SECRET");
    if (!secret) {
      throw new UnauthorizedException("Auth is not configured");
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      const user: AuthenticatedUser = {
        id: String(payload.sub),
        email: typeof payload.email === "string" ? payload.email : undefined,
      };
      (request as Request & { user: AuthenticatedUser }).user = user;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
