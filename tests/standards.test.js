const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const { hash, verify } = require('../scripts/standards');

test('accepts a pinned native instruction and rejects content or revision drift', t => {
  const root = mkdtempSync(join(tmpdir(), 'sdlc-standards-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, 'source');
  const consumer = join(root, 'consumer');
  mkdirSync(join(source, 'standards'), { recursive: true });
  mkdirSync(join(consumer, '.github/instructions'), { recursive: true });
  const git = args => execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' }).trim();
  git(['init', '--quiet']);
  const text = '---\napplyTo: "**"\n---\n# Test standard\n';
  writeFileSync(join(source, 'standards/company.instructions.md'), text);
  git(['add', '.']);
  git(['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid',
    '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'fixture']);
  const lock = {
    repository: 'TeplrGuy/engineering-skills', commit: git(['rev-parse', 'HEAD']),
    path: 'standards/company.instructions.md', sha256: hash(text)
  };
  const writeLock = () => writeFileSync(join(consumer, '.github/standards.lock.json'), JSON.stringify(lock));
  writeLock();
  const copy = join(consumer, '.github/instructions/company-standards.instructions.md');
  writeFileSync(copy, text.replace(/\n/g, '\r\n'));
  verify(consumer, source);
  writeFileSync(copy, `${text}Changed\n`);
  assert.throws(() => verify(consumer, source), /drift/);
  writeFileSync(copy, text);
  lock.commit = 'a'.repeat(40);
  writeLock();
  assert.throws(() => verify(consumer, source), /drift/);
  lock.commit = 'main';
  writeLock();
  assert.throws(() => verify(consumer, source), /Invalid/);
});
