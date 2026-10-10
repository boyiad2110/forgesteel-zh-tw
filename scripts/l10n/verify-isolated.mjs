/** Verify the current worktree in a disposable copy; never install into the active checkout. */
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { runChecks } from './verify.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const resolveFile = (directory, file) => {
	const resolved = path.resolve(directory, file);
	if (!resolved.startsWith(path.resolve(directory) + path.sep)) throw new Error(`File outside worktree: ${file}`);
	return resolved;
};

const listFiles = directory => execFileSync('git', [ 'ls-files', '--cached', '--others', '--exclude-standard', '-z' ], { cwd: directory, encoding: 'utf8' })
	.split('\0').filter(Boolean).sort();

export const fingerprintWorktree = (directory, files) => {
	const hash = createHash('sha256');
	for (const file of files) {
		const source = resolveFile(directory, file);
		if (!existsSync(source)) continue; // tracked deletion
		if (!lstatSync(source).isFile()) throw new Error(`Only regular files can be copied: ${file}`);
		hash.update(file + '\0').update(createHash('sha256').update(readFileSync(source)).digest());
	}
	return hash.digest('hex');
};

export const copyWorktree = (sourceDirectory, destination, files) => {
	for (const file of files) {
		const source = resolveFile(sourceDirectory, file);
		if (!existsSync(source)) continue;
		if (!lstatSync(source).isFile()) throw new Error(`Only regular files can be copied: ${file}`);
		const target = resolveFile(destination, file);
		mkdirSync(path.dirname(target), { recursive: true });
		copyFileSync(source, target);
	}
};

const runIsolated = () => {
	const stageRoot = path.resolve(tmpdir());
	if (stageRoot === root || stageRoot.startsWith(root + path.sep)) throw new Error('Isolated verification requires TEMP outside the active checkout.');
	const stage = mkdtempSync(path.join(stageRoot, 'forgesteel-l10n-verify-'));
	try {
		const files = listFiles(root);
		const fingerprint = fingerprintWorktree(root, files);
		copyWorktree(root, stage, files);
		if (fingerprintWorktree(stage, files) !== fingerprint) throw new Error('Worktree changed during copy; retry with a stable source.');
		const temp = path.join(stage, '.tmp');
		mkdirSync(temp);
		const env = { ...process.env, TEMP: temp, TMP: temp, TMPDIR: temp };
		const execute = check => check.command === 'npm' && process.platform === 'win32'
			? spawnSync(process.env.ComSpec || 'cmd.exe', [ '/d', '/s', '/c', 'npm.cmd ci' ], { cwd: stage, env, stdio: 'inherit' })
			: spawnSync(check.command === 'node' ? process.execPath : check.command, check.args, { cwd: stage, env, stdio: 'inherit' });
		console.log(`Isolated worktree: ${stage}; source SHA-256: ${fingerprint}`);
		const install = runChecks([ { id: 'install', command: 'npm', args: [ 'ci' ] } ], execute);
		if (install.code) return install.code;
		const result = runChecks([
			{ id: 'verify', command: 'node', args: [ 'scripts/l10n/verify.mjs' ] },
			{ id: 'browser', command: 'node', args: [ 'scripts/l10n/browser-smoke.mjs' ] }
		], execute);
		if (fingerprintWorktree(root, listFiles(root)) !== fingerprint) throw new Error('Source changed during verification; results do not cover the current worktree.');
		return result.code;
	} finally {
		// Delete only the directory this invocation created inside the resolved system temp root.
		const target = path.resolve(stage);
		if (path.dirname(target) !== stageRoot || !path.basename(target).startsWith('forgesteel-l10n-verify-')) throw new Error('Unsafe verification cleanup path');
		rmSync(target, { recursive: true, force: true });
		console.log('Removed isolated verification copy.');
	}
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		if (process.argv.length !== 2) throw new Error('Usage: node scripts/l10n/verify-isolated.mjs');
		process.exitCode = runIsolated();
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
