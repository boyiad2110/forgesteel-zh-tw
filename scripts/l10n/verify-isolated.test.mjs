import { describe, expect, test } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { copyWorktree, fingerprintWorktree } from './verify-isolated.mjs';

describe('isolated worktree capture', () => {
	test('copies current edits and new files, skips deletions, and leaves the source intact', () => {
		const fixture = mkdtempSync(path.join(tmpdir(), 'l10n-isolation-'));
		try {
			const source = path.join(fixture, 'source');
			const stage = path.join(fixture, 'stage');
			mkdirSync(source);
			writeFileSync(path.join(source, 'edited.txt'), 'current unsaved-to-git contents');
			writeFileSync(path.join(source, 'new.txt'), 'new regression script');
			const files = [ 'edited.txt', 'new.txt', 'deleted.txt' ];
			const before = fingerprintWorktree(source, files);
			copyWorktree(source, stage, files);
			expect(fingerprintWorktree(stage, files)).toBe(before);
			writeFileSync(path.join(stage, 'edited.txt'), 'installation or test output');
			expect(readFileSync(path.join(source, 'edited.txt'), 'utf8')).toBe('current unsaved-to-git contents');
			expect(fingerprintWorktree(source, files)).toBe(before);
			writeFileSync(path.join(source, 'new.txt'), 'changed during verification');
			expect(fingerprintWorktree(source, files)).not.toBe(before);
		} finally {
			rmSync(fixture, { recursive: true, force: true });
		}
	});

	test('rejects paths outside the source or destination', () => {
		expect(() => copyWorktree('/source', '/stage', [ '../outside.txt' ])).toThrow('File outside worktree');
	});
});
