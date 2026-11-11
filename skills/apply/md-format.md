# Markdown format for tailored resume

Use this shape so the result is easy to copy and optionally convert to PDF later.

```markdown
# FULL NAME

Role Title As In Vacancy

Contacts line · Location / Remote

## ABOUT ME

Paragraph(s).

## EXPERIENCE

**Role - Company** *Mon YYYY - Mon YYYY · Remote*

- Bullet: verb + tech + metric
- Bullet …

## PROJECTS

**Project Name — stack · years**

Short intro.

- Bullet …

## SKILLS

**Frontend:** React, TypeScript, …

**Testing:** Jest, Playwright, …
```

### Rules

| Element | How |
|---------|-----|
| Sections | `ABOUT ME`, `EXPERIENCE`, `SKILLS`, optional `PROJECTS` |
| Jobs | `**Role - Company** *Period · Remote*` then `-` bullets |
| Skills | `**Block:** a, b, c` — one block per line |
| Language | English |
| Forbidden | tables, emoji, multi-column layouts |

Name and contacts always come from `resume/master.md`. Role title follows the vacancy.
