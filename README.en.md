<!-- killslop-disable-file buzzword-copy lorem-ipsum -->
![Kill AI Slop](assets/banner.png)

# Kill AI Slop

[Indonesia](README.md) · [English](README.en.md)

An agent toolkit for auditing, reworking, and building interfaces that actually fit the product—not another generic template with a fresh coat of paint. It includes one core skill, five specialist skills, plugin adapters, a lint/install CLI, and a quality harness.

**The main idea:** popular patterns aren't a crime. Don't change things just to look different. Change what genuinely makes tasks harder, breaks consistency or accessibility, or erases the product's character. The linter only raises heuristic signals—it isn't a judge that can label a UI “AI slop,” and it doesn't replace a visual review. One warning isn't a verdict.

## Quick start

Requires Node.js 20.12 or newer.

```sh
npm ci
npm run ci
node cli/index.mjs list
node cli/index.mjs lint src --format text
node cli/index.mjs contrast "#0B0B0F" "#F7F6F3"
```

All built-in rules are **advisory warnings**. A lint finding is a nudge to take a closer look—not a catastrophe, and it won't fail the command. Want to use lint as a quality gate? Set `--strict`, `--max-warnings N`, or an explicit severity in `.killslop.json`.

```sh
node cli/index.mjs lint src --format github --max-warnings 10
node cli/index.mjs lint src --strict
```

See [GUIDE.md](GUIDE.md) for JSON output, GitHub Actions annotations, suppressions, configuration, and heuristic limitations.

## Install a skill

```sh
node cli/index.mjs init --agent claude --dry-run
node cli/index.mjs init --agent claude
node cli/index.mjs init --agent all --dry-run
```

Or choose the skill's target folder yourself:

```sh
node cli/index.mjs install --target ./.agents/skills --dry-run
node cli/index.mjs install --target ./.agents/skills
```

The installer checks for conflicts before writing, rejects symlinks in the target path, and won't silently overwrite a different file. Use `--replace` (or its `--force` alias) only when you choose to; the old file gets a uniquely named backup.

## What's in the repo

- **Core:** [SKILL.md](SKILL.md), procedures in [agents.md](agents.md), pattern guidance in [skills.md](skills.md), and visual principles in [soul.md](soul.md).
- **Five specialist skills:** [UI](skills/kill-ai-slop-ui/SKILL.md), [copy](skills/kill-ai-slop-copy/SKILL.md), mobile, accessibility, and code implementation—all under [`skills/`](skills/).
- **CLI:** linting, a Claude Code hook, agent installation, rule listing, and contrast checking—with no runtime dependencies.
- **Harness:** CLI and rule tests, fixtures, evaluation cases, manifest and link checks, version and skill sync, plus cross-OS and cross-Node CI.
- **Adapters:** Agents, Claude Code, Cline, Codex, Cursor, Kimi, Oh My Pi, and Qoder.
- **References and templates:** [UI source list](skills/kill-ai-slop-ui/references/sources.md), [CSS token template](skills/kill-ai-slop-ui/references/tokens-template.css), logo, and banner.

The canonical skill sources are four root files. If you change them, run `npm run sync-skills`; don't edit generated copies directly.

## Claude Code hook

The plugin runs a `PostToolUse` hook on files that are written or edited. Lint findings add context for the agent, but they're advisory, and the hook always exits with status 0—heuristics shouldn't block the work. The protocol has been tested with simulated input, but not verified in a live Claude Code session.

## Plugins and publication status

Adapter manifests live in `.agents/plugins/`, `.claude-plugin/`, `.cline-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `.kimi-plugin/`, `.omp-plugin/`, and `.qoder-plugin/`. This repo hasn't been published to a marketplace or npm, and its integration paths haven't been tested in every agent client. The client and account running these commands need access to this repository.

### Example client commands

These commands are kept from the source package, but haven't been tested against the latest client versions. If one has gone stale, check the client's official docs and report the fix in an issue.

```text
# Claude Code
/plugin marketplace add https://github.com/dikaofcx/kill-ai-slop
/plugin install kill-ai-slop@kill-ai-slop

# Kimi Code
/plugins install https://github.com/dikaofcx/kill-ai-slop
```

```sh
# Codex
codex plugin marketplace add dikaofcx/kill-ai-slop
codex plugin add kill-ai-slop@kill-ai-slop

# Cursor agent CLI
agent plugin marketplace add https://github.com/dikaofcx/kill-ai-slop

# Cline CLI
cline plugin install https://github.com/dikaofcx/kill-ai-slop.git

# Oh My Pi
omp plugin marketplace add dikaofcx/kill-ai-slop
omp plugin install kill-ai-slop@kill-ai-slop

# Pi
pi install git:github.com/dikaofcx/kill-ai-slop
```

Want a local install without the marketplace flow? Run `node cli/index.mjs init --agent <name> --dry-run` first, then review the planned file changes before continuing.

## Verification

```sh
npm ci
npm run ci
npm --prefix cli test
node cli/index.mjs lint cli/test/fixtures/slop.html --format json
```

`npm run ci` checks generated-file sync, structure, manifests, links, and tests. Visual and accessibility reviews still need to happen separately in the target project—the linter doesn't render pages, so don't expect it to judge the actual interface.

Read [GUIDE.md](GUIDE.md) for command contracts and rule limitations. For contribution, security, and project plans, see [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [ROADMAP.md](ROADMAP.md).
