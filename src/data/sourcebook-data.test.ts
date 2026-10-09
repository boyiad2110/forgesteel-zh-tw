import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureFlags } from '@/utils/feature-flags';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';

let store: Record<string, string>;

beforeEach(() => {
	vi.resetModules();
	store = {};
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => { store[key] = value; },
		removeItem: (key: string) => { delete store[key]; }
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('official built-in sourcebooks', () => {
	test('loads the official core, setting and expansions', async () => {
		const { SourcebookData } = await import('@/data/sourcebook-data');
		const sourcebooks = await SourcebookData.loadAll();
		expect(sourcebooks.map(sb => sb.id)).toEqual([ 'core', 'orden', 'beastheart', 'summoner' ]);
		expect(sourcebooks.every(sb => sb.type === SourcebookType.Official)).toBe(true);
	});

	test('legacy community flags cannot restore excluded built-ins or visible flags', async () => {
		const codes = [ FeatureFlags.communityPreRelease.code, FeatureFlags.ageOfSecrets.code ];
		store.feature_flag_codes = codes.join(';');
		const { SourcebookData } = await import('@/data/sourcebook-data');
		const sourcebooks = await SourcebookData.loadAll();
		expect(sourcebooks.map(sb => sb.id)).toEqual([ 'core', 'orden', 'beastheart', 'summoner' ]);
		expect(FeatureFlags.active()).toEqual([]);
		codes.forEach(code => expect(FeatureFlags.flagExists(code)).toBe(false));
		expect(store.feature_flag_codes).toBe(codes.join(';'));
	});

	test('excluded flags cannot be newly activated', () => {
		FeatureFlags.add(FeatureFlags.communityPreRelease.code);
		FeatureFlags.add(FeatureFlags.ageOfSecrets.code);
		expect(store.feature_flag_codes).toBeUndefined();
	});

	test('preserves official playtest and warehouse flags', async () => {
		FeatureFlags.add(FeatureFlags.playtest.code);
		FeatureFlags.add(FeatureFlags.warehouse.code);
		const { SourcebookData } = await import('@/data/sourcebook-data');
		const sourcebooks = await SourcebookData.loadAll();
		expect(sourcebooks.map(sb => sb.id)).toEqual([ 'core', 'orden', 'beastheart', 'summoner', 'patreon' ]);
		expect(sourcebooks.every(sb => sb.type === SourcebookType.Official)).toBe(true);
		expect(FeatureFlags.active().map(flag => flag.code)).toEqual(expect.arrayContaining([ FeatureFlags.playtest.code, FeatureFlags.warehouse.code ]));
	});

	test('shares the cached load across concurrent callers', async () => {
		const { SourcebookData } = await import('@/data/sourcebook-data');
		const first = SourcebookData.loadAll();
		const second = SourcebookData.loadAll();
		expect(second).toBe(first);
		expect(await second).toBe(await first);
	});

	test('keeps user homebrew available to the combined library', async () => {
		const { SourcebookData } = await import('@/data/sourcebook-data');
		const builtIn = await SourcebookData.loadAll();
		const homebrew = FactoryLogic.createSourcebook();
		homebrew.ancestries.push(FactoryLogic.createAncestry());
		const before = structuredClone(homebrew);
		const combined = SourcebookLogic.getSourcebooks(builtIn, [ homebrew ]);
		expect(combined).toContain(homebrew);
		expect(homebrew.type).toBe(SourcebookType.Homebrew);
		expect(SourcebookLogic.getAncestries(combined)).toContain(homebrew.ancestries[0]);
		expect(homebrew).toEqual(before);
	});
});
