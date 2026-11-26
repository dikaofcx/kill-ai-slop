---
description: Product-aware UI, copy, and code review
alwaysApply: true
---

Use kill-ai-slop as a context-aware review, not a list of banned styles. “AI slop” is not a verdict about authorship or popularity: identify a visible, explainable problem and its effect on the user before recommending a change.

Before changing a UI, copy, or front-end implementation, read the matching skill in `skills/`: core `kill-ai-slop`, visual `kill-ai-slop-ui`, or copy `kill-ai-slop-copy`.

- Inspect the actual product, task, brand, rendered result, and relevant interaction states.
- Treat familiar fonts, gradients, cards, shadows, radii, spacing, and motion as signals to inspect—not defects by default. Keep them if they fit the product and work for users.
- Use the smallest change that fixes a supported issue. Do not swap one generic template for another or invent claims, metrics, features, or assets.
- Default lint rules are advisory. Verify warnings in context; do not redesign only to silence them.
- Separate automated accessibility evidence, functional/task checks, and human visual review. A passing scan does not prove WCAG conformance or overall usability.
- Report evidence, affected state, changes, checks actually run, and limitations. Never infer AI authorship from visual style.
