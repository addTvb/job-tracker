---
name: cover-letter
description: >-
  Writes only a cover letter for one vacancy using resume/master.md from this
  repository. Trigger: "сопровод" or "cover letter" with a vacancy URL/text.
  Does not rewrite the resume. After the letter, logs the application via
  job-tracker.
---

# Cover Letter

Only the cover letter. Master resume is **always** loaded from:

```text
<repo>/resume/master.md
```

Shared prompt: [../apply/cover-letter.md](../apply/cover-letter.md)

## Resolve paths

Same as apply: realpath of this skill’s `../..` = repo root.  
Resume file: `<repo>/resume/master.md`

## When to use

- Keyword `сопровод` + vacancy URL/text
- “only cover letter”, “cover letter”, without asking to tailor the resume

Full resume + letter → skill `apply`.

## Inputs

1. **VACANCY** — URL and/or full text
2. **RESUME** — contents of `resume/master.md` (always from that file)

## Workflow

```
Cover letter:
- [ ] 1. Resolve repo; read resume/master.md
- [ ] 2. Get full vacancy text
- [ ] 3. Run ../apply/cover-letter.md
- [ ] 4. Output letter in one fenced code block
- [ ] 5. Log via job-tracker
```

### Output rules

1. One message focused on the letter
2. Single plain-text fenced code block (optional `Subject:` / `Тема:` + 5 paragraphs)
3. Nothing before the block (no analysis)
4. After the block — only tracker line: `Tracker: {id} · sent`
5. No em-dash (—) or en-dash (–)
6. 120–180 words; language = vacancy language

### Job tracker

Follow [../job-tracker/SKILL.md](../job-tracker/SKILL.md) auto-hook (`add`, no duplicate URL).

## Anti-patterns

- Do not generate a full ATS resume here
- Do not read Google Docs or any resume path other than `resume/master.md`
- Do not invent facts outside the master file
