FROM node:20-alpine AS base
RUN corepack enable && corepack prepare npm@latest --activate
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY backend/api/package.json backend/api/
RUN npm ci

FROM base AS build
COPY . .
RUN npm run build --workspace=@vel-ai/shared
RUN npm run build --workspace=@vel-ai/api

FROM node:20-alpine AS production
RUN corepack enable && corepack prepare npm@latest --activate
WORKDIR /app
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/api/dist ./backend/api/dist
COPY --from=build /app/backend/api/package.json ./backend/api/
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "backend/api/dist/main.js"]