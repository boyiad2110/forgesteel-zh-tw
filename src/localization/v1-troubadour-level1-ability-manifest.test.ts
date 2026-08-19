// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1TroubadourLevel1AbilityRequiredCanonicalEnglish,
	getV1TroubadourLevel1Abilities,
	v1LocalizationManifest,
	v1TroubadourLevel1AbilityIDs
} from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { troubadour } from '@/data/classes/troubadour/troubadour';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureField } from '@/enums/feature-field';
import { PanelMode } from '@/enums/panel-mode';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, ReactNode } from 'react';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const chinese = /[一-鿿]/;

const required = createV1TroubadourLevel1AbilityRequiredCanonicalEnglish();
// Identity-precise (matching this slice's own required identities), not a raw elementID
// prefix match: the Troubadour Level 1 completion batch also owns many 'troubadour-'-prefixed
// identities, including every Class Act one, and a loose prefix filter would sweep those into
// this ability-only slice too.
const troubadourCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const getAbility = (id: typeof v1TroubadourLevel1AbilityIDs[number]) => {
	const ability = getV1TroubadourLevel1Abilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Troubadour ability '${id}' is missing`);
	}
	return ability;
};

// Presence 3 drives Troubadour's authored damage, potencies and the Revitalizing Limerick
// count; Agility 2 drives Method Acting and the Upstage potency; Intuition 1 drives Hypnotic
// Overtones. The Speed bonus makes the acting Hero's own Speed (7) unmistakable in Upstage.
const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(0, 2, 0, 1, 3);
	hero.class.featuresByLevel[0].features.push(FactoryLogic.feature.createBonus({
		id: 'troubadour-production-speed-bonus',
		field: FeatureField.Speed,
		value: 2
	}));
	return hero;
};

const renderAbility = (id: typeof v1TroubadourLevel1AbilityIDs[number], hero?: ReturnType<typeof makeHero>) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(AbilityPanel, { ability: getAbility(id), hero: hero, mode: PanelMode.Full })
	)
);

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent?.trim() || '');

const tierReading = (id: typeof v1TroubadourLevel1AbilityIDs[number], field: string, tier: number, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, getAbility(id), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const textReading = (id: typeof v1TroubadourLevel1AbilityIDs[number], field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Troubadour Level 1 ability manifest', () => {
	it('enumerates exactly the approved live Troubadour slice and its 89 catalog identities', () => {
		expect(getV1TroubadourLevel1Abilities().map(ability => ability.id)).toEqual([ ...v1TroubadourLevel1AbilityIDs ]);
		expect(v1TroubadourLevel1AbilityIDs).toHaveLength(14);
		expect(Object.keys(required)).toHaveLength(89);
		expect(troubadourCatalogEntries).toHaveLength(89);

		const catalogIdentities = troubadourCatalogEntries.map(getEntryIdentity);
		expect(new Set(catalogIdentities).size).toBe(89);
		expect(catalogIdentities.slice().sort()).toEqual(Object.keys(required).sort());
		expect(troubadourCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(troubadourCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
	});

	it('reaches both Performance abilities directly and stops before ability 67', () => {
		const sliceIDs = [ ...v1TroubadourLevel1AbilityIDs ] as string[];

		// troubadour-10/11 are direct Level 1 feature abilities, not class abilities.
		expect(troubadour.abilities.some(ability => (ability.id === 'troubadour-10') || (ability.id === 'troubadour-11'))).toBe(false);
		expect(getAbility('troubadour-10').name).toBe('Choreography');
		expect(getAbility('troubadour-11').name).toBe('Revitalizing Limerick');
		// Level 1 selects signature, cost 3 and cost 5 abilities only.
		expect(getAbility('troubadour-66').cost).toBe(5);
		expect(sliceIDs).not.toContain('troubadour-67');
		expect(Object.keys(required).some(identity => /^element:troubadour-(6[7-9]|7\d|8\d)\//.test(identity))).toBe(false);
		expect(getV1TroubadourLevel1Abilities().some(ability => /^troubadour-(6[7-9]|7\d|8\d)$/.test(ability.id))).toBe(false);
		// Level 2+ and the three Class Act subclasses stay unresolved.
		expect(troubadour.featuresByLevel.length).toBeGreaterThan(1);
		expect(troubadour.subclasses.map(subclass => subclass.id)).toEqual([ 'troubadour-auteur', 'troubadour-duelist', 'troubadour-virtuoso' ]);
		expect(troubadourCatalogEntries.every(entry => sliceIDs.includes(entry.elementID))).toBe(true);
	});

	it('records exactly the approved Troubadour glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^(Performance|Drama),/.test(row))).toEqual([
			'Performance,表演,game-term,approved',
			'Drama,張力,game-term,approved'
		]);
	});

	it('keeps the parent authored-content domain unresolved and reports no new completeness issue', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.complete).toBe(false);
	});

	it('reproduces the Owner-approved readings exactly and keeps every characteristic backticked', () => {
		const entry = (id: string, field: string) => {
			const found = troubadourCatalogEntries.find(candidate => (candidate.elementID === id) && (candidate.field === field));
			if (!found) {
				throw new Error(`Troubadour entry '${id}/${field}' is missing`);
			}
			return found;
		};

		// The Owner's exact Revitalizing Limerick reading; 最多 restores canonical 'up to'.
		expect(entry('troubadour-11', 'sections.0.text').zhTW).toBe('在此表演生效期間，每當你的回合結束時，你可以選擇最多等於你`氣場`數量的目標。每個被選中的目標都可以花費 1 點復元力。');
		// The full Owner-finalized Fake Your Death reading, restored in packet r2.
		expect(entry('troubadour-64', 'sections.0.text').zhTW).toBe('你變成隱形，並在你的位置創造 1 個倒地的屍體幻象。在你隱形期間，你的速度 +3，而且無視困難地形。幻象和隱形效果會持續到你下個回合結束，或直到有人與幻象互動、你受到傷害，或你使用主要動作或機動動作為止。');
		// The two reusable Owner anchors.
		expect(entry('troubadour-10', 'sections.0.text').zhTW).toContain('表演');
		expect(entry('troubadour-55', 'sections.2.effect').zhTW).toBe('每花費 2 點張力，你可以額外指定 1 個生物或物體作為目標。');
		expect(entry('troubadour-60', 'sections.1.effect').zhTW).toBe('每花費 2 點張力，爆發區域 +1');
		// Flip the Script deliberately names 緩速 once and refers back to it as 該狀態.
		expect(entry('troubadour-65', 'sections.0.text').zhTW).toBe('每個目標可以傳送最多 5 格。被傳送的目標若原本處於緩速狀態，則會解除該狀態。');

		// The whitespace-sensitive canonical snapshots survive the catalog round trip byte for byte.
		expect(entry('troubadour-10', 'sections.0.text').canonicalEnglish.endsWith('until the end of their turn. ')).toBe(true);
		expect(entry('troubadour-59', 'sections.1.text').canonicalEnglish.endsWith('work as usual. ')).toBe(true);
		expect(entry('troubadour-64', 'sections.0.text').canonicalEnglish.startsWith(' You turn invisible')).toBe(true);
		// No approved value carries a synthetic truncation ellipsis.
		expect(troubadourCatalogEntries.some(candidate => candidate.canonicalEnglish.endsWith('...') || candidate.zhTW.endsWith('...'))).toBe(false);

		// Every Chinese characteristic reference keeps its Markdown backticks.
		const characteristics = [ '氣場', '敏捷', '直覺', '理智', '力量' ];
		troubadourCatalogEntries.forEach(candidate => {
			characteristics.forEach(characteristic => {
				let index = candidate.zhTW.indexOf(characteristic);
				while (index >= 0) {
					expect((candidate.zhTW[index - 1] === '`') && (candidate.zhTW[index + characteristic.length] === '`'), `${getEntryIdentity(candidate)} / ${characteristic}`).toBe(true);
					index = candidate.zhTW.indexOf(characteristic, index + 1);
				}
			});
		});
	});

	it('keeps the approved raw zh-TW reading on the Library / no-Hero path for every grammar family', () => {
		// Family A: compact damage / potency / condition, including Cutting Sarcasm's authored
		// space before the potency comma, which must not force an English fallback.
		expect(required[elementFieldIdentity('troubadour-56', 'sections.0.roll.tier1')]).toBe('2 + P psychic damage; P < [weak] , bleeding (save ends)');
		expect(tierReading('troubadour-56', 'sections.0.roll.tier1', 1)).toBe('2 + `氣場`心靈傷害；`氣場` < [弱]，**出血**（豁免解除）');
		expect(tierReading('troubadour-55', 'sections.0.roll.tier1', 1)).toBe('2傷害');
		expect(tierReading('troubadour-57', 'sections.0.roll.tier1', 1)).toBe('3 + `氣場`傷害');
		expect(tierReading('troubadour-59', 'sections.0.roll.tier1', 1)).toBe('7 + `氣場`音波傷害');
		expect(tierReading('troubadour-60', 'sections.0.roll.tier1', 1)).toBe('滑動 1；`直覺` < [弱]，**暈眩**（豁免解除）');
		expect(tierReading('troubadour-61', 'sections.0.roll.tier1', 1)).toBe('4 傷害；`氣場` < [弱]，**緩速**（豁免解除）');
		expect(tierReading('troubadour-61', 'sections.0.roll.tier3', 3)).toBe('6 傷害；`氣場` < [強]，**束縛**（豁免解除）');
		expect(tierReading('troubadour-62', 'sections.1.roll.tier1', 1)).toBe('**嘲諷**（EoT）；`敏捷` < [弱]，**伏地**');
		expect(tierReading('troubadour-62', 'sections.1.roll.tier3', 3)).toBe('**嘲諷**（EoT）；`敏捷` < [強]，**伏地**且無法起身（EoT）');
		expect(tierReading('troubadour-66', 'sections.0.roll.tier1', 1)).toBe('6 + `敏捷`傷害；`氣場` < [弱]，**虛弱**（豁免解除）');
		// Family B / C keep the approved unresolved characteristic wording.
		expect(textReading('troubadour-11', 'sections.0.text')).toBe('在此表演生效期間，每當你的回合結束時，你可以選擇最多等於你`氣場`數量的目標。每個被選中的目標都可以花費 1 點復元力。');
		expect(textReading('troubadour-62', 'sections.0.text')).toBe('你遁移最多等於你速度的距離。你進行 1 次檢定，目標為你在遁移過程中相鄰過的每個敵人。');
		// Family D emphasizes the single named 緩速 and keeps the 該狀態 back reference.
		expect(textReading('troubadour-65', 'sections.0.text')).toBe('每個目標可以傳送最多 5 格。被傳送的目標若原本處於**緩速**狀態，則會解除該狀態。');
		// Family E: condition-only authored prose through the shared projector.
		expect(textReading('troubadour-57', 'sections.1.text')).toBe('目標被你或與你相鄰的 1 個自願盟友**嘲諷**，直到目標下個回合結束。');
		expect(textReading('troubadour-66', 'sections.1.text')).toBe('你可以自願陷入**出血**狀態（豁免解除），然後對目標額外造成 5 點腐朽傷害。');
		// Family F: authored Power Roll prose the calculator does not rewrite.
		expect(tierReading('troubadour-63', 'sections.0.roll.tier1', 1)).toBe('目標可以遁移 1 格，並發動 1 次基礎打擊。');
		expect(tierReading('troubadour-63', 'sections.0.roll.tier3', 3)).toBe('目標可以遁移最多 3 格，並發動 1 次帶有 1 個優勢的基礎打擊，然後可以花費 1 點復元力。');
	});

	it('renders the unresolved characteristic reading as Markdown inline code without a Hero', () => {
		const { container } = renderAbility('troubadour-11');

		expect(Array.from(container.querySelectorAll('code')).map(node => node.textContent)).toEqual([ '氣場' ]);
		expect(container.textContent).toContain('你可以選擇最多等於你氣場數量的目標。');
		expect(container.textContent).not.toContain('`');
		expect(container.textContent).not.toContain('Presence score');
	});

	it('calculates canonical English first and projects the resolved Troubadour values into zh-TW', () => {
		const hero = makeHero();
		const ability = getAbility('troubadour-62');
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		// Family A resolves through the existing generic Power Roll presenter.
		expect(tierReading('troubadour-56', 'sections.0.roll.tier1', 1, hero)).toBe('5 心靈傷害；`氣場` < 1，**出血**（豁免解除）');
		expect(tierReading('troubadour-56', 'sections.0.roll.tier3', 3, hero)).toBe('10 心靈傷害；`氣場` < 3，**出血**（豁免解除）');
		expect(tierReading('troubadour-57', 'sections.0.roll.tier1', 1, hero)).toBe('6 傷害');
		expect(tierReading('troubadour-58', 'sections.0.roll.tier1', 1, hero)).toBe('7 心靈傷害');
		expect(tierReading('troubadour-60', 'sections.0.roll.tier1', 1, hero)).toBe('滑動 1；`直覺` < 1，**暈眩**（豁免解除）');
		expect(tierReading('troubadour-60', 'sections.0.roll.tier3', 3, hero)).toBe('滑動 2；`直覺` < 3，**暈眩**（豁免解除）');
		expect(tierReading('troubadour-61', 'sections.0.roll.tier1', 1, hero)).toBe('4 傷害；`氣場` < 1，**緩速**（豁免解除）');
		expect(tierReading('troubadour-61', 'sections.0.roll.tier3', 3, hero)).toBe('6 傷害；`氣場` < 3，**束縛**（豁免解除）');
		expect(tierReading('troubadour-62', 'sections.1.roll.tier3', 3, hero)).toBe('**嘲諷**（EoT）；`敏捷` < 3，**伏地**且無法起身（EoT）');
		expect(tierReading('troubadour-66', 'sections.0.roll.tier1', 1, hero)).toBe('8 傷害；`氣場` < 1，**虛弱**（豁免解除）');
		// Family B: the calculator resolves the Presence count; 最多 is preserved.
		const limerick = textReading('troubadour-11', 'sections.0.text', hero);
		expect(limerick).toBe('在此表演生效期間，每當你的回合結束時，你可以選擇最多 3 個目標。每個被選中的目標都可以花費 1 點復元力。');
		expect(limerick).toContain('最多');
		expect(limerick).not.toContain('氣場');
		// Family C: the calculator resolves this Hero's Speed of 7, not the authored wording.
		const upstage = textReading('troubadour-62', 'sections.0.text', hero);
		expect(upstage).toBe('你遁移最多 7 格。你進行 1 次檢定，目標為你在遁移過程中相鄰過的每個敵人。');
		expect(upstage).not.toContain('等於你速度');
		// Family D is unchanged by a Hero and never falls back to English.
		expect(textReading('troubadour-65', 'sections.0.text', hero)).toBe('每個目標可以傳送最多 5 格。被傳送的目標若原本處於**緩速**狀態，則會解除該狀態。');
		// Family F stays exactly the approved authored sentence.
		expect(tierReading('troubadour-63', 'sections.0.roll.tier1', 1, hero)).toBe('目標可以遁移 1 格，並發動 1 次基礎打擊。');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		expect(getTextEffect.mock.calls.map(([ input ]) => input).some(input => input.includes('equal to your Presence score'))).toBe(true);
		expect(getTierEffectCreature.mock.calls.map(([ input ]) => input)).toContain('2 + P psychic damage; P < [weak] , bleeding (save ends)');
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders the Hero-calculated Troubadour readings through AbilityPanel and restores canonical English', () => {
		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const limerick = renderAbility('troubadour-11', hero);
		expect(limerick.container.textContent).toContain('你可以選擇最多 3 個目標。');
		expect(limerick.container.textContent).not.toContain('Presence score');

		fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));
		expect(limerick.container.textContent).toContain('you can choose up to a number of targets equal to 3.');
		expect(limerick.container.textContent).not.toMatch(chinese);
		limerick.unmount();

		const quickRewrite = renderAbility('troubadour-61', hero);
		expect(tierTexts(quickRewrite.container)).toEqual([
			'4 傷害；氣場 < 1，緩速（豁免解除）',
			'5 傷害；氣場 < 2，緩速（豁免解除）',
			'6 傷害；氣場 < 3，束縛（豁免解除）'
		]);
		expect(Array.from(quickRewrite.container.querySelectorAll('.power-roll-row .effect strong')).map(node => node.textContent)).toEqual([ '緩速', '緩速', '束縛' ]);
		expect(quickRewrite.container.textContent).not.toContain('restrained');
		quickRewrite.unmount();

		const hypnotic = renderAbility('troubadour-60', hero);
		expect(tierTexts(hypnotic.container)).toEqual([
			'滑動 1；直覺 < 1，暈眩（豁免解除）',
			'滑動 1；直覺 < 2，暈眩（豁免解除）',
			'滑動 2；直覺 < 3，暈眩（豁免解除）'
		]);
		expect(Array.from(hypnotic.container.querySelectorAll('.power-roll-row .effect strong')).map(node => node.textContent)).toEqual([ '暈眩', '暈眩', '暈眩' ]);
		hypnotic.unmount();

		const upstage = renderAbility('troubadour-62', hero);
		expect(upstage.container.textContent).toContain('你遁移最多 7 格。');
		expect(upstage.container.textContent).toContain('嘲諷（EoT）');
		expect(upstage.container.textContent).not.toContain('your speed');
		upstage.unmount();

		const flipTheScript = renderAbility('troubadour-65', hero);
		expect(flipTheScript.container.textContent).toContain('被傳送的目標若原本處於緩速狀態，則會解除該狀態。');
		expect(Array.from(flipTheScript.container.querySelectorAll('strong')).map(node => node.textContent)).toContain('緩速');
		expect(flipTheScript.container.textContent).not.toContain('slowed');
		flipTheScript.unmount();

		const methodActing = renderAbility('troubadour-66', hero);
		expect(methodActing.container.textContent).toContain('你可以自願陷入出血狀態（豁免解除），然後對目標額外造成 5 點腐朽傷害。');
		expect(Array.from(methodActing.container.querySelectorAll('strong')).map(node => node.textContent)).toContain('出血');
		methodActing.unmount();

		const dramaticReversal = renderAbility('troubadour-63', hero);
		expect(tierTexts(dramaticReversal.container)[0]).toBe('目標可以遁移 1 格，並發動 1 次基礎打擊。');
		expect(dramaticReversal.container.textContent).not.toContain('free strike');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('falls back to the whole calculated English result rather than a mixed partial reading', () => {
		const canonicalEnglish = required[elementFieldIdentity('troubadour-62', 'sections.0.text')];
		// A structural rewrite this batch does not authorize.
		const unsupported = canonicalEnglish.replace('You shift up to your speed.', 'You teleport up to 7 squares.');

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'troubadour-62',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupported
		})).toBe(unsupported);

		// The same projection is refused for an identity it was not approved against.
		const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, makeHero());
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'troubadour-65',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		})).toBe(calculatedEnglish);

		// Flip the Script's asymmetric projection refuses a reading whose emphasis structure
		// is not exactly the canonical text with both occurrences emphasized.
		const flipCanonical = required[elementFieldIdentity('troubadour-65', 'sections.0.text')];
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'troubadour-65',
			field: 'sections.0.text',
			canonicalEnglish: flipCanonical,
			calculatedEnglish: flipCanonical.replace('is no longer slowed', 'is no longer **slowed**')
		})).toBe(flipCanonical.replace('is no longer slowed', 'is no longer **slowed**'));

		// English keeps the canonical calculated reading.
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'en',
			elementID: 'troubadour-62',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		})).toBe(calculatedEnglish);
	});
});
