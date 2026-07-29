# Project guidance for Claude

## Git conventions

- **Never mention Claude, Claude Code, or any AI/assistant attribution anywhere in
  version control** — not in commit messages, commit trailers, branch names, tag
  messages, PR titles, or PR descriptions. Specifically, do **not** add
  "Generated with Claude Code", a `Co-Authored-By: Claude ...` trailer, a robot
  emoji footer, or any equivalent. Commits must read as ordinary human work.
- Write plain, descriptive messages: a short imperative subject line (aim for
  72 characters or less) describing _what_ changed, e.g. `Fix rounding on invoice
totals`. Add a body only when the _why_ is not obvious from the diff.
- One logical change per commit. Stage only the files belonging to that change —
  never `git add -A` over unrelated work in progress.
- Never commit secrets, credentials, tokens, `.env` files, database dumps,
  `node_modules/`, build output, or local editor/OS junk. If a secret was
  committed, stop and tell the user rather than quietly rewriting history.
- Do not commit, push, merge, tag, or create PRs unless explicitly asked.
- Never use `--force`, `--force-with-lease`, `--no-verify`, `--amend` on pushed
  commits, `git reset --hard`, or history rewrites unless explicitly asked.
- If a pre-commit hook or lint gate fails, fix the underlying problem instead of
  bypassing the hook.

## Working agreements

- Do what was asked — no more, no less. Do not silently widen scope, refactor
  surrounding code, or add features that were not requested.
- Prefer editing existing files over creating new ones. Do not create README or
  summary/hand-off documents unless the user asks for them.
- Read before you write. Understand the existing pattern in the file and match
  it rather than importing a different style.
- Make routine judgment calls independently; ask only when two readings of the
  request would produce materially different work, or when the decision is a
  business/product/billing call.
- Report honestly. If something is broken, untested, partially done, or was
  skipped, say so plainly instead of implying success.

## Code style

- Match the conventions already in the repository — naming, file layout,
  formatting, module system (ESM vs CommonJS), and error-handling style.
- Follow the project's configured linter/formatter. Do not reformat files or
  reorder imports beyond the lines your change actually touches.
- Use clear, descriptive names. Avoid single-letter variables outside tight loops.
- Comment _why_, not _what_. Do not narrate obvious code, and do not leave
  commented-out blocks behind.
- Handle errors explicitly — no empty `catch` blocks and no swallowed promise
  rejections. Fail loudly in development, degrade safely in production.
- Do not leave `console.log` / debug prints, `TODO` placeholders, or dead code in
  committed work.

## Security

- Never hardcode secrets, API keys, passwords, or connection strings. Read them
  from environment variables and document any new variable in `.env.example`.
- Validate and sanitise all input on the server. Client-side validation is a
  convenience, never a control.
- Use parameterised queries or the project's ORM — never build SQL by string
  concatenation.
- Enforce authentication and authorisation on every protected route and data
  access path; check ownership/tenancy, not just that the user is logged in.
- Never log secrets, tokens, full payment data, or personal data.
- Keep dependencies current and avoid adding new ones for trivial functionality.

## Verification

- Before declaring work done, run whatever the project provides: type check,
  linter, build, and tests. Report the actual results, including failures.
- Add or update tests alongside behaviour changes when the project has a test
  suite. Never edit tests just to make them pass.
- When a change affects the UI or an API contract, verify it end to end rather
  than assuming it works.

## Data and migrations

- Schema changes go through the project's migration mechanism — never edit a
  database by hand or modify an already-applied migration.
- Prefer additive, backwards-compatible changes. Destructive operations (drop,
  truncate, destructive backfill) require explicit confirmation from the user.
- Never run destructive commands against production data.

## Deployment

- Apps are deployed on **Easypanel** from a Dockerfile — one service per
  deployable app, all pointing at this repository with a different **build path**:
  `/frontend` for the frontend, `/backend` for the backend, `/` for a single-app
  repo. The build path is the Docker build context.
- Each app's `Dockerfile` and `.dockerignore` live at the root of its own build
  path (`frontend/Dockerfile`, `backend/Dockerfile`, or `./Dockerfile`). A
  `COPY` must never reach outside its build path — it will fail at build time.
- Do not add `docker-compose.yml`. Easypanel runs each app as its own service and
  provides databases as separate managed services.
- Secrets and configuration come from Easypanel environment variables at runtime,
  never baked into an image layer. Migrations run at container start, not at
  build time.
- Run `/dockerize` to create or update these Dockerfiles — see
  `.claude/commands/dockerize.md`.

## Slash commands

Project commands live in `.claude/commands/*.md`; each file's name is its command.
When the user runs one, follow that file's workflow in order rather than
improvising, and honour its instruction to pause for user decisions.
