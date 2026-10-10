import { describe, expect, test } from 'vitest';
import { checks, inspectEnvironment, runChecks, selectChecks } from './verify.mjs';

describe('environment diagnostics', () => {
	const probes = {
		readPackage: () => ({ version: '1.0.0' }),
		probeSass: () => 'compiled',
		probeTemp: () => 'writable'
	};

	test('reports a missing embedded compiler even when sass is installed', () => {
		const results = inspectEnvironment({ ...probes, readPackage: name => {
			if (name === 'sass-embedded') throw new Error('missing package');
			return { version: '1.0.0' };
		} });
		expect(results.find(result => result.name === 'sass')).toMatchObject({ ok: true });
		expect(results.find(result => result.name === 'sass-embedded')).toMatchObject({ ok: false, detail: 'missing package' });
	});

	test('detects a compiler binary that cannot start and still checks temporary writes', () => {
		const results = inspectEnvironment({ ...probes, probeSass: () => { throw new Error('EPERM compiler'); } });
		expect(results.find(result => result.name === 'Sass compiler')).toMatchObject({ ok: false, detail: 'EPERM compiler' });
		expect(results.find(result => result.name === 'Temporary directory')).toMatchObject({ ok: true });
	});

	test('reports an unwritable temporary directory independently of installed tools', () => {
		const results = inspectEnvironment({ ...probes, probeTemp: () => { throw new Error('EACCES temporary directory'); } });
		expect(results.find(result => result.name === 'Temporary directory')).toMatchObject({ ok: false });
		expect(results.filter(result => !result.ok)).toHaveLength(1);
	});
});

describe('verification runner', () => {
	test('runs audit and build after an earlier test failure and returns failure', () => {
		const visited = [];
		const logs = [];
		const result = runChecks(checks, check => {
			visited.push(check.id);
			return { status: check.id === 'tests' ? 1 : 0 };
		}, line => logs.push(line));
		expect(visited).toEqual([ 'guard', 'lint', 'types', 'tests', 'build', 'audit' ]);
		expect(result.code).toBe(1);
		expect(logs).toContainEqual(expect.stringMatching(/^FAIL tests: exit 1/));
		expect(logs).toContainEqual(expect.stringMatching(/^PASS audit: exit 0/));
	});

	test('audit findings cannot be reported as success', () => {
		const result = runChecks(checks, check => ({ status: check.id === 'audit' ? 1 : 0 }), () => {});
		expect(result.code).toBe(1);
		expect(result.results.at(-1)).toMatchObject({ id: 'audit', code: 1 });
	});

	test('reports missing executables and still runs the other checks', () => {
		const result = runChecks(checks, check => check.id === 'lint'
			? { status: null, error: new Error('ENOENT') } : { status: 0 }, () => {});
		expect(result.code).toBe(1);
		expect(result.results).toHaveLength(6);
		expect(result.results[1]).toMatchObject({ id: 'lint', code: 1, detail: 'ENOENT' });
	});

	test('a thrown execution error does not hide later results', () => {
		const result = runChecks(checks, check => {
			if (check.id === 'guard') throw new Error('cannot spawn');
			return { status: 0 };
		}, () => {});
		expect(result.code).toBe(1);
		expect(result.results).toHaveLength(6);
	});

	test('interruption fails and reports remaining checks as skipped', () => {
		const logs = [];
		const result = runChecks(checks, () => ({ status: null, signal: 'SIGINT' }), line => logs.push(line));
		expect(result.code).toBe(1);
		expect(result.results).toHaveLength(1);
		expect(logs).toContain('SKIP audit: interrupted');
	});

	test('succeeds only when every selected check succeeds', () => {
		expect(runChecks(checks, () => ({ status: 0 }), () => {}).code).toBe(0);
	});

	test('CI selection uses the same commands and keeps upstream test defaults', () => {
		expect(selectChecks([])).toBe(checks);
		expect(selectChecks([ '--only', 'tests' ])).toEqual([
		{ id: 'tests', command: 'node', args: [ 'node_modules/vitest/vitest.mjs', 'run' ] }
		]);
		expect(selectChecks([ '--only', 'audit' ])).toEqual([
		{ id: 'audit', command: 'npm', args: [ 'audit' ] }
		]);
	});

	test.each([ [ '--only', 'unknown' ], [ '--only' ], [ '--only', 'tests', '--testTimeout=30000' ] ])('rejects invalid arguments: %j', (...args) => {
		expect(() => selectChecks(args)).toThrow('Usage:');
	});
});
