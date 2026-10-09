/** Isolated browser regression. No screenshots, video, user profile, or external writes. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { buildSeedState, writeSeedState } from '../screenshots/seed.mjs';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
let browser;
try {
	await server.listen();
	const origin = server.resolvedUrls.local[0];
	browser = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge' } : {});
	const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
	const page = await context.newPage();
	page.setDefaultTimeout(30000);
	const errors = [];
	page.on('pageerror', error => errors.push(error.message));
	await page.goto(origin);
	const state = await buildSeedState(page);
	state.storage['forgesteel-heroes'].find(hero => hero.id === state.heroes.fury.id).ancestry = null;
	await writeSeedState(page, state.storage);
	await page.reload();
	await page.locator('.app-footer').waitFor();
	await page.goto(`${origin}#/hero/edit/${state.heroes.fury.id}/ancestry`);
	const translatedOrc = await page.evaluate(async () => {
		const { default: strings } = await import('/src/l10n/generated/zh-TW/strings.json');
		return strings['heroes.ancestries.orc.name'].fs?.zh ?? strings['heroes.ancestries.orc.name'].zh;
	});
	await page.locator('#ancestry-list .selectable-panel').filter({ has: page.getByText(translatedOrc, { exact: true }) }).click();
	await page.locator('#ancestry-selected').getByText(translatedOrc, { exact: true }).waitFor();
	await page.getByRole('button', { name: /Save Changes/ }).click();
	await page.waitForURL('**/hero/view/**');
	await page.getByText(translatedOrc, { exact: true }).first().waitFor();
	await page.locator('.app-footer').getByRole('button', { name: '中文', exact: true }).click();
	await page.getByText('Orc', { exact: true }).first().waitFor();
	await page.locator('.app-footer').getByRole('button', { name: 'EN', exact: true }).click();
	await page.getByText(translatedOrc, { exact: true }).first().waitFor();
	console.log('PASS browser: ancestry candidate, selected value, saved overview, language switch');

	await page.goto(`${origin}#/hero/sheet/${state.heroes.fury.id}`);
	await page.locator('.hero-header.card').getByText(translatedOrc, { exact: true }).waitFor();
	await page.emulateMedia({ media: 'print' });
	await page.evaluate(() => document.fonts.ready);
	const overflow = await page.locator('.hero-header.card').evaluate(card => card.scrollWidth > card.clientWidth + 2);
	assert.equal(overflow, false, 'Printed hero header overflows horizontally');
	console.log('PASS browser: classic sheet approved name, print media and header horizontal overflow');

	// Render the actual shared ability component in a separate page to vary a
	// hero's upstream calculation without changing any stored hero or app data.
	const abilityPage = await context.newPage();
	abilityPage.on('pageerror', error => errors.push(error.message));
	await abilityPage.goto(origin);
	const expected = await abilityPage.evaluate(async () => {
		const reactModule = await import('/node_modules/.vite/deps/react.js');
		const React = reactModule.default ?? reactModule;
		const reactDom = await import('/node_modules/.vite/deps/react-dom_client.js');
		const createRoot = reactDom.createRoot ?? reactDom.default.createRoot;
		const { AbilityPanel } = await import('/src/components/panels/elements/ability-panel/ability-panel.tsx');
		const { AbilityData } = await import('/src/data/ability-data.ts');
		const { FactoryLogic } = await import('/src/logic/factory-logic.ts');
		const { OptionsContext } = await import('/src/contexts/data-context.tsx');
		const { PanelMode } = await import('/src/enums/panel-mode.ts');
		const { loadCatalog } = await import('/src/l10n/catalog.ts');
		const { setLanguage } = await import('/src/l10n/language.ts');
		const { default: strings } = await import('/src/l10n/generated/zh-TW/strings.json');
		const { default: bindings } = await import('/src/l10n/calculation-bindings.json');
		await loadCatalog();
		setLanguage('zh-TW');
		const host = document.createElement('section');
		host.id = 'l10n-regression';
		document.body.append(host);
		const root = createRoot(host);
		window.renderRegression = might => {
			const hero = FactoryLogic.createHero();
			hero.class = FactoryLogic.createClass();
			hero.class.characteristics = FactoryLogic.createCharacteristics(might, 0, 0, 0, 0);
			root.render(React.createElement(OptionsContext, { value: FactoryLogic.createOptions() },
				React.createElement(AbilityPanel, { key: might, ability: AbilityData.grab, hero, mode: PanelMode.Full })));
			const row = strings['heroes.actions.grab.rules'].fs;
			const binding = bindings['section:grab:2'];
			window.regressionStaticText = row.zh;
			return row.zh.slice(0, binding.targetSpan[0]) + might + binding.valueSuffix + row.zh.slice(binding.targetSpan[1]);
		};
		return window.renderRegression(2);
	});
	assert.equal(typeof expected, 'string');
	await abilityPage.waitForFunction(text => document.querySelector('#l10n-regression')?.textContent.includes(text.replace(/\*\*/g, '')), expected);
	const changed = await abilityPage.evaluate(() => window.renderRegression(3));
	assert.notEqual(changed, expected, 'Different Might must change the approved displayed number');
	await abilityPage.waitForFunction(text => document.querySelector('#l10n-regression')?.textContent.includes(text.replace(/\*\*/g, '')), changed);
	const calculatedText = await abilityPage.locator('#l10n-regression').innerText();
	await abilityPage.locator('#l10n-regression button').filter({ has: abilityPage.locator('.anticon-thunderbolt') }).click();
	await abilityPage.waitForFunction(text => document.querySelector('#l10n-regression')?.innerText !== text, calculatedText);
	await abilityPage.waitForFunction(() => document.querySelector('#l10n-regression')?.textContent.includes(window.regressionStaticText));
	console.log('PASS browser: shared ability panel calculated Might 2 → 3 and calculation toggle');
	assert.deepEqual(errors, [], 'Browser page errors');
	await context.close();
} finally {
	await browser?.close();
	await server.close();
}
