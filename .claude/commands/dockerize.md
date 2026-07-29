---
description: Understand any project, then create or update a minimal production Dockerfile per deployable app, laid out for Easypanel build paths (`/frontend`, `/backend`, or `/`) — no docker-compose.
argument-hint: (optional) a target to focus on, e.g. "frontend", "backend", or a folder path
---

You are running the `/dockerize` command. Your job is to give each deployable app a
**minimal, production-ready `Dockerfile`** suited for deployment on **Easypanel** (or any
Dockerfile-based PaaS such as Railway, Render, Fly.io, Coolify, or a plain `docker run`).
Frontend and backend are deployed **separately** — each app gets its **own** Dockerfile and
nothing more.

This command is meant to be dropped into **any** repository and work unchanged. **Never
assume a language, framework, package manager, or folder layout — discover everything from
the actual code.** It should work equally for Node/Next.js, Python/Django/FastAPI, Go, Rust,
Java/Spring, PHP/Laravel, Ruby/Rails, static sites, and anything else.

The user's optional focus argument is: `$ARGUMENTS`

---

## Deployment target: Easypanel build paths

Each app is created as its **own Easypanel service**, pointed at the **same** git repository
but with a different **Build path**. The build path is the Docker **build context** — Easypanel
runs the build *as if* that folder were the repository root.

| Repo layout                  | Easypanel service | Build path  | Dockerfile lives at |
| ---------------------------- | ----------------- | ----------- | ------------------- |
| `frontend/` + `backend/`     | frontend          | `/frontend` | `frontend/Dockerfile` |
| `frontend/` + `backend/`     | backend           | `/backend`  | `backend/Dockerfile`  |
| single app at the repo root  | app               | `/`         | `Dockerfile`          |

**This constrains the Dockerfiles you write — these rules are not optional:**

1. **The Dockerfile sits at the root of its build path**, named exactly `Dockerfile`
   (`frontend/Dockerfile`, `backend/Dockerfile`, or `./Dockerfile`). Do not nest it deeper and
   do not use a suffixed name like `Dockerfile.prod` — Easypanel looks for `Dockerfile` inside
   the build path by default.
2. **Every `COPY` / `ADD` path is relative to that folder and must stay inside it.** Writing
   `COPY ../shared ./shared` or `COPY package.json ./` (meaning the repo-root one) **will fail**
   — those paths are outside the build context and Docker cannot see them. Inside
   `backend/Dockerfile`, `COPY package*.json ./` refers to `backend/package.json`.
3. **`.dockerignore` goes inside the build path too** — `frontend/.dockerignore`,
   `backend/.dockerignore`. A `.dockerignore` at the repo root is **ignored** when the build
   path is `/frontend`; it only applies to a root build path.
4. **If an app genuinely depends on shared code outside its folder** (a root `packages/`
   workspace, a shared lockfile, a repo-root `tsconfig.base.json`), the split build path
   cannot work as-is. Pick one and say which you chose and why:
   - vendor/duplicate the shared bits into the app folder, or
   - build that app from build path `/` with a repo-root Dockerfile per app (e.g. root
     `Dockerfile.backend`), and tell the user the exact build path + Dockerfile path to set in
     Easypanel for that service.
   Do not silently emit a Dockerfile that reaches outside its context — it will fail at build.

Follow the phases **in order**. Do not skip Phase 1. Do not build before Phase 3.

---

## Scope rules (important)

- Produce **one `Dockerfile` per deployable app**, plus a matching `.dockerignore`, both at the
  root of that app's build path. Nothing else.
- **Do NOT create `docker-compose.yml`.** If one already exists, **remove it** (and any
  `docker-compose.*.yml` / `compose.yaml` variants) — Easypanel replaces it: each app is a
  separate service and databases are their own managed services.
- **Do NOT create** `.env.docker.example` or other scaffolding. The platform injects env vars
  and handles ports, domains, TLS, networking, and databases.
- Keep each Dockerfile simple and readable — no orchestration concerns baked in.

---

## Phase 1 — Understand the project (read-only)

1. **Detect deployable apps and their build paths.** Decide whether this is a **single app**
   or a **frontend + backend split**. Signals:
   - Split: separate `frontend/`+`backend/` (or `client/`+`server/`, `web/`+`api/`, an
     `apps/*` monorepo) each with its own package manifest / build → **one Dockerfile each**,
     at build paths `/frontend` and `/backend` (or the equivalent folder names — record the
     real ones, they become the Easypanel build paths you report in Phase 5).
   - Single: one manifest at the root → **one Dockerfile at the root**, build path `/`. Don't
     invent a split.
2. **Per app, detect the stack:** language + version, framework, package manager and lockfile
   (npm/pnpm/yarn/bun, pip/poetry/uv, go mod, cargo, composer, maven/gradle, bundler…), the
   build command, the start/serve command, and the port it listens on.
3. **Check the context boundary.** For each app, confirm everything it needs to build lives
   **inside its own folder** — its manifest, its lockfile, its tsconfig, its source. Note any
   dependency on files above it (root lockfile in a pnpm/yarn workspace, shared `packages/`,
   root config extended by `tsconfig.json`); that triggers rule 4 above.
4. **Find runtime needs:** database/ORM (migrations that must run on deploy?), a build step
   emitting static assets, native deps or engines (e.g. Prisma query engine, sharp, Pillow),
   and the port to expose.
5. **Check what already exists:** `Dockerfile*`, `.dockerignore`, and any **compose files**
   (`docker-compose*.yml`, `compose.y*ml`). You will update the Dockerfiles and **delete the
   compose files**.

Keep it fast — read only, modify nothing yet.

## Phase 2 — Decide the plan

For **each** deployable app, decide:

- Its **build path** (`/frontend`, `/backend`, `/`, or the real folder name) and confirm the
  Dockerfile will live at the root of it.
- Base image and tag — pinned, slim/alpine where safe, matching the detected language version
  (never `latest`).
- **Multi-stage build**: a `deps`/`build` stage and a lean `runner` stage; copy only what the
  runtime needs into the final image.
- Reproducible install from the lockfile (`npm ci`, `pnpm i --frozen-lockfile`,
  `yarn --immutable`, `pip install -r` / `poetry install --no-root`, `go mod download`,
  `cargo build --release`, `composer install --no-dev`, etc.) — using the lockfile **inside the
  build path**. If the only lockfile is at the repo root, apply rule 4.
- Build command and its output (`.next`, `dist`, `build`, a compiled binary, static bundle).
  For **Next.js**, prefer `output: "standalone"` — set it in `next.config.*` if missing and
  copy `.next/standalone` + `.next/static` + `public`. Apply the equivalent lean-output idiom
  for whatever framework you detect.
- Runtime `CMD`, the exposed `PORT` (Easypanel maps this — set it in the service's port
  mapping), and a non-root `USER`.
- **Migrations / one-time steps:** run them at container **start** (an entrypoint or the app's
  existing release/prestart script) — never at build time; the DB isn't reachable during build.

State the plan back briefly — including each app's build path — then continue. This command is
expected to build, so don't stop unless a decision is genuinely the user's (see Phase 4).

## Phase 3 — Create / update / remove files

Per deployable app, write into that app's **build path directory** (`frontend/`, `backend/`,
or the repo root for a single app):

1. **`Dockerfile`** — multi-stage, pinned base, lockfile-based install, non-root runtime,
   `EXPOSE` the real port, correct `CMD`. **All paths relative to the build path, none escaping
   it.** If one exists, **update it in place** to correct, current commands rather than
   replacing wholesale — preserve identifiable customizations.
2. **`.dockerignore`** — in the **same folder** as the Dockerfile. Exclude `node_modules`,
   `.git`, `.env*`, build caches, local artifacts, test output, `*.log`, editor/OS junk. Keep
   the build context small.
3. **`entrypoint.sh`** — only if there are start-time steps (DB migrations/seeds), and inside
   the build path so the `COPY` can reach it. Run the steps, then `exec` the app so signals
   propagate. Skip it entirely if there are none.
4. **Remove compose files** — delete any `docker-compose*.yml` / `compose.y*ml` found in
   Phase 1. Tell the user which files you removed and why (Easypanel handles orchestration).

**Rules:**

- Match the project's real commands, ports, and versions — no guessed defaults.
- Secrets come from platform env at runtime, never baked into an image layer.
- Cache-friendly layers: copy manifests + install before copying source.
- If a Dockerfile already exists, edit it to be correct rather than creating a second copy.
- If an existing Dockerfile was written for a **repo-root** context (e.g. `COPY backend/ .`),
  rewrite its paths for the new build path — this is the most common breakage when moving to
  per-app build paths.

## Phase 4 — Pause only for genuine decisions

Decide everything you can from the code. Ask the user only when the answer is truly theirs —
e.g. the exposed app port if it's ambiguous, whether a start-time migration step should run on
this app, or which option to take under rule 4 when shared code makes a split build path
impossible. Otherwise proceed.

## Phase 5 — Verify and report

- Sanity-check each Dockerfile: base tag resolves, build command matches the manifest, copied
  paths exist **relative to the build path**, no path escapes the context, `CMD` port matches
  `EXPOSE`.
- If Docker is available, attempt a build **from the build path** per app and report results:
  `docker build -t <app> ./frontend` / `docker build -t <app> ./backend` / `docker build -t <app> .`
  (the trailing path is the build context — the same thing Easypanel's build path sets).
  If Docker is not available, say so and give the exact commands the user should run.
- Confirm any compose files were removed.
- **Finish with an Easypanel setup table**, one row per service:

  | Service | Build path | Dockerfile | Port | Required env vars |
  | ------- | ---------- | ---------- | ---- | ----------------- |
  | frontend | `/frontend` | `Dockerfile` | 3000 | `NEXT_PUBLIC_API_URL`, … |
  | backend  | `/backend`  | `Dockerfile` | 8000 | `DATABASE_URL`, … |

  List every env var the user must set in Easypanel before deploying, and note any service that
  needs a managed database or a start-time migration step.
