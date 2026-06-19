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

1. Each consumer repo pins a platform version in `.github/skills/skills.lock.json`.
2. A sync workflow copies pinned skills directly into `.github/skills/<skill>/v1/SKILL.md`.
3. Validation gates reject outputs that violate schema or required sections.
4. Nightly eval opens improvement issues when quality/tokens regress.

## Cloud-agent rollout validation

Docs-only README updates may be used to validate the cloud-agent flow end to end, including issue pickup, PR creation, and actionable PR review feedback, without introducing production risk.

## Promotion channels

- `draft`: in development, never used in production repos.
- `candidate`: benchmarked and under review.
- `stable`: approved for cross-repo rollout.

Only `stable` versions may be synced by production repositories.
