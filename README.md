# Engineering Skills Platform

Versioned, deterministic skills for consistent delivery across repositories.

## Goals

- Keep behavior consistent regardless of who or what model works the issue.
- Enforce stable output contracts and evidence-first delivery.
- Continuously optimize quality, latency, and token cost.

## Structure

- `skills/<skill-name>/v1/SKILL.md`: canonical skill contract.
- `skills-manifest.json`: approved skill versions and token budgets.
- `schemas/skill-output.schema.json`: required output envelope.
- `benchmarks/`: fixed eval scenarios for regression testing.
- `.github/workflows/skill-eval.yml`: nightly and on-demand evaluation.

## Runtime model

1. Each consumer repo records a version in `.github/skills/skills.lock.json`.
2. The current sync workflow copies skills from the central repository's
   `main` branch into `.github/skills/<skill>/v1/SKILL.md`; it does not enforce
   the recorded version or an immutable commit.
3. The consumer validation workflow checks for selected contract files; it does
   not currently validate agent output against the schema.
4. The evaluation workflow currently uses placeholder scores, so it does not
   measure actual skill quality, token usage, or regression.

## Promotion channels

- `draft`: in development, never used in production repos.
- `candidate`: benchmarked and under review.
- `stable`: approved for cross-repo rollout.

Only `stable` versions may be synced by production repositories.

## Draft Copilot-native testing assets

`draft-skills/acceptance-test-generation/SKILL.md` and
`draft-skills/playwright-journey-testing/SKILL.md` use Copilot's native skill format.
`templates/test-engineer.agent.md` is a reusable custom-agent profile. These
assets are draft until reviewed and promoted; the demo repositories carry
copies for evaluation. Draft skills are outside the sync job's `skills/`
source to prevent automatic rollout. The existing sync job reads `main`, not a pinned commit,
so do not treat its lock file as a verified immutable pin or use it for
production promotion.

For manual evaluation, copy each skill directory to `.github/skills/` and the
agent profile to `.github/agents/test-engineer.agent.md` in the target
repository. GitHub cloud agent availability depends on the assets being on the
repository's default branch; draft PR contents alone do not enable them.
