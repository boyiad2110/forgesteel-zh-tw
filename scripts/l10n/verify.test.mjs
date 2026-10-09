import { describe, expect, test } from 'vitest';
import { checks, runChecks, selectChecks } from './verify.mjs';

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
