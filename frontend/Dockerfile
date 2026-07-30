# syntax=docker/dockerfile:1

# Build context is the frontend/ folder (Easypanel build path: /frontend).
# All COPY paths below are relative to frontend/.

FROM node:22.14-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* values at build time, so they must be build args, not
# runtime env. Set them as build arguments in Easypanel, not service env vars.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build


# nginx-unprivileged already runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
