<!-- killslop-disable-file buzzword-copy lorem-ipsum -->
# kill-ai-slop: single-file filter

Paste this whole file into any chat or agent. No install needed. It is the short form of the skills in this repo.

Apply these rules to every page, component, or screen you build or restyle. Do not change content structure. After the work, list each change with a one-line reason.

## Replace these

| Slop | Use instead |
|---|---|
| Inter/Roboto for everything | One display face (Fontshare, Uncut) plus one neutral body face |
| Purple-to-blue gradient | One solid color plus one accent, or monochrome plus one pop |
| Emoji as icons | One icon set, stroke 1.5-2px |
| Three equal feature cards | Asymmetric, editorial, or bento layout |
| 40px blur shadows | 1px border; small shadow only on interactive elements |
| Large rounded corners everywhere | One choice: sharp (2px) or pill (999px) |
| "Elevate", "Seamless", "Unlock" | A concrete benefit with a number or name |
| Title + subtitle + two buttons hero | Add one real visual: screenshot, data, or animation |
| Center-aligned sections | Left-align, 65ch max width |
| Random spacing | 4 8 12 16 24 32 48 64 96 128 |
| `#000` and `#fff` | `#0B0B0F` and `#F7F6F3` |

## Checklist

1. Type: one display face, one body face, body line-height at least 1.5, text at most 65ch.
2. Color: one primary, one accent, one neutral scale of 5-9 steps, body contrast at least 4.5:1.
3. Grid: 12 columns or one editorial column; section padding from the spacing scale.
4. Hierarchy: one focus per section.
5. Detail: borders, dividers, or noise.
6. Motion: at most two transition kinds, one easing, 150-400ms.
7. Copy: numbers, names, consequences instead of buzzwords.
8. Remove one decorative element per section.

## Output

Per section: `- <change> - <reason>`. End with the final tokens (fonts, colors, spacing scale, icon set, radius, motion). Say what you did not verify.

Inspiration: https://www.fontshare.com, https://mobbin.com, https://supply.madebyoversight.com/sections, https://getshipframe.com. Full source list: `skills/kill-ai-slop-ui/references/sources.md`.
