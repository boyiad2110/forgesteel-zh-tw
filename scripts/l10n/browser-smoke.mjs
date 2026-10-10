/** Isolated browser regression. No screenshots, video, user profile, or external writes. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { buildSeedState, writeSeedState } from '../screenshots/seed.mjs';

const readStoredHeroes = page => page.evaluate(() => new Promise((resolve, reject) => {
	const open = indexedDB.open('localforage');
	open.onerror = () => reject(open.error);
	open.onsuccess = () => {
		const connection = open.result;
		const request = connection.transaction('keyvaluepairs', 'readonly').objectStore('keyvaluepairs').get('forgesteel-heroes');
		request.onsuccess = () => { connection.close(); resolve(request.result); };
		request.onerror = () => { connection.close(); reject(request.error); };
	};
}));

const server = await createServer({ server: { host: '127.0.0.1', port: 0, watch: { ignored: [ '**/.tmp/**', '**/.l10n-verify/**' ] } }, logLevel: 'error' });
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
	for (const id of [ state.heroes.fury.id, state.heroes.tactician.id ]) {
		state.storage['forgesteel-heroes'].find(hero => hero.id === id).culture = null;
	}
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
	await page.emulateMedia({ media: 'screen' });

	// Exercise culture selections only in this disposable context, using approved
	// snapshot text as the expected result rather than the formatter being tested.
	await page.goto(`${origin}#/hero/edit/${state.heroes.fury.id}/culture`);
	const cultureExpected = await page.evaluate(async () => {
		const { core } = await import('/src/data/sourcebooks/official/core.ts');
		const { CultureData, EnvironmentData, OrganizationData, UpbringingData } = await import('/src/data/culture-data.ts');
		const { mapping } = await import('/src/l10n/mapping.ts');
		const { default: strings } = await import('/src/l10n/generated/zh-TW/strings.json');
		const name = element => {
			const row = strings[mapping[`element:${element.id}:name`].sheetId];
			return row.fs?.zh ?? row.zh;
		};
		const official = core.cultures.find(culture => culture.name === 'Pauper Neighborhood');
		return {
			officialName: name(official),
			enSummary: official.description,
			zhSummary: [ official.environment, official.organization, official.upbringing ].map(name).join('、') + '。',
			bespokeName: CultureData.bespoke.name,
			aspects: [ EnvironmentData.wilderness, OrganizationData.communal, UpbringingData.labor ].map(aspect => ({ en: aspect.name, zh: name(aspect) }))
		};
	});
	const officialCard = page.locator('#culture-list .selectable-panel').filter({ has: page.getByText(cultureExpected.officialName, { exact: true }) });
	await officialCard.getByText(cultureExpected.zhSummary, { exact: true }).waitFor();
	await officialCard.click();
	await page.locator('#culture-selected').getByText(cultureExpected.zhSummary, { exact: true }).waitFor();
	await page.locator('.app-footer').getByRole('button', { name: '中文', exact: true }).click();
	await page.locator('#culture-selected').getByText(cultureExpected.enSummary, { exact: true }).waitFor();
	await page.locator('.app-footer').getByRole('button', { name: 'EN', exact: true }).click();
	await page.locator('#culture-selected').getByText(cultureExpected.zhSummary, { exact: true }).waitFor();
	await page.getByRole('button', { name: /Save Changes/ }).click();
	await page.waitForURL('**/hero/view/**');
	await page.locator('.choices-section').getByText(cultureExpected.officialName, { exact: true }).waitFor();
	const officialSaved = (await readStoredHeroes(page)).find(hero => hero.id === state.heroes.fury.id);
	assert.equal(officialSaved.culture.description, cultureExpected.enSummary, 'Chinese punctuation must not enter saved culture data');
	console.log('PASS browser: official culture candidate, selected summary, Chinese punctuation and unchanged English data');

	await page.goto(`${origin}#/hero/edit/${state.heroes.tactician.id}/culture`);
	await page.reload(); // mount a fresh editor for the second fixture hero
	await page.locator('#culture-list .selectable-panel').filter({ has: page.getByText(cultureExpected.bespokeName, { exact: true }) }).click();
	const customName = 'Smoke culture name';
	await page.locator('#culture-choices').getByPlaceholder('Name', { exact: true }).fill(customName);
	await page.locator('#culture-selected .header-text').getByText(customName, { exact: true }).waitFor();
	for (const [ index, button ] of [ 'Choose environment', 'Choose organization', 'Choose upbringing' ].entries()) {
		const aspect = cultureExpected.aspects[index];
		await page.getByRole('button', { name: button, exact: true }).click();
		await page.locator('.feature-select-modal:visible .selectable-panel').filter({ has: page.getByText(aspect.zh, { exact: true }) }).click();
		await page.locator('#culture-choices .field-label').getByText(aspect.zh, { exact: true }).waitFor();
	}
	await page.locator('.app-footer').getByRole('button', { name: '中文', exact: true }).click();
	for (const aspect of cultureExpected.aspects) await page.locator('#culture-choices .field-label').getByText(aspect.en, { exact: true }).waitFor();
	assert.equal(await page.locator('#culture-choices').getByPlaceholder('Name', { exact: true }).inputValue(), customName);
	await page.locator('.app-footer').getByRole('button', { name: 'EN', exact: true }).click();
	for (const aspect of cultureExpected.aspects) await page.locator('#culture-choices .field-label').getByText(aspect.zh, { exact: true }).waitFor();
	await page.getByRole('button', { name: /Save Changes/ }).click();
	await page.waitForURL('**/hero/view/**');
	for (const aspect of cultureExpected.aspects) await page.locator('.choices-section').getByText(aspect.zh, { exact: true }).waitFor();
	const storedBeforeLanguageSwitch = await readStoredHeroes(page);
	const customSaved = storedBeforeLanguageSwitch.find(hero => hero.id === state.heroes.tactician.id).culture;
	assert.equal(customSaved.name, customName);
	assert.deepEqual([ customSaved.environment.name, customSaved.organization.name, customSaved.upbringing.name ], cultureExpected.aspects.map(aspect => aspect.en));
	await page.goto(`${origin}#/hero/sheet/${state.heroes.tactician.id}`);
	await page.locator('.culture.card').getByText(customName, { exact: true }).waitFor();
	for (const aspect of cultureExpected.aspects) await page.locator('.culture.card h4').getByText(aspect.zh, { exact: true }).waitFor();
	// The classic sheet has no footer toggle; use the overview's real control.
	await page.goto(`${origin}#/hero/view/${state.heroes.tactician.id}`);
	await page.locator('.choices-section').getByText(customName, { exact: true }).waitFor();
	await page.locator('.app-footer').getByRole('button', { name: '中文', exact: true }).click();
	await page.locator('.choices-section').getByText(cultureExpected.aspects[0].en, { exact: true }).waitFor();
	await page.goto(`${origin}#/hero/sheet/${state.heroes.tactician.id}`);
	for (const aspect of cultureExpected.aspects) await page.locator('.culture.card h4').getByText(aspect.en, { exact: true }).waitFor();
	assert.deepEqual(await readStoredHeroes(page), storedBeforeLanguageSwitch, 'Language switching must leave stored heroes unchanged');
	await page.goto(`${origin}#/hero/view/${state.heroes.tactician.id}`);
	await page.locator('.choices-section').getByText(customName, { exact: true }).waitFor();
	await page.locator('.app-footer').getByRole('button', { name: 'EN', exact: true }).click();
	await page.locator('.choices-section').getByText(cultureExpected.aspects[0].zh, { exact: true }).waitFor();
	await page.goto(`${origin}#/hero/sheet/${state.heroes.tactician.id}`);
	for (const aspect of cultureExpected.aspects) await page.locator('.culture.card h4').getByText(aspect.zh, { exact: true }).waitFor();
	assert.deepEqual(await readStoredHeroes(page), storedBeforeLanguageSwitch);
	console.log('PASS browser: bespoke aspect candidates, selected Fields, overview, classic sheet, custom name and stored hero invariance');

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
