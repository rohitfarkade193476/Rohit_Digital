---
description: Set up Husky pre-commit quality gates at the repo root — Prettier, ESLint + lint-staged for JS/TS packages, and a build step (frontend and TypeScript) so errors are caught before the commit lands.
argument-hint: (optional) a package to focus on, e.g. "frontend", "backend", or a folder path
---

You are running the `/setup-precommit` command. Your job is to install and wire up a
**working pre-commit quality gate at the root of this repository**, driven by
[Husky](https://typicode.github.io/husky/), so that broken formatting, lint errors and
build/type errors are caught **before** a commit is created.

This command must work in **any** repository layout — a single app at the root, a
`frontend/` + `backend/` split, or a polyglot repo where only some packages are Node.
**Never assume a language, framework or package manager — discover everything from the
actual code first.**

The user's optional focus argument is: `$ARGUMENTS`

---

## What "done" looks like

When you finish, all of the following must be true:

1. A **root `package.json`** exists (created if missing) and holds Husky, Prettier and
   lint-staged as `devDependencies`. Husky always lives at the **repo root** — never inside
   `frontend/` or `backend/` — because git hooks are per-repository.
2. `.husky/pre-commit` exists, is committed, and runs: **lint-staged → build/typecheck**.
3. **Prettier** is installed with a `.prettierrc` (or `prettier.config.*`) and a
   `.prettierignore` that match the real code style already in the repo.
4. For **every** JavaScript/TypeScript package — frontend **and** backend, if both are Node —
   **ESLint** is present (reuse the existing config if there is one, create one if not) and is
   run by lint-staged on staged files only. No Node package is left unlinted.
5. `lint-staged` is configured **in the root `package.json`** (under a `"lint-staged"` key).
6. The root **`.gitignore`** ignores `node_modules/` (including the root `node_modules/`
   that appears once Husky is installed) plus build output and env files.
7. Every **frontend** package runs its **build** before the commit.
8. Every **TypeScript** package runs a **type check / build** before the commit, so type
   errors surface at commit time rather than in CI.
9. You have **actually verified** the hook runs — do not report success on an unproven hook.

Follow the phases in order. Do not skip Phase 1.

---

## Phase 1 — Discover the repository

Before installing anything, build an accurate picture. Do not guess.

- List the repo root and one or two levels down. Identify every **deployable app / package**.
- For each package, find its manifest: `package.json`, `pom.xml`, `build.gradle`,
  `requirements.txt` / `pyproject.toml`, `go.mod`, `*.csproj`, `composer.json`, `Gemfile`.
- For each Node package, read `package.json` and record:
  - **JS or TS?** (presence of `tsconfig.json`, `.ts`/`.tsx` sources, `typescript` dep)
  - **frontend or backend?** (Vite/Next/CRA/Angular/Vue vs Express/Nest/Fastify)
  - existing `scripts` — especially `build`, `lint`, `typecheck`
  - existing ESLint config (`eslint.config.*` flat config vs legacy `.eslintrc*`) and its
    ESLint major version
  - `"type": "module"` or CommonJS — this decides the extension of any config file you write
- Detect the **package manager**: `package-lock.json` → npm, `pnpm-lock.yaml` → pnpm,
  `yarn.lock` → yarn, `bun.lockb` → bun. Use that manager for every install command you run.
  If there is no lockfile anywhere, use npm.
- Check whether the root is a **workspaces monorepo** (`workspaces` in root `package.json`,
  `pnpm-workspace.yaml`, `turbo.json`, `nx.json`). If it is, add the tooling to the workspace
  root and let lint-staged call into each workspace — do not create a competing root package.
- Read the existing code to infer the **prevailing style**: semicolons or not, single vs
  double quotes, indent width, trailing commas. Your Prettier config must **match what is
  already there**, so this setup does not produce a repo-wide reformat diff.
- Note any **non-Node packages** (Java/Maven, Python, Go, …). They get formatting and a build
  step too — see Phase 6 — but no ESLint.

State a short summary of what you found before you start changing files.

---

## Phase 2 — Root package.json + Husky

1. **Root `package.json`.** If it does not exist, create a minimal private one — it exists
   only to host dev tooling, so it must not look like a publishable app:

   ```json
   {
     "name": "<repo-name>-root",
     "version": "1.0.0",
     "private": true,
     "scripts": {
       "prepare": "husky"
     }
   }
   ```

   If a root `package.json` already exists, **edit it** — never overwrite it. Merge in the
   `prepare` script and the devDependencies, keeping everything else intact.

2. **Install Husky at the root:**

   ```bash
   npm install --save-dev husky
   npx husky init
   ```

   `husky init` creates `.husky/pre-commit` and adds the `prepare` script. If it writes a
   placeholder hook (`npm test`), you will replace its contents in Phase 5.

   > Husky v9+ has no `husky install` — the `prepare` script is just `husky`. Do not write
   > the deprecated v4/v8 syntax (`npx husky add`, the `husky-4` `hooks` key in
   > `package.json`, or the `#!/usr/bin/env sh` + `. "$(dirname -- "$0")/_/husky.sh"` preamble,
   > which v9 warns about).

3. Confirm `.husky/_/` was generated and `core.hooksPath` now points at `.husky`
   (`git config core.hooksPath`). If the repo is **not** a git repository, stop and tell the
   user — Husky cannot install hooks without one — and offer to run `git init`.

---

## Phase 3 — Prettier

1. Install at the root: `npm install --save-dev prettier`.
2. Write a **`.prettierrc`** whose options mirror the style you observed in Phase 1. Do not
   impose a style the repo does not already use. A typical starting point:

   ```json
   {
     "semi": true,
     "singleQuote": true,
     "trailingComma": "es5",
     "printWidth": 100,
     "tabWidth": 2,
     "endOfLine": "lf"
   }
   ```

   `"endOfLine": "lf"` matters on Windows checkouts — without it Prettier and git fight over
   CRLF on every commit.

3. Add any **plugin the stack needs**, and register it under `"plugins"`:
   - Tailwind in use → `prettier-plugin-tailwindcss` (class sorting)
   - `.java` sources you want formatted → `prettier-plugin-java`
   - Prettier does **not** handle `.vue`/`.svelte`/`.astro` without their plugins — add them
     only if those files exist.

4. Write a **`.prettierignore`**, at minimum:

   ```
   node_modules
   dist
   build
   coverage
   .next
   out
   target
   *.min.js
   package-lock.json
   pnpm-lock.yaml
   yarn.lock
   ```

5. If the repo has an **ESLint config that includes stylistic rules**, install
   `eslint-config-prettier` and make it the **last** entry in each package's ESLint config, so
   ESLint stops fighting Prettier over formatting.

6. Add root scripts:

   ```json
   "format": "prettier --write .",
   "format:check": "prettier --check ."
   ```

   Do **not** run `prettier --write .` across the whole repo as part of this command unless
   the user asks — that creates a huge unrelated diff. Formatting is applied incrementally by
   lint-staged, on staged files only.

---

## Phase 4 — ESLint + lint-staged

**ESLint applies to every JavaScript/TypeScript package — no exceptions.** If this repo has a
Node frontend **and** a Node backend, **both** get ESLint installed and both get their own
lint-staged entry. Do not lint the frontend and leave the backend unlinted just because it is
"only an API" — a backend without a lint config is the common gap, and closing it is part of
this command. Skip ESLint only for genuinely non-Node packages (Java, Python, Go, PHP…).

A package counts as "already has ESLint" only if a config file actually exists
(`eslint.config.*` or `.eslintrc*`). A `"lint": "eslint ."` script with **no config file** is a
broken script, not an existing setup — create the config.

1. For each JS/TS package:
   - If it **already has** an ESLint config, keep it. Do not replace a working config.
   - If it does **not**, install ESLint in that package and create a flat config
     (`eslint.config.js`, or `.mjs` when the package is CommonJS) appropriate to the package:
     - **Node/backend:** `@eslint/js` recommended + `globals.node`, `sourceType` matching
       `"type": "module"`.
     - **React frontend:** `@eslint/js` + `eslint-plugin-react-hooks` +
       `eslint-plugin-react-refresh` + `globals.browser`.
     - **TypeScript:** add `typescript-eslint` and its recommended config.
   - Ensure the package has a `lint` script (`eslint .`).
   - Add a `lint:fix` script: `eslint --fix`. lint-staged will call it with explicit file
     paths, so the script must **not** hardcode a path of its own.

2. **Install lint-staged at the root:** `npm install --save-dev lint-staged`.

3. **Configure lint-staged in the root `package.json`** under a `"lint-staged"` key (this is
   the required location). Two rules make it correct in a multi-package repo:

   - **Prettier can run from the root** for everything, since its config resolution is
     per-file.
   - **ESLint flat config resolves relative to the working directory**, not the linted file.
     So a root-level `eslint` invocation will *not* pick up `frontend/eslint.config.js`.
     Invoke it through the package instead — `npm --prefix <pkg> run <script>` runs with the
     working directory set to that package, and lint-staged appends absolute file paths,
     which ESLint accepts.

   Shape it like this, with one glob block per package that actually exists:

   ```json
   "lint-staged": {
     "frontend/**/*.{js,jsx,ts,tsx}": [
       "prettier --write",
       "npm --prefix frontend run lint:fix --"
     ],
     "backend/**/*.{js,ts}": [
       "prettier --write",
       "npm --prefix backend run lint:fix --"
     ],
     "*.{json,md,yml,yaml,css,html}": [
       "prettier --write"
     ]
   }
   ```

   For a **single-package repo at the root**, collapse this to plain
   `"*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"]`.

   Notes that avoid real breakage:
   - Do **not** add `git add` to the command list — lint-staged v10+ re-stages automatically,
     and an explicit `git add` breaks its partial-staging support.
   - If ESLint 9+ errors on files that its config ignores, append `--no-warn-ignored`.
   - Keep globs anchored to the package folder so a staged root file never triggers a
     package's linter.

---

## Phase 5 — The pre-commit hook

Write `.husky/pre-commit`. Husky v9 hooks are plain shell scripts with **no** shebang preamble
and **no** `husky.sh` sourcing:

```sh
npx lint-staged
```

…followed by the build/typecheck steps from Phase 6. Requirements:

- The script must **exit non-zero** when any step fails — that is what blocks the commit.
  Plain sequential commands in `sh` do **not** stop on failure unless you add `set -e` (or
  chain with `&&`). Add `set -e` at the top.
- Keep it **fast**. A pre-commit that takes minutes gets bypassed with `--no-verify`. Prefer
  `tsc --noEmit` over a full bundle when a package is TS-but-not-frontend.
- Only run a package's build **when files in that package were actually staged**, so a README
  edit does not trigger a full frontend build. Gate each step:

  ```sh
  if git diff --cached --name-only --diff-filter=ACMR | grep -q '^frontend/'; then
    echo "→ building frontend"
    npm --prefix frontend run build
  fi
  ```

- Make the file executable: `git update-index --chmod=+x .husky/pre-commit` (on Windows the
  filesystem bit is not tracked, so set it through git).
- Echo a short line before each step so a developer can see which stage failed.

---

## Phase 6 — Build / typecheck gates

Add one gate per package, guarded by the staged-path check above:

- **Frontend package** → run its real build (`npm --prefix frontend run build`). This is the
  step the user explicitly wants: a frontend that fails to build must not be committable.
- **TypeScript package (any kind)** → run a type check. Prefer a `typecheck` script
  (`tsc --noEmit`, or `tsc -b --noEmit` for project references); add the script if it is
  missing. If the package is TS **and** a frontend, the build usually covers types — but Vite
  does not typecheck by default, so keep `tsc --noEmit` unless the `build` script already
  chains `tsc`.
- **Plain JS backend** → no build step; lint + Prettier is the gate.
- **Java / Maven package** → compile before commit:
  `mvn -f <path>/pom.xml -q -DskipTests compile` (Gradle: `./gradlew :<mod>:compileJava`).
  Use `compile`, not `package` — it is much faster and still surfaces compile errors. If the
  Maven wrapper (`mvnw`) exists, prefer it.
- **Python package** → if the project already uses `ruff`/`mypy`, run it; otherwise leave it
  to Prettier-ignored territory and say so.

If a build is genuinely slow (> ~30s), say so explicitly in your summary and offer the
alternative of moving it to a `pre-push` hook instead.

---

## Phase 7 — .gitignore

Update the **root `.gitignore`** (create it if absent). Preserve existing entries; append only
what is missing, under a short comment. It must cover at least:

```gitignore
# dependencies
node_modules/
.pnpm-store/

# build output
dist/
build/
out/
.next/
coverage/

# env
.env
.env.*
!.env.example

# logs
*.log
npm-debug.log*

# editor / OS
.DS_Store
.idea/
.vscode/
```

Explicitly confirm that the **root `node_modules/`** created by the Husky install is ignored —
a bare `node_modules/` line covers it at every level. If a package folder has its own
`.gitignore`, leave it alone. If `node_modules` was already tracked by git before this run,
tell the user and offer `git rm -r --cached node_modules`.

Add non-Node build output when relevant (`target/` for Maven, `__pycache__/`, `*.class`).

---

## Phase 8 — Verify (do not skip)

Prove the setup works before reporting back:

1. `git config core.hooksPath` → should print `.husky`.
2. Run `npx lint-staged --help` (or a dry run) to confirm the binary resolves.
3. Run each build/typecheck command **manually once** and confirm it exits 0. If a build is
   already broken in the repo, **say so plainly** — do not weaken the hook to make it pass.
4. Exercise the hook end to end: stage a trivial whitespace change in a real source file and
   run `npx lint-staged` (and, if cheap, the hook script itself via `sh .husky/pre-commit`).
   Do **not** create a commit unless the user asked you to.
5. Confirm `git status` shows no `node_modules` and no unintended reformat of unrelated files.

---

## Reporting back

Finish with a short summary containing:

- Which packages were detected, and the stack of each.
- Every file created or modified.
- The exact sequence the hook now runs, in order.
- Anything you **could not** do and why (e.g. a package whose build already fails, a slow
  build you left out, a non-Node package with no available formatter).
- The escape hatch, stated once: `git commit --no-verify` bypasses the hook, and
  `npm run format` formats the whole repo when the team is ready for that diff.

## Guardrails

- **Never** commit or push on your own initiative; this command changes files only.
- **Never** overwrite an existing ESLint, Prettier or TypeScript config without saying so —
  if a config exists and is wrong for the setup, explain the conflict and adjust minimally.
- **Never** mass-reformat the repository as a side effect.
- **Never** downgrade or change the major version of an existing tool to make configs line up;
  adapt the config to the installed version instead.
- If `$ARGUMENTS` names a package, still install Husky at the **root** (hooks are
  repo-global), but scope the lint/build gates to that package.

---

## Known layout of this repository (verify, don't trust blindly)

At the time this command was written, `digital-complaint-system-for-housing-societies`
contained:

| Path        | Stack                                                          | Gates |
| ----------- | -------------------------------------------------------------- | ----- |
| `backend/`  | **Node ESM + Express 5 + Prisma**, plain JS, `"type":"module"`   | Prettier + ESLint |
| `frontend/` | empty placeholder (`.gitkeep` only)                              | ignore for now |

Specifics that matter here:

- This is **JavaScript, not TypeScript** — no `tsconfig.json`, so there is no `tsc --noEmit`
  gate to add today. If the frontend or backend moves to TS later, re-run this command and
  Phase 6 will add the typecheck gate.
- `backend/` has **no ESLint config and no `lint` script** — install ESLint 9 in `backend/`
  and create a flat config using `globals.node` with `sourceType: "module"` (Express 5, ESM).
  Add `lint` and `lint:fix` scripts.
- `backend/prisma/` generated client output and `prisma/migrations` should be Prettier-ignored;
  do not reformat generated files.
- `frontend/` is **empty**. Do not scaffold anything into it and do not add a frontend build
  gate that would fail on an empty folder. Instead, write the lint-staged glob and the hook's
  frontend block so they simply never match today — or leave frontend out entirely and note in
  your summary that it must be added once the frontend exists.
- **There is no root `.gitignore` at all** — create one per Phase 7. It must ignore
  `node_modules/` (the root one Husky creates, plus `backend/node_modules/`), `dist/`,
  `.env`, `*.log`, `.idea/`, `.DS_Store`.
- `backend/package-lock.json` → package manager is **npm**.
- `backend/` is currently the **only Node package**, and it must be linted even though it is
  "just an API". Once the Node frontend lands in `frontend/`, re-run this command so **both**
  packages get ESLint, their own lint-staged globs, and the frontend build gate.
