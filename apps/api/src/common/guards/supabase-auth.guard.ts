import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import type { Request } from "express";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  /** From the signup form's options.data — only present for a brand-new user. */
  firstName?: string;
  birthDate?: string;
}

// Newer Supabase projects sign access tokens with an asymmetric key
// (ECC/RSA) instead of a shared HS256 secret. We verify against the
// project's public JWKS endpoint, so the API never needs a shared secret
// and never has to call out to Supabase per request (jose caches the keys).
let cachedJwks: JWTVerifyGetKey | null = null;

function getJwks(supabaseUrl: string): JWTVerifyGetKey {
  if (!cachedJwks) {
    cachedJwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
  }
  return cachedJwks;
}

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
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    if (!supabaseUrl) {
      throw new UnauthorizedException("Auth is not configured");
    }

    try {
      const { payload } = await jwtVerify(token, getJwks(supabaseUrl));
      const metadata =
        payload.user_metadata && typeof payload.user_metadata === "object"
          ? (payload.user_metadata as Record<string, unknown>)
          : {};
      const user: AuthenticatedUser = {
        id: String(payload.sub),
        email: typeof payload.email === "string" ? payload.email : undefined,
        firstName: typeof metadata.firstName === "string" ? metadata.firstName : undefined,
        birthDate: typeof metadata.birthDate === "string" ? metadata.birthDate : undefined,
      };
      (request as Request & { user: AuthenticatedUser }).user = user;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
