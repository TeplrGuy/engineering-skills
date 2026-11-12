const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('node:fs');
const { resolve, join } = require('node:path');

const sourcePath = 'standards/company.instructions.md';
const instructionPath = '.github/instructions/company-standards.instructions.md';
const hash = text => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex');
const git = (root, args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();

function verify(root, source) {
  const lock = JSON.parse(readFileSync(join(root, '.github/standards.lock.json'), 'utf8'));
  if (lock.repository !== 'TeplrGuy/engineering-skills' || lock.path !== sourcePath ||
      !/^[0-9a-f]{40}$/.test(lock.commit) || !/^[0-9a-f]{64}$/.test(lock.sha256)) {
    throw new Error('Invalid canonical standards lock.');
  }
  const canonical = readFileSync(join(source, sourcePath), 'utf8');
  if (git(source, ['rev-parse', 'HEAD']) !== lock.commit ||
      hash(canonical) !== lock.sha256 ||
      hash(readFileSync(join(root, instructionPath), 'utf8')) !== lock.sha256) {
    throw new Error('Standards revision or content drift; update through a reviewed rollout.');
  }
  if (!canonical.replace(/\r\n/g, '\n').startsWith('---\napplyTo: "**"\n---\n')) {
    throw new Error('Native path instructions require applyTo frontmatter.');
  }
}

function sync(root, source) {
  const commit = git(source, ['rev-parse', 'HEAD']);
  const canonical = readFileSync(join(source, sourcePath), 'utf8');
  if (git(source, ['status', '--porcelain', '--', sourcePath, 'scripts/standards.js'])) {
    throw new Error('Commit canonical standards and checker before distribution.');
  }
  const copilotPath = join(root, '.github/copilot-instructions.md');
  const instructions = readFileSync(copilotPath, 'utf8');
  const marker = '\n## Shared company standards\n';
  if (instructions.includes(marker) || existsSync(join(root, '.github/standards.lock.json'))) {
    throw new Error('Standards already configured; review existing integration before updating.');
  }
  mkdirSync(join(root, '.github/instructions'), { recursive: true });
  writeFileSync(join(root, instructionPath), canonical);
  writeFileSync(join(root, '.github/standards.lock.json'), JSON.stringify({
    repository: 'TeplrGuy/engineering-skills', commit, path: sourcePath, sha256: hash(canonical)
  }, null, 2) + '\n');
  writeFileSync(copilotPath, instructions + marker +
    'Read `.github/instructions/company-standards.instructions.md` before implementation.\n' +
    'Its canonical source and immutable revision are recorded in `.github/standards.lock.json`.\n' +
    'This shared baseline supplements the repository-specific guidance above. Escalate conflicts.\n');
  mkdirSync(join(root, '.github/workflows'), { recursive: true });
  writeFileSync(join(root, '.github/workflows/standards.yml'), `name: Shared standards
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  standards:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
        with:
          path: consumer
      - uses: actions/checkout@v4
        with:
          repository: TeplrGuy/engineering-skills
          ref: ${commit}
          path: canonical
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: node canonical/scripts/standards.js verify consumer canonical
`);
  verify(root, source);
}

if (require.main === module) {
  try {
    const [, , mode, root, source] = process.argv;
    if (!['sync', 'verify'].includes(mode) || !root || !source || process.argv.length !== 5) {
      throw new Error('Usage: node scripts/standards.js <sync|verify> <consumer> <canonical-checkout>');
    }
    (mode === 'sync' ? sync : verify)(resolve(root), resolve(source));
    console.log('Shared standards verified against the pinned canonical revision.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { hash, verify };
