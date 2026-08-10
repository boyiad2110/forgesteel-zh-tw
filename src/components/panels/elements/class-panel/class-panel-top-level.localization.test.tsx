// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { ClassPanel } from '@/components/panels/elements/class-panel/class-panel';
import { ClassData } from '@/data/class-data';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { PanelMode } from '@/enums/panel-mode';
import { beastheart } from '@/data/classes/beastheart/beastheart';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// A Markdown control that shows the text it was handed verbatim, so these tests read the
// exact string the boundary produced rather than the HTML the markdown renderer would make.
vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text }: { text: string }) => <span>{text}</span>,
	MarkdownEditor: ({ value }: { value: string }) => <span>{value}</span>
}));

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions,
	useHeroes: () => []
}));

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

// Multi-paragraph descriptions carry blank-line breaks that the default text matcher would
// collapse away; an identity normalizer keeps the comparison exact, blank lines and all.
const exactText = (text: string) => screen.getByText(text, { exact: true, normalizer: t => t });
const queryExactText = (text: string) => screen.queryByText(text, { exact: true, normalizer: t => t });

describe('ClassPanel top-level localization — standard class (Censor)', () => {
	const censor = ClassData.censor;
	const approvedName = '懲戒者';
	const approvedDescription = '惡魔與亡靈畏懼你；罪犯見你蹤影就倉皇逃逸；混沌爪牙、瀆神者和異端者聽到你的聲音便不寒而慄。你身負眾神之力，手持神聖怒火，奉命周遊世界，尋找並懲罰那些被教會視為禁忌的邪惡之徒。\n\n身為懲戒者，你面對強敵時能夠大顯神威。你的審判令敵人膽戰心驚、裹足不前，甚至能將他們拋飛至戰場的另一端。';
	const canonicalName = 'Censor';
	const canonicalDescription = censor.description;

	const renderPanel = (mode: PanelMode) => render(
		<LocalizationProvider>
			<LocaleToggle />
			<ClassPanel heroClass={censor} sourcebooks={[]} mode={mode} />
		</LocalizationProvider>
	);

	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('shows the approved zh-TW name and description in %s mode, and canonical English after switching locale', (_label, mode) => {
		const serialized = JSON.stringify(censor);

		renderPanel(mode);

		expect(exactText(approvedName)).toBeTruthy();
		expect(exactText(approvedDescription)).toBeTruthy();
		expect(queryExactText(canonicalName)).toBeNull();
		expect(queryExactText(canonicalDescription)).toBeNull();

		switchLocale();

		expect(exactText(canonicalName)).toBeTruthy();
		expect(exactText(canonicalDescription)).toBeTruthy();
		expect(queryExactText(approvedName)).toBeNull();
		expect(queryExactText(approvedDescription)).toBeNull();

		// The canonical class object is never mutated by either reading of it.
		expect(JSON.stringify(censor)).toBe(serialized);
	});

	it('switches back and forth between zh-TW and English without drift', () => {
		renderPanel(PanelMode.Full);

		expect(exactText(approvedName)).toBeTruthy();

		switchLocale();
		expect(exactText(canonicalName)).toBeTruthy();

		switchLocale();
		expect(exactText(approvedName)).toBeTruthy();
		expect(exactText(approvedDescription)).toBeTruthy();
	});
});

describe('ClassPanel top-level localization — Master Class (Beastheart)', () => {
	const approvedName = '獸魂者';
	const approvedDescription = '獸魂者從不獨自作戰！你的身旁永遠伴隨著一頭兇猛野獸。牠不是受過訓練的普通寵物，而是狼、蜥怪，甚至幼龍之類的野獸。你與夥伴之間存在著某種原始野性的連結，牠尊重你的意願，你也會受到牠本能的引導，但要小心！隨著戰鬥愈演愈烈，你的夥伴可能會陷入血腥狂暴，不分敵我地發動攻擊。\n\n身為獸魂者，你與野獸夥伴一同面對世界的危險。憑藉彼此的連攜力量，你可以殺入敵陣挑戰強者，也可以在戰場外圍伺機而動，逐一獵殺脆弱的敵人。';
	const canonicalName = 'Beastheart';
	const canonicalDescription = beastheart.description;

	const renderPanel = (mode: PanelMode) => render(
		<LocalizationProvider>
			<LocaleToggle />
			<ClassPanel heroClass={beastheart} sourcebooks={[]} mode={mode} />
		</LocalizationProvider>
	);

	it('shows the approved zh-TW name and description, and falls back to canonical English in the en locale', () => {
		expect(beastheart.id).toBe('class-beastheart');
		const serialized = JSON.stringify(beastheart);

		renderPanel(PanelMode.Full);

		expect(exactText(approvedName)).toBeTruthy();
		expect(exactText(approvedDescription)).toBeTruthy();

		switchLocale();

		expect(exactText(canonicalName)).toBeTruthy();
		expect(exactText(canonicalDescription)).toBeTruthy();
		expect(queryExactText(approvedDescription)).toBeNull();

		expect(JSON.stringify(beastheart)).toBe(serialized);
	});
});
