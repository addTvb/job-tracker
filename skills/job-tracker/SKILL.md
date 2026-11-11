---
name: job-tracker
description: >-
  Tracks job applications in a local CSV inside this repo and refreshes an HTML
  dashboard with conversion rates and charts. Use when the user mentions tracker,
  log application, application status, rejection, stats, dashboard, job tracker,
  трекер, запиши отклик, статус отклика, статистика откликов, or when the apply /
  cover-letter skills finish and should log the application automatically.
---

# Job Tracker

Local application tracking: CSV → `data.js` → `dashboard.html`.

**Repo layout**

- Tracker data: `<repo>/tracker/`
- Schema: [schema.md](schema.md)
- CLI: `skills/job-tracker/generate-data.js` (next to this file)

Resolve `<repo>` as the realpath of this skill’s `../..` (works with symlinks into `~/.cursor/skills/`).

Do not use remote databases or Google Docs for storage.

## When to use

- “log application”, “tracker”, “запиши отклик”, “трекер”
- Status updates: rejection, interview, offer, ghosted
- “stats”, “conversion”, “dashboard”, “статистика откликов”
- Auto-hook after `apply` / `cover-letter`

## Workflow

```
Job Tracker:
- [ ] 1. Resolve REPO_ROOT and TRACKER_DIR=<repo>/tracker
- [ ] 2. Run CLI: add | status | list | stats | generate
- [ ] 3. Confirm briefly (id, status, key %)
- [ ] 4. On request — open tracker/dashboard.html
```

### Paths

```bash
REPO="$(cd "$(dirname "$0")/../.." && pwd)"   # when running near this skill
# If skill is symlinked from ~/.cursor/skills/job-tracker:
REPO="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]:-$0}")")/../.." && pwd)"
CLI="$REPO/skills/job-tracker/generate-data.js"
DIR="$REPO/tracker"
```

Prefer: `node "$CLI" …` with `--dir "$DIR"`. The CLI defaults to `<repo>/tracker` when `--dir` is omitted.

### add

New row always uses `status=sent`.

```bash
node "$CLI" add --dir "$DIR" \
  --company "Company" \
  --role "Role" \
  --track frontend \
  --source linkedin \
  --url "https://..." \
  --notes "optional"
```

- `track`: `frontend` | `fullstack`
- `source`: `hh` | `linkedin` | `referral` | `company_site` | `other`
- Infer source from URL when possible (`hh.ru` → `hh`, `linkedin.com` → `linkedin`)
- Do not duplicate the same `url`

### status

```bash
node "$CLI" status --dir "$DIR" --id "2026-03-10-001" --status rejected
```

`--id` may be id, url, or a unique company/role fragment.

Synonyms: rejection→`rejected`, no reply→`ghosted`, withdrew→`withdrawn`, reply→`replied`, interview→`interview`, offer→`offer`.

### list / stats / dashboard

```bash
node "$CLI" list --dir "$DIR" --limit 10
node "$CLI" stats --dir "$DIR"
open "$DIR/dashboard.html"   # macOS; or xdg-open on Linux
```

After manual CSV edits: `node "$CLI" generate --dir "$DIR"`.

## Auto-hook after apply / cover-letter

1. Take company, role, url, track from the vacancy context.
2. Infer source from URL.
3. Run **add** immediately when company + role exist.
4. Skip if the same url already exists.
5. End with one line: `Tracker: {id} · sent`

## Response style

Short: what changed, id, status, 1–2 metrics. Do not dump the whole CSV.

## Anti-patterns

- Do not rename CSV columns
- Do not hand-edit `data.js`
- Do not create new rows with a status other than `sent`
- Do not change `date` on status updates
