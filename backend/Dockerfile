# syntax=docker/dockerfile:1

# Build context is the backend/ folder (Easypanel build path: /backend).
# All COPY paths below are relative to backend/.

FROM node:22.14-slim AS deps
WORKDIR /app

# Prisma needs libssl/openssl present to pick its query engine at generate time.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# Generate the Prisma client into node_modules so the runner needs no network.
COPY prisma ./prisma
RUN npx prisma generate


FROM node:22.14-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# The Prisma CLI (a devDependency) stays in the image: `prisma migrate deploy`
# runs at container start, when the database is actually reachable.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY src ./src
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Excel imports are staged on disk by multer; /app is root-owned, so the upload
# directory must exist and belong to the runtime user.
RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "src/server.js"]
