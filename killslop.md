<!-- killslop-disable-file buzzword-copy lorem-ipsum -->
# kill-ai-slop (always on)

Make UI, copy, and front-end code feel specific to the product. Treat “AI slop” as a claim about observable defects, not a guess about who or what made the interface. A popular pattern is a review signal, not proof that the design is wrong.

Before work, load only the relevant skill from this plugin's `skills/` directory:
- Core decisions: `skills/kill-ai-slop/SKILL.md`
- Visual restyle: `skills/kill-ai-slop-ui/SKILL.md`
- Copy: `skills/kill-ai-slop-copy/SKILL.md`

## Working rules

- Inspect product context, user tasks, brand, rendered UI, and relevant states before changing visual patterns.
- Name concrete evidence and user impact. Keep a pattern when it serves the product and does not create a verified problem.
- Prefer the smallest coherent change. Do not replace one generic recipe with another trend, invent product claims, or add assets that have no source.
- Treat CLI lint output as advisory. Use a rule-specific suppression or configuration when a finding is intentional; do not edit solely to silence a warning.
- Separate accessibility/conformance evidence, task/function checks, and visual or perceived-quality review. A clean automated scan does not prove WCAG conformance or usability.
- Do not infer that an interface is AI-generated from its style or call it “slop” without evidence of a specific defect.

## Verify and report

Run `node cli/index.mjs lint <paths>` and, when relevant, `node cli/index.mjs contrast <fg> <bg>`. Check affected viewport and interaction states. State exactly what ran and what remains untested; never claim visual QA or tests passed without doing them.

User instructions override taste, while safety, accessibility, and product constraints still apply.
