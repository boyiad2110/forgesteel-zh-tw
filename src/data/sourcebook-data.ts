import { FeatureFlags } from '@/utils/feature-flags';
import { Sourcebook } from '@/models/sourcebook';

export class SourcebookData {
	private static cache: Sourcebook[] | null = null;

	// Loads (and caches) all built-in sourcebooks, the same way homebrew sourcebooks
	// are loaded from storage at boot. Dynamic imports let the bundler split each
	// sourcebook (and the shared data pools it draws on) into its own chunk, fetched
	// alongside the rest of the app's async boot data instead of the main bundle.
	static loadAll = async () => {
		if (SourcebookData.cache) {
			return SourcebookData.cache;
		}

		// This edition keeps Official sourcebooks only; Community and Third Party
		// ones are never imported here, so their data never reaches the runtime.
		const modules: Promise<Sourcebook>[] = [
			// Official
			import('@/data/sourcebooks/official/core').then(m => m.core),
			import('@/data/sourcebooks/official/orden').then(m => m.orden),
			import('@/data/sourcebooks/official/beastheart').then(m => m.beastheartSourcebook),
			import('@/data/sourcebooks/official/summoner').then(m => m.summonerSourcebook)
		];

		if (FeatureFlags.hasFlag(FeatureFlags.playtest.code)) {
			modules.push(import('@/data/sourcebooks/official/patreon').then(m => m.patreon));
		}

		SourcebookData.cache = await Promise.all(modules);
		return SourcebookData.cache;
	};

	static getCached = () => {
		if (!SourcebookData.cache) {
			throw new Error('SourcebookData.loadAll() has not resolved yet.');
		}

		return SourcebookData.cache;
	};
}
