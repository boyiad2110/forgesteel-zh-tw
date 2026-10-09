import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ConditionName } from '@/l10n/condition-text';
import { ConditionType } from '@/enums/condition-type';
import { createElement } from 'react';
import glossary from '@/l10n/generated/zh-TW/glossary.json';
import { loadCatalog } from '@/l10n/catalog';
import { renderToStaticMarkup } from 'react-dom/server';
import { setLanguage } from '@/l10n/language';

beforeEach(async () => {
	const store: Record<string, string> = {};
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => { store[key] = value; }
	});
	await loadCatalog();
	setLanguage('zh-TW');
});

afterEach(() => vi.unstubAllGlobals());

test('standard condition names survive the upstream naming refactor and language switch', () => {
	const show = () => renderToStaticMarkup(createElement(ConditionName, { type: ConditionType.Bleeding, english: 'Bleeding' }));
	expect(show()).toBe(glossary['term.bleeding'].zh);
	setLanguage('en');
	expect(show()).toBe('Bleeding');
	setLanguage('zh-TW');
	expect(show()).toBe(glossary['term.bleeding'].zh);
});

test.each([ ConditionType.Custom, ConditionType.Quick ])('upstream %s condition names retain user or extracted text', type => {
	const english = 'An extracted or renamed condition';
	for (const language of [ 'zh-TW', 'en' ] as const) {
		setLanguage(language);
		expect(renderToStaticMarkup(createElement(ConditionName, { type, english }))).toBe(english);
	}
});

test('changed standard names retain the upstream text instead of hiding it with approved Chinese', () => {
	expect(renderToStaticMarkup(createElement(ConditionName, { type: ConditionType.Bleeding, english: 'Bleeding (modified)' }))).toBe('Bleeding (modified)');
});
