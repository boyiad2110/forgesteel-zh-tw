import { FeaturePerk, FeatureText } from '@/models/feature';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureComponent } from '@/components/panels/classic-sheet/components/feature-component';
import { FeatureType } from '@/enums/feature-type';
import { HeroSheet } from '@/models/classic-sheets/hero-sheet';
import { PartyModal } from '@/components/modals/party/party-modal';
import { PerkList } from '@/enums/perk-list';
import { SkillList } from '@/enums/skill-list';
import { SkillsCard } from '@/components/panels/classic-sheet/skills-card/skills-card';
import { createElement } from 'react';
import { loadCatalog } from '@/l10n/catalog';
import { renderToStaticMarkup } from 'react-dom/server';
import { setLanguage } from '@/l10n/language';

let store: Record<string, string>;

beforeEach(() => {
	store = {};
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => (key in store ? store[key] : null),
		setItem: (key: string, value: string) => { store[key] = value; }
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

const party = () => {
	const sourcebook = FactoryLogic.createSourcebook();
	sourcebook.skills = [
		{ name: 'Climb', description: 'Climb things.', list: SkillList.Exploration },
		{ name: 'Alchemy', description: 'Alchemy things.', list: SkillList.Crafting },
		{ name: 'Home Brew', description: 'A custom skill.', list: SkillList.Custom }
	];
	const hero = FactoryLogic.createHero();
	hero.name = 'Ada';
	hero.features.push(FactoryLogic.feature.createSkillChoice({
		id: 'skills',
		selected: [ 'Climb', 'Alchemy', 'Home Brew' ]
	}));
	return renderToStaticMarkup(createElement(PartyModal, {
		heroes: [ hero ],
		sourcebooks: [ sourcebook ],
		onClose: () => undefined
	}));
};

const skillsCard = () => {
	const character = {
		allSkills: new Map<string, string[]>([
			[ 'Lore', [ 'Criminal Underworld', 'Home Brew' ] ],
			[ 'Crafting', [ 'Alchemy' ] ]
		]),
		skills: [ 'Criminal Underworld', 'Alchemy' ]
	} as HeroSheet;
	return renderToStaticMarkup(createElement(SkillsCard, { character }));
};

const skillChoice = () => {
	const feature = FactoryLogic.feature.createSkillChoice({
		id: 'lore-skill',
		listOptions: [ SkillList.Lore ],
		selected: [ 'Sneak', 'Home Brew' ]
	});
	return renderToStaticMarkup(createElement(FeatureComponent, { feature }));
};

const perkChoice = () => {
	const selected: FeatureText & { list: PerkList } = {
		id: 'alchemy-perk',
		name: 'Alchemy',
		description: '',
		type: FeatureType.Text,
		data: null,
		list: PerkList.Crafting
	};
	const feature: FeaturePerk = FactoryLogic.feature.createPerk({
		id: 'perk',
		lists: [ PerkList.Crafting ],
		selected: [ selected ]
	});
	return renderToStaticMarkup(createElement(FeatureComponent, { feature }));
};

describe('skill display batch', () => {
	beforeEach(async () => {
		await loadCatalog();
	});

	test('party modal row labels are Chinese and checks still use the English name', () => {
		const html = party();
		const alchemy = html.indexOf('鍊金');
		const climb = html.indexOf('攀爬');
		const custom = html.indexOf('Home Brew');

		expect(alchemy).toBeGreaterThan(-1);
		expect(climb).toBeGreaterThan(alchemy);
		expect(custom).toBeGreaterThan(climb);
		expect(html).toContain('check-icon success');
		expect(html).not.toContain('>Alchemy<');
		expect(html).not.toContain('>Climb<');

		setLanguage('en');
		const english = party();
		expect(english.indexOf('>Alchemy<')).toBeGreaterThan(-1);
		expect(english.indexOf('>Climb<')).toBeGreaterThan(english.indexOf('>Alchemy<'));
		expect(english).toContain('Home Brew');
		expect(english).toContain('check-icon success');
		expect(english).not.toContain('鍊金');
		expect(english).not.toContain('攀爬');
	});

	test('skills card shows Chinese names and keeps the English abbreviation', () => {
		const html = skillsCard();
		expect(html).toContain('學識類');
		expect(html).toContain('江湖');
		expect(html).toContain('Home Brew');
		expect(html).toContain('工藝類');
		expect(html).toContain('鍊金');
		expect(html).not.toContain('Criminal Und.');
		expect(html).not.toContain('Criminal Underworld');

		setLanguage('en');
		const english = skillsCard();
		expect(english).toContain('Lore');
		expect(english).toContain('Criminal Und.');
		expect(english).toContain('Home Brew');
		expect(english).toContain('Crafting');
		expect(english).toContain('Alchemy');
		expect(english).not.toContain('江湖');
		expect(english).not.toContain('學識類');
		expect(english).not.toContain('Criminal Underworld');
	});

	test('feature component translates skill choices and leaves perks unchanged', () => {
		const skills = skillChoice();
		expect(skills).toContain('Lore Skill');
		expect(skills).toContain('潛行');
		expect(skills).toContain('Home Brew');
		expect(skills).not.toContain('學識類');
		expect(skills).not.toContain('>Sneak<');

		const perks = perkChoice();
		expect(perks).toContain('Alchemy');
		expect(perks).not.toContain('鍊金');

		setLanguage('en');
		const englishSkills = skillChoice();
		expect(englishSkills).toContain('Lore Skill');
		expect(englishSkills).toContain('Sneak');
		expect(englishSkills).toContain('Home Brew');
		expect(englishSkills).not.toContain('潛行');

		const englishPerks = perkChoice();
		expect(englishPerks).toContain('Alchemy');
		expect(englishPerks).not.toContain('鍊金');
	});
});
