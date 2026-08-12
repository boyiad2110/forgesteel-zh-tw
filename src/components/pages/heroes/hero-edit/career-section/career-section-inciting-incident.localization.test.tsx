// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { CareerSection } from '@/components/pages/heroes/hero-edit/career-section/career-section';
import { CareerData } from '@/data/career-data';
import { Element } from '@/models/element';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Hero } from '@/models/hero';
import { Options } from '@/models/options';
import { Utils } from '@/utils/utils';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// A Markdown control that shows the text it was handed verbatim, so these tests read the
// exact string the boundary produced rather than the HTML the markdown renderer would make.
vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text }: { text: string }) => <span>{text}</span>,
	MarkdownEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
		<textarea aria-label='markdown-editor' value={value} onChange={e => onChange(e.target.value)} />
	)
}));

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions,
	useHeroes: () => []
}));

// useIsSmall needs matchMedia; jsdom provides neither, and it carries no localization behavior.
window.matchMedia = (query: string) => ({
	media: query,
	matches: false,
	onchange: null,
	addListener: () => undefined,
	removeListener: () => undefined,
	addEventListener: () => undefined,
	removeEventListener: () => undefined,
	dispatchEvent: () => false
});

class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

// A real production Career (Agent), taken directly from CareerData so the identity the
// resolver sees is the one the app actually renders. Copied per test so no test mutates the
// shared production object.
const buildHero = (selected: Element | null): Hero => {
	const hero = FactoryLogic.createHero();
	const career = Utils.copy(CareerData.agent);
	career.incitingIncidents.selected = selected;
	hero.career = career;
	return hero;
};

const renderSection = (hero: Hero, selectIncitingIncident = vi.fn()) => {
	const { container } = render(
		<LocalizationProvider>
			<LocaleToggle />
			<CareerSection
				hero={hero}
				sourcebooks={[]}
				searchTerm=''
				selectCareer={vi.fn()}
				selectIncitingIncident={selectIncitingIncident}
				setFeatureData={vi.fn()}
			/>
		</LocalizationProvider>
	);
	return container;
};

const getFieldLabels = (container: HTMLElement) => Array.from(container.querySelectorAll('.field-label')).map(node => node.textContent);
const getFieldValues = (container: HTMLElement) => Array.from(container.querySelectorAll('.field-value')).map(node => node.textContent);

// career-agent-ii-1, "Disavowed" / approved "被迫除名".
const approvedName = '被迫除名';
const approvedDescription = '在一次危險的間諜任務中，事情出了差錯。你雖然保住了性命，但機構為了顧全大局，否認你曾為他們工作，迫使你開始逃亡。成為英雄不僅能讓你維持生計，還能幫你洗清名譽。';

describe('CareerSection selected Inciting Incident summary localization', () => {
	it('shows the approved zh-TW name and description for a real official Incident', () => {
		const hero = buildHero(Utils.copy(CareerData.agent.incitingIncidents.options[0]));
		const container = renderSection(hero);

		expect(getFieldLabels(container)).toContain(approvedName);
		expect(getFieldValues(container)).toContain(approvedDescription);
	});

	it('shows canonical English after switching locale, then restores zh-TW without drift, without mutating the canonical selected Element', () => {
		const selected = Utils.copy(CareerData.agent.incitingIncidents.options[0]);
		const serializedSelected = JSON.stringify(selected);
		const hero = buildHero(selected);
		const container = renderSection(hero);

		switchLocale();
		expect(getFieldLabels(container)).toContain('Disavowed');
		expect(getFieldValues(container)).toContain(selected.description);
		expect(getFieldLabels(container)).not.toContain(approvedName);

		switchLocale();
		expect(getFieldLabels(container)).toContain(approvedName);
		expect(getFieldValues(container)).toContain(approvedDescription);

		// Neither locale, nor switching between them, ever wrote back to the canonical selected
		// Element held on the hero's career state.
		expect(JSON.stringify(hero.career!.incitingIncidents.selected)).toBe(serializedSelected);
		expect(JSON.stringify(CareerData.agent.incitingIncidents.options[0])).not.toBe('undefined');
	});

	it('calls selectIncitingIncident(null) when the selected Incident is removed', () => {
		const hero = buildHero(Utils.copy(CareerData.agent.incitingIncidents.options[0]));
		const selectIncitingIncident = vi.fn();
		renderSection(hero, selectIncitingIncident);

		// Other Career Feature choices (e.g. the fixed Skill choice) also render a '移除'
		// button; scope to the SelectionBox that shows the Inciting Incident summary.
		const incidentBox = screen.getByText(approvedName).closest('.selection-box') as HTMLElement;
		fireEvent.click(within(incidentBox).getByTitle('移除'));

		expect(selectIncitingIncident).toHaveBeenCalledTimes(1);
		expect(selectIncitingIncident).toHaveBeenCalledWith(null);
	});
});

describe('CareerSection Inciting Incident selection drawer localization', () => {
	const openDrawer = (container: HTMLElement) => {
		fireEvent.click(screen.getByText('選擇 1 個關鍵事件'));
		return container;
	};

	it('shows the approved zh-TW name and description for every official Incident in the list', () => {
		const hero = buildHero(null);
		renderSection(hero);
		openDrawer(document.body as unknown as HTMLElement);

		CareerData.agent.incitingIncidents.options.forEach(option => {
			const approved = approvedIncidentText[option.id];
			expect(screen.getByText(approved.name, { exact: true })).toBeTruthy();
			expect(screen.getByText(approved.description, { exact: true })).toBeTruthy();
		});
	});

	it('finds an Incident via a zh-TW search term that only matches the localized text, not the canonical English', async () => {
		const hero = buildHero(null);
		renderSection(hero);
		openDrawer(document.body as unknown as HTMLElement);

		// '被迫除名' (Disavowed's approved name) has no equivalent substring in the canonical
		// English, so a hit here proves the search ran against localized display text.
		const searchBox = screen.getByPlaceholderText('搜尋') as HTMLInputElement;
		fireEvent.change(searchBox, { target: { value: '被迫除名' } });

		await waitFor(() => expect(screen.queryByText('揭露身分', { exact: true })).toBeNull());
		expect(screen.getByText('被迫除名', { exact: true })).toBeTruthy();
	});

	it('hands back the canonical Element (English name/description, original ID) on select, never a localized clone', () => {
		const hero = buildHero(null);
		const selectIncitingIncident = vi.fn();
		renderSection(hero, selectIncitingIncident);
		openDrawer(document.body as unknown as HTMLElement);

		fireEvent.click(screen.getByText('被迫除名', { exact: true }));

		expect(selectIncitingIncident).toHaveBeenCalledTimes(1);
		const selected = selectIncitingIncident.mock.calls[0][0] as Element;
		expect(selected.id).toBe('career-agent-ii-1');
		expect(selected.name).toBe('Disavowed');
		expect(selected.description).toBe(CareerData.agent.incitingIncidents.options[0].description);
	});

	it('shows canonical English list text after switching locale while the drawer is open', () => {
		const hero = buildHero(null);
		renderSection(hero);
		openDrawer(document.body as unknown as HTMLElement);

		expect(screen.getByText('被迫除名', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Disavowed', { exact: true })).toBeTruthy();
		expect(screen.queryByText('被迫除名', { exact: true })).toBeNull();
	});

	it('never mutates canonical Career data (src/data/careers) when opening the drawer or selecting an Incident', () => {
		const serializedAgent = JSON.stringify(CareerData.agent);
		const hero = buildHero(null);
		const selectIncitingIncident = vi.fn();
		renderSection(hero, selectIncitingIncident);
		openDrawer(document.body as unknown as HTMLElement);
		fireEvent.click(screen.getByText('被迫除名', { exact: true }));

		expect(JSON.stringify(CareerData.agent)).toBe(serializedAgent);
	});
});

describe('CareerSection custom Inciting Incident safety', () => {
	it('keeps player-entered name and description untouched by the official localization resolver', async () => {
		const hero = buildHero(null);
		const selectIncitingIncident = vi.fn();
		renderSection(hero, selectIncitingIncident);
		fireEvent.click(screen.getByText('選擇 1 個關鍵事件'));

		fireEvent.click(screen.getByText('Add a custom element'));

		fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: '被迫除名' } });
		fireEvent.change(screen.getByLabelText('markdown-editor'), { target: { value: 'A player-authored custom incident, not an official one.' } });

		await waitFor(() => expect((screen.getByText('Select').closest('button') as HTMLButtonElement).disabled).toBe(false));
		fireEvent.click(screen.getByText('Select'));

		expect(selectIncitingIncident).toHaveBeenCalledTimes(1);
		const selected = selectIncitingIncident.mock.calls[0][0] as Element;
		expect(selected.name).toBe('被迫除名');
		expect(selected.description).toBe('A player-authored custom incident, not an official one.');
		// A custom incident's ID is a fresh GUID, never a known official Incident ID.
		expect(CareerData.agent.incitingIncidents.options.map(o => o.id)).not.toContain(selected.id);
	});
});

// The six Agent Inciting Incidents' approved zh-TW readings, used to assert the drawer list.
const approvedIncidentText: Record<string, { name: string; description: string }> = {
	'career-agent-ii-1': { name: '被迫除名', description: approvedDescription },
	'career-agent-ii-2': { name: '揭露身分', description: '監視大人物的工作充滿危險，你始終隱藏自己的身分，這是你保護親朋好友的方式，但一名敵方特務揭穿了你的身分，你的世界就此崩塌，你的隱私、生計、摯愛，一瞬間全都消失了。面對這樣的打擊，你沒有選擇躲藏，而是以公開身分成為英雄，以逝者之名保護無辜者。' },
	'career-agent-ii-3': { name: '自由特務', description: '你曾經將情報賣給出價最高的買家。你不隸屬於任何組織，但能憑藉廣闊的人脈進行情報交易。你一向不太在意政治，直到你販賣的情報引發了連鎖反應，最終摧毀你視為家園的地方。你成為英雄，就是為了彌補過去的錯誤。' },
	'career-agent-ii-4': { name: '線人情報', description: '在多年培養大量的線人名單後，其中一位冒著生命危險揭露了權貴的邪惡計畫。你承諾保護這位線人，但你的機構卻背棄了他（確切地說，是任由他被處決）。你因此與雇主徹底斷絕關係，並立誓成為一名英雄，永遠信守自己的承諾。' },
	'career-agent-ii-5': { name: '間諜與情人', description: '在執行臥底任務時，你愛上了敵方陣營的某人。當他發現你是雙重間諜時，即使你真誠地表明自己的真實感情，但這種欺騙行為對你的愛人來說傷害太深，無法被原諒。他可能因此揭發了你的身分、拒絕你的愛，或因為你的關係而喪命。這段經歷讓你決定離開間諜事業，轉而成為一名不再需要隱藏真實自我的英雄。' },
	'career-agent-ii-6': { name: '叛變', description: '你畢生都為祖國或與你價值觀相符的組織服務。在執行臥底任務期間，你發現你所知的一切都是謊言。無論你是質問上級，還是身分曝光，在你離開並成為真正的英雄之前，你的功勳獎章全都被剝奪了。' }
};
