FROM node:20-alpine AS base
RUN corepack enable && corepack prepare npm@latest --activate
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY backend/api/package.json backend/api/
RUN npm ci --legacy-peer-deps

FROM base AS build
COPY . .
RUN npm run build --workspace=@vel-ai/shared
RUN npm run build --workspace=@vel-ai/api

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/package.json /app/package-lock.json /app/.npmrc ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/api/dist ./backend/api/dist
COPY --from=build /app/backend/api/package.json ./backend/api/
COPY --from=build /app/packages/shared ./packages/shared
RUN mkdir -p node_modules/@vel-ai && ln -sf /app/packages/shared node_modules/@vel-ai/shared
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "backend/api/dist/main.js"]
