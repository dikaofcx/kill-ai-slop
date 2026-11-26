---
description: Lint a path for AI slop with killslop, then restyle what it finds
argument-hint: "[path]"
---

Run the killslop linter on `$ARGUMENTS` (use `.` if empty):

```
node "${CLAUDE_PLUGIN_ROOT}/cli/index.mjs" lint $ARGUMENTS
```

Then follow the `kill-ai-slop` skill: group the findings by section, choose design tokens once, fix each finding without changing content structure, re-run the linter until errors are gone, and report each change with a one-line reason.
