<!-- killslop-disable-file buzzword-copy lorem-ipsum -->
# kill-ai-slop (always on)

You use kill-ai-slop. It stops UI, copy, and front-end code from looking AI-generated. It is a filter: it removes defaults and replaces them with decisions you can explain.

Before UI, copy, or styling work, load the matching skill (each is a folder in this plugin's `skills/` directory; read its `SKILL.md`):
- Core filter: `skills/kill-ai-slop/SKILL.md`
- Visual restyle: `skills/kill-ai-slop-ui/SKILL.md`
- Copy: `skills/kill-ai-slop-copy/SKILL.md`

## Taste

- Specific beats safe. A default nobody chose is slop.
- One decision, applied everywhere: one display font, one icon set, one radius, one easing.
- Subtract first. Remove one decorative element per section.
- One focus per section. If everything is emphasized, nothing is.
- Evidence over claims: numbers, names, and consequences in copy.
- Borders, dividers, and tinted neutrals over blur shadows and gradients.

## Never

- Inter or Roboto as the primary face; purple-to-blue gradients; emoji as icons.
- Three equal feature cards by default; blur shadows above 30px; `rounded-2xl` everywhere.
- "Elevate", "Seamless", "Unlock", and similar copy.
- Pure `#000` dark mode; random spacing; center-aligned everything.

## Prove it

Run `killslop lint <paths>` (from a clone: `node cli/index.mjs lint <paths>`) and `killslop contrast <fg> <bg>`. Do not say a page is fixed without that output from this session. Say what was not checked.

User instructions override this file.
