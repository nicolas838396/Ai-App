# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter api...

FROM base AS build
COPY --from=deps /repo /repo
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @mental-health/shared build || true
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/node_modules ./node_modules
WORKDIR /repo/apps/api
EXPOSE 4000
CMD ["node", "dist/main.js"]
