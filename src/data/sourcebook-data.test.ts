// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FeatureFlags } from '@/utils/feature-flags';
import { SourcebookData } from '@/data/sourcebook-data';
import { SourcebookType } from '@/enums/sourcebook-type';

// loadAll() caches its result, so every test has to start from an empty cache in
// order to exercise the feature flag branches.
const resetCache = () => {
	(SourcebookData as unknown as { cache: unknown }).cache = null;
};

describe('SourcebookData.loadAll', () => {
	beforeEach(() => {
		resetCache();
		localStorage.clear();
	});

	afterEach(() => {
		resetCache();
		localStorage.clear();
	});

	it('loads no community or third party sourcebooks', async () => {
		const sourcebooks = await SourcebookData.loadAll();

		expect(sourcebooks.length).toBeGreaterThan(0);
		expect(sourcebooks.filter(sb => sb.type === SourcebookType.Community)).toEqual([]);
		expect(sourcebooks.filter(sb => sb.type === SourcebookType.ThirdParty)).toEqual([]);
		expect(sourcebooks.every(sb => sb.type === SourcebookType.Official)).toBe(true);
	});

	it('loads no community sourcebooks even when the community feature flags are enabled', async () => {
		FeatureFlags.add(FeatureFlags.communityPreRelease.code);
		FeatureFlags.add(FeatureFlags.ageOfSecrets.code);

		const sourcebooks = await SourcebookData.loadAll();

		expect(sourcebooks.filter(sb => sb.type === SourcebookType.Community)).toEqual([]);
		expect(sourcebooks.some(sb => sb.id === 'community-prerelease')).toBe(false);
		expect(sourcebooks.some(sb => sb.id === 'community-age-of-secrets')).toBe(false);
	});

	it('does not load the patreon sourcebook when the playtest flag is not enabled', async () => {
		const sourcebooks = await SourcebookData.loadAll();

		expect(FeatureFlags.hasFlag(FeatureFlags.playtest.code)).toBe(false);
		expect(sourcebooks.some(sb => sb.id === 'patreon')).toBe(false);
	});

	it('keeps the official patreon sourcebook when the playtest flag is enabled', async () => {
		FeatureFlags.add(FeatureFlags.playtest.code);

		const sourcebooks = await SourcebookData.loadAll();
		const patreon = sourcebooks.find(sb => sb.id === 'patreon');

		expect(patreon).toBeDefined();
		expect(patreon!.type).toBe(SourcebookType.Official);
	});
});
