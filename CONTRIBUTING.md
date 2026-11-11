# Contributing

1. Keep sample data fictional — no real personal resumes or private job notes in PRs.
2. Tracker CSV column order is fixed; update `skills/job-tracker/schema.md` if you change it.
3. After changing metrics logic, run:

```bash
node skills/job-tracker/generate-data.js
```

4. Skills should resolve the repo via `skills/<name>/../..` so symlinks from `~/.cursor/skills` keep working.
