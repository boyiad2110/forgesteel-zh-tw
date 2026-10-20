import { OptionsContext, SourcebooksContext } from '@/contexts/data-context';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AncestryData } from '@/data/ancestry-data';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureComponent } from '@/components/panels/classic-sheet/components/feature-component';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { Sourcebook } from '@/models/sourcebook';
import contracts from '@/l10n/coverage-contracts.json';
import { core } from '@/data/sourcebooks/official/core';
import { createElement } from 'react';
import { loadCatalog } from '@/l10n/catalog';
import { mapping } from '@/l10n/mapping';
import { renderToStaticMarkup } from 'react-dom/server';
import { setLanguage } from '@/l10n/language';
import strings from '@/l10n/generated/zh-TW/strings.json';

vi.mock('dompurify', () => ({ default: { sanitize: (html: string) => html } }));
vi.mock('@/hooks/use-clipboard', () => ({
	useClipboard: () => ({ hasData: () => false, getData: () => null, setData: () => undefined })
}));

const sourcebooks: Sourcebook[] = [ core ];
const pilotFeature = AncestryData.orc.features.find(feature => feature.id === 'orc-feature-1');

const visibleText = (html: string) => html.replace(/<[^>]*>/g, '').replaceAll('&nbsp;', ' ');

const renderSurface = (surface: string, feature = pilotFeature) => {
	if (!feature) {
		throw new Error('Coverage source orc-feature-1 is missing');
	}
	const element = surface === 'detail'
		? createElement(FeaturePanel, { feature, sourcebooks })
		: surface === 'classic'
			? createElement(FeatureComponent, { feature })
			: undefined;
	if (!element) {
		throw new Error(`Unsupported coverage surface: ${surface}`);
	}
	return visibleText(renderToStaticMarkup(
		createElement(SourcebooksContext, { value: sourcebooks },
			createElement(OptionsContext, { value: FactoryLogic.createOptions() }, element)
		)
	));
};

describe('approved display coverage pilot', () => {
	beforeEach(async () => {
		let savedLanguage = 'zh-TW';
		vi.stubGlobal('localStorage', {
			getItem: () => savedLanguage,
			setItem: (_key: string, value: string) => { savedLanguage = value; }
		});
		vi.stubGlobal('window', {
			matchMedia: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined })
		});
		await loadCatalog();
		setLanguage('zh-TW');
	});

	for (const check of contracts.checks) {
		for (const surface of check.surfaces) {
			test(`${contracts.batchId} ${check.featureId} ${surface}: approved fields appear in Chinese and switch back to English`, () => {
				if (!pilotFeature || check.featureId !== pilotFeature.id) {
					throw new Error(`Unsupported or missing coverage source: ${check.featureId}`);
				}
				const chinese = renderSurface(surface);
				setLanguage('en');
				const english = renderSurface(surface);
				for (const field of check.fields) {
					if (field !== 'name' && field !== 'description') {
						throw new Error(`Unsupported coverage field: ${field}`);
					}
					const key = `element:${check.featureId}:${field}`;
					const sheetId = check.sourceIds[field];
					if (mapping[key]?.sheetId !== sheetId) {
						throw new Error(`${key}: approved mapping source has changed`);
					}
					const row = strings[sheetId as keyof typeof strings];
					if (!row || !row.zh || row.en !== pilotFeature[field]) {
						throw new Error(`${key}: approved source is missing or has changed`);
					}
					expect(chinese, `${key} at ${surface}`).toContain(row.zh);
					expect(english, `${key} at ${surface}`).toContain(pilotFeature[field]);
					expect(chinese, `${key} at ${surface}`).not.toContain(pilotFeature[field]);
				}
			});

			for (const fallback of check.englishFallbacks) {
				test(`${contracts.batchId} ${check.featureId} ${surface}: ${fallback} keeps original English`, () => {
					if (!pilotFeature || check.featureId !== pilotFeature.id) {
						throw new Error(`Unsupported or missing coverage source: ${check.featureId}`);
					}
					const approvedName = strings[check.sourceIds.name as keyof typeof strings].zh;
					const approvedDescription = strings[check.sourceIds.description as keyof typeof strings].zh;
					if (fallback === 'renamed') {
						const text = renderSurface(surface, { ...pilotFeature, name: 'My Relentless' });
						expect(text).toContain('My Relentless');
						expect(text).not.toContain(approvedName);
					} else if (fallback === 'edited-description') {
						const text = renderSurface(surface, { ...pilotFeature, description: 'My custom rule.' });
						expect(text).toContain('My custom rule.');
						expect(text).not.toContain(approvedDescription);
					} else if (fallback === 'unknown-id') {
						const text = renderSurface(surface, { ...pilotFeature, id: 'homebrew-relentless' });
						expect(text).toContain(pilotFeature.name);
						expect(text).toContain(pilotFeature.description);
						expect(text).not.toContain(approvedName);
						expect(text).not.toContain(approvedDescription);
					} else {
						throw new Error(`Unsupported fallback case: ${fallback}`);
					}
				});
			}
		}
	}
});
