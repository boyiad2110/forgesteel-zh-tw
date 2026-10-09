/** Fork verification entry point. Keep upstream package scripts and defaults intact. */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const checks = [
	{ id: 'guard', command: 'node', args: [ 'scripts/l10n/check.mjs' ] },
	{ id: 'lint', command: 'npm', args: [ 'run', 'lint' ] },
	{ id: 'types', command: 'node', args: [ 'node_modules/typescript/bin/tsc', '-p', 'tsconfig.json' ] },
	{ id: 'tests', command: 'node', args: [ 'node_modules/vitest/vitest.mjs', 'run' ] },
	{ id: 'build', command: 'npm', args: [ 'run', 'build' ] },
	{ id: 'audit', command: 'npm', args: [ 'audit' ] }
];

const spawn = (check, stdio = 'inherit') => {
	const npmOnWindows = check.command === 'npm' && process.platform === 'win32';
	// Only fixed commands above (or npm --version) reach the Windows shell.
	const options = { cwd: root, stdio, encoding: 'utf8' };
	if (npmOnWindows) {
		return spawnSync(process.env.ComSpec || 'cmd.exe', [ '/d', '/s', '/c', `npm.cmd ${check.args.join(' ')}` ], options);
	}
	return spawnSync(check.command === 'node' ? process.execPath : 'npm', check.args, options);
};

export const selectChecks = args => {
	if (args.length === 0) return checks;
	if (args.length === 2 && args[0] === '--only') {
		const check = checks.find(item => item.id === args[1]);
		if (check) return [ check ];
	}
	throw new Error('Usage: node scripts/l10n/verify.mjs [--doctor | --only ' + checks.map(check => check.id).join('|') + ']');
};

export const runChecks = (selected, execute = spawn, log = console.log) => {
	const results = [];
	for (const check of selected) {
		log(`\n[${check.id}] ${check.command} ${check.args.join(' ')}`);
		const start = performance.now();
		let result;
		try {
			result = execute(check);
		} catch (error) {
			result = { error };
		}
		const code = result.error || result.signal ? 1 : result.status ?? 1;
		const detail = result.error?.message ?? result.signal ?? '';
		results.push({ id: check.id, code, seconds: (performance.now() - start) / 1000, detail });
		if (result.signal === 'SIGINT' || result.signal === 'SIGTERM') break;
	}
	log('\nVerification summary (exit 0 required for every selected check):');
	for (const result of results) {
		log(`${result.code === 0 ? 'PASS' : 'FAIL'} ${result.id}: exit ${result.code}, ${result.seconds.toFixed(1)}s${result.detail ? ` (${result.detail})` : ''}`);
	}
	for (const check of selected.slice(results.length)) log(`SKIP ${check.id}: interrupted`);
	return { results, code: results.length === selected.length && results.every(result => result.code === 0) ? 0 : 1 };
};

const doctor = () => {
	let ok = true;
	console.log(`Node ${process.version}; ${process.platform}/${process.arch}; repository ${root}`);
	const minimumNode = Number(readFileSync(path.join(root, '.nvmrc'), 'utf8').trim());
	if (Number(process.versions.node.split('.')[0]) < minimumNode) {
		console.error(`Node ${minimumNode}+ is required.`);
		ok = false;
	}
	const npm = spawn({ command: 'npm', args: [ '--version' ] }, 'pipe');
	console.log(`npm: ${npm.status === 0 ? npm.stdout.trim() : npm.error?.message ?? npm.stderr}`);
	if (npm.status !== 0) ok = false;
	for (const name of [ 'eslint', 'typescript', 'vitest', 'vite', 'sass' ]) {
		try {
			const pkg = JSON.parse(readFileSync(path.join(root, 'node_modules', name, 'package.json'), 'utf8'));
			console.log(`${name}: ${pkg.version}`);
		} catch {
			console.error(`${name}: missing or unreadable; install the lockfile dependencies with npm ci.`);
			ok = false;
		}
	}
	return ok;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		const args = process.argv.slice(2);
		if (args.length === 1 && args[0] === '--doctor') {
			process.exitCode = doctor() ? 0 : 1;
		} else {
			const selected = selectChecks(args);
			const environmentOk = doctor();
			// Diagnostics do not hide the individual failures or prevent audit running.
			process.exitCode = runChecks(selected).code || (environmentOk ? 0 : 1);
		}
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
