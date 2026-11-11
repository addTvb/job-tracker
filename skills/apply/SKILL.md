---
name: apply
description: >-
  Tailors a resume and cover letter for one vacancy using ONLY the fictional or
  user-provided master file at resume/master.md in this repository. Use when the
  user says apply, tailor resume, отклик, под вакансию, ATS resume, or pastes a
  job URL/JD and wants an adapted resume plus cover letter. For cover letter
  only, use the cover-letter skill. After finishing, log the application via
  job-tracker.
---

# Apply (resume + cover letter)

Generic application skill for this toolkit. **Always** load the master resume from:

```text
<repo>/resume/master.md
```

Never invent a different candidate profile. Never read Google Docs or other external resume sources unless the user explicitly asks to replace `resume/master.md`.

## Resolve paths

```bash
# Skill dir → repo root (skills/apply → ../..)
REPO="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]:-$0}" 2>/dev/null || echo "$0")")/../.." && pwd)"
# Prefer: ask the agent to resolve realpath of this SKILL.md's parent/../..
RESUME="$REPO/resume/master.md"
```

In Cursor: take the absolute path of this `SKILL.md`, go two directories up → repo root. Then:

- Resume: `<repo>/resume/master.md`
- Tracker skill: `<repo>/skills/job-tracker/SKILL.md`
- Prompts: `prompt.md`, `cover-letter.md`, `md-format.md` next to this file

## When to use

- User provides a vacancy URL or JD and wants a tailored resume
- Phrases: `apply`, `отклик`, `под вакансию`, `tailor resume`, `ATS`

Cover letter only → skill `cover-letter`.

## Inputs

1. **VACANCY** — URL and/or full text (required)
2. **RESUME** — full contents of `<repo>/resume/master.md` (required; load from disk every time unless already loaded in this session and unchanged)

If the vacancy text is missing — fetch/open the URL or ask the user to paste it. Do not start generation without both.

## Workflow

```
Apply:
- [ ] 1. Resolve repo root; read resume/master.md
- [ ] 2. Get full vacancy text
- [ ] 3. Run prompt.md → tailored Markdown (md-format.md)
- [ ] 4. Show resume + report; wait for approval if user wants edits
- [ ] 5. Write cover letter via cover-letter.md (resume = approved or master text)
- [ ] 6. Log application with job-tracker (add, status=sent)
```

### 1. Load resume

```bash
# Example — agent should Read the file tool / cat:
cat "$REPO/resume/master.md"
```

Replace the sample master with your own content before real applications. Keep the same filename: `resume/master.md`.

### 2. Vacancy text

- URL → open/fetch and extract title, requirements, responsibilities, nice-to-have
- Login wall / empty page → ask user to paste JD
- Do not invent requirements from the job title alone

### 3–4. Tailor resume

Follow [prompt.md](prompt.md). Output structure per [md-format.md](md-format.md).  
Facts only from `resume/master.md` (+ user answers in chat). No fabricated metrics.

### 5. Cover letter

Follow [cover-letter.md](cover-letter.md).

- One fenced code block with the letter body
- Language = vacancy language

### 6. Job tracker hook

Read and follow [../job-tracker/SKILL.md](../job-tracker/SKILL.md):

1. `add` into `<repo>/tracker/` with company, role, url, track, source
2. Skip duplicate URL
3. One line: `Tracker: {id} · sent`

## Anti-patterns

- Do not use any resume source other than `resume/master.md` (unless user replaced that file)
- Do not mix in personal data from other projects or chat history about a different person
- Do not invent employers, metrics, or stack missing from the master
- Do not skip the tracker hook after a completed apply

## Quick trigger

`apply: <vacancy url>` or `отклик: <url>`
