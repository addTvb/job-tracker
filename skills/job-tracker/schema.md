# Job Tracker — data schema

**Tracker folder:** `<repo>/tracker/`  
**CSV:** `applications.csv` (source of truth)  
**Generated:** `data.js` (do not edit by hand)

## CSV columns (fixed order)

| Column | Required | Values |
|--------|----------|--------|
| `id` | yes | `YYYY-MM-DD-NNN` |
| `date` | yes | ISO date `YYYY-MM-DD` |
| `company` | yes | string |
| `role` | yes | string |
| `track` | yes | `frontend` \| `fullstack` |
| `source` | yes | `hh` \| `linkedin` \| `referral` \| `company_site` \| `other` |
| `url` | no | vacancy URL |
| `status` | yes | see statuses |
| `updated_at` | yes | ISO datetime |
| `notes` | no | short text |

## Statuses

Funnel: `sent` → `replied` → `interview` → `offer`  
Side: `rejected` \| `ghosted` \| `withdrawn`

- New applications always start as `sent`.
- Status updates change only `status` + `updated_at`.

## Metrics

Base for rates = `total` rows.

| Metric | Formula |
|--------|---------|
| `inPipeline` | sent + replied + interview |
| `replyRate` | (replied + interview + offer) / total |
| `interviewRate` | (interview + offer) / total |
| `offerRate` | offer / total |
| `rejectRate` | rejected / total |
| `ghostRate` | ghosted / total |

## CLI

From repo root (or any cwd):

```bash
CLI=skills/job-tracker/generate-data.js
DIR=tracker

node "$CLI" "$DIR"
node "$CLI" add --dir "$DIR" --company "Acme" --role "FE" --track frontend --source linkedin
node "$CLI" status --dir "$DIR" --id Acme --status rejected
node "$CLI" list --dir "$DIR" --limit 10
node "$CLI" stats --dir "$DIR"
```

Default `--dir` is `<repo>/tracker` (resolved from the script location).
