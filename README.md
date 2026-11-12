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

## Promotion channels

- `draft`: in development, never used in production repos.
- `candidate`: benchmarked and under review.
- `stable`: approved for cross-repo rollout.

Only `stable` versions may be synced by production repositories.

## Shared standards and native Copilot context

`standards/company.instructions.md` is the canonical shared engineering baseline.
Consumers carry its exact contents in
`.github/instructions/company-standards.instructions.md` with `applyTo: "**"`;
their repository-wide Copilot instructions explicitly reference it as well.
`.github/standards.lock.json` pins the source commit and SHA-256. The `Shared
standards / standards` workflow checks the copy against that pinned revision.
Require this check through repository rules after reviewing the rollout; merely
adding a workflow does not make it a required merge check.

For an initial rollout, commit the source and checker, then run:

```text
node scripts/standards.js sync <consumer-checkout> <canonical-checkout>
node scripts/standards.js verify <consumer-checkout> <canonical-checkout>
```

Submit consumer changes through PRs. Pinning prevents silent changes from mutable
`main`; future policy updates need an explicit reviewed lock and workflow update.
Existing repository-specific guidance remains applicable. Do not copy deployment
secrets or incident/customer data into these files.

### Space and Memory

Create a private **Agentic SDLC standards** Copilot Space under the intended owner.
Attach this canonical file, architecture/runbooks, shared contracts and
`TeplrGuy/portal-web#2`; attach the Space to the relevant planning conversation.
Use repository instructions for coding sessions rather than assuming a Space is
automatically loaded. Keep source-linked files authoritative; uploaded snapshots
can become stale. Sharing a Space must not inadvertently broaden source access.

Copilot Memory complements instructions with cited, revalidated repository facts
and user preferences. It is not a shared policy store, approval record or substitute
for review. Enable it only within the intended account/repository scope, inspect
stored facts and their citations, and remove stale or sensitive facts.

`TeplrGuy` is a personal account. A customer's organization can additionally use
**Organization settings > Copilot > Custom instructions** for shared policy on
supported surfaces; organization instructions do not cover every local client.
Rulesets, required CI, CODEOWNERS review and protected environments enforce gates.
Spaces and Memory alone do not.
