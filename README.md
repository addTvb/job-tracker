# Job Application Toolkit

Local toolkit for job applications with **Cursor Agent Skills**:

1. **apply** — tailor a resume + cover letter from a single master file  
2. **cover-letter** — cover letter only  
3. **job-tracker** — CSV log + HTML dashboard (conversion rates, charts)

No database. No Google Docs. Sample candidate data is **fictional** (`Alex Rivera`).  
The whole project (skills, docs, UI) is **English-only**.

## Layout

```text
job-application-toolkit/
├── resume/
│   └── master.md          # ← replace with your resume (skills always read this file)
├── tracker/
│   ├── applications.csv   # source of truth for applications
│   ├── data.js            # generated — do not edit
│   ├── dashboard.html     # open in a browser
│   └── samples/
├── skills/
│   ├── apply/             # resume + cover letter
│   ├── cover-letter/      # letter only
│   └── job-tracker/       # CSV CLI + skill
├── LICENSE
└── README.md
```

## Quick start

### 1. Clone

```bash
git clone https://github.com/addTvb/job-tracker.git
cd job-tracker
```

### 2. Put your resume in place

Edit or replace:

```bash
resume/master.md
```

Skills **always** load this path. They do not pull resumes from Google Docs or other files.

### 3. Install Cursor skills (symlinks)

```bash
mkdir -p ~/.cursor/skills
ln -sfn "$(pwd)/skills/apply" ~/.cursor/skills/apply
ln -sfn "$(pwd)/skills/cover-letter" ~/.cursor/skills/cover-letter
ln -sfn "$(pwd)/skills/job-tracker" ~/.cursor/skills/job-tracker
```

Restart Cursor or open a new agent chat so skills are picked up.

### 4. Generate dashboard data

```bash
node skills/job-tracker/generate-data.js
open tracker/dashboard.html   # macOS
```

## Usage in Cursor chat

| You say | Skill |
|---------|--------|
| `apply: https://…` | Tailor resume + letter → log to tracker |
| `cover letter https://…` | Letter only → log to tracker |
| `log application …` | Tracker `add` |
| `rejected at Acme` / `interview at …` | Tracker `status` |
| `application stats` | Tracker `stats` |
| `open application dashboard` | Open `tracker/dashboard.html` |

### Tracker CLI

```bash
CLI=skills/job-tracker/generate-data.js
DIR=tracker

node "$CLI" add --dir "$DIR" --company "Acme" --role "Frontend Engineer" --track frontend --source linkedin --url "https://…"
node "$CLI" status --dir "$DIR" --id Acme --status rejected
node "$CLI" list --dir "$DIR"
node "$CLI" stats --dir "$DIR"
node "$CLI" generate --dir "$DIR"
```

Statuses: `sent` → `replied` → `interview` → `offer`, plus `rejected` | `ghosted` | `withdrawn`.

## Customize

1. Replace `resume/master.md` with your real resume (Markdown, English).  
2. Clear or edit `tracker/applications.csv` (keep the header row).  
3. Run `node skills/job-tracker/generate-data.js` and refresh the dashboard.  
4. Optionally change prompts in `skills/apply/prompt.md` and `cover-letter.md`.

## Requirements

- [Node.js](https://nodejs.org/) 18+ (for the tracker CLI; no npm packages)
- [Cursor](https://cursor.com/) with Agent Skills enabled
- Browser with network access for Chart.js CDN (dashboard charts)

## Privacy

This repository ships **example** data only. Do not commit real personal resumes or private application notes if you fork publicly — keep secrets local or use a private repo.

## License

MIT — see [LICENSE](LICENSE).
