# Skill Benchmarks

Fixed scenarios used to evaluate determinism and token efficiency.

## Scoring dimensions

- `quality_score` (0-100): correctness and actionability.
- `determinism_score` (0-100): consistency across repeated runs.
- `token_efficiency_score` (0-100): useful output per token consumed.
- `latency_score` (0-100): response time against SLO.

Promotion requires:

- quality >= 85
- determinism >= 90
- token_efficiency >= 80
- no schema violations
