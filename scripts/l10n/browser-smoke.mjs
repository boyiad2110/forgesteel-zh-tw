/** Isolated browser regression. No screenshots, video, user profile, or external writes. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { buildSeedState, writeSeedState } from '../screenshots/seed.mjs';
import approvedUI from '../../src/l10n/generated/zh-TW/ui.json' with { type: 'json' };

const uiText = id => approvedUI[id].fs?.zh ?? approvedUI[id].zh;
const saveChangesText = uiText('ui.hero-builder.save-changes.7215be78');

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
	await page.getByText(uiText('ui.hero-builder.hero-builder.bd7e4ec0'), { exact: true }).first().waitFor();
	await page.getByText(uiText('ui.hero-builder.not-started.dad5ea5d'), { exact: true }).first().waitFor();
	const ancestryExpected = await page.evaluate(async () => {
		const { dragonKnight } = await import('/src/data/ancestries/dragon-knight.ts');
		const { default: strings } = await import('/src/l10n/generated/zh-TW/strings.json');
		const { mapping } = await import('/src/l10n/mapping.ts');
		const text = (element, field) => {
			const sheetId = mapping[`element:${element.id}:${field}`].sheetId;
			const row = strings[sheetId];
			return { en: row.fs?.en ?? row.en, zh: row.fs?.zh ?? row.zh };
		};
		return {
			dragonKnight: text(dragonKnight, 'name'),
			wyrmplate: {
				name: text(dragonKnight.features[0], 'name'),
				description: text(dragonKnight.features[0], 'description')
			}
		};
	});
	await page.locator('#ancestry-list .selectable-panel').filter({ has: page.getByText(ancestryExpected.dragonKnight.zh, { exact: true }) }).click();
	await page.locator('#ancestry-selected').getByText(ancestryExpected.dragonKnight.zh, { exact: true }).waitFor();
	const wyrmplatePanel = page.locator('#ancestry-choices .feature-config-panel').filter({ has: page.getByText(ancestryExpected.wyrmplate.name.zh, { exact: true }) });
	// The level projection has no approved calculated-text binding, so its
	// changed display remains English in both language modes.
	const projectedWyrmplateDescription = ancestryExpected.wyrmplate.description.en.replace('damage immunity equal to your level', 'damage immunity equal to 1');
	await wyrmplatePanel.getByText(projectedWyrmplateDescription, { exact: true }).waitFor();
	await page.locator('.app-footer').getByRole('button', { name: '中文', exact: true }).click();
	await page.getByText('Hero Builder', { exact: true }).first().waitFor();
	await page.locator('#ancestry-choices .header-text').getByText(ancestryExpected.wyrmplate.name.en, { exact: true }).waitFor();
	await page.locator('#ancestry-choices').getByText(projectedWyrmplateDescription, { exact: true }).waitFor();
	await page.locator('.app-footer').getByRole('button', { name: 'EN', exact: true }).click();
	await page.getByText(uiText('ui.hero-builder.hero-builder.bd7e4ec0'), { exact: true }).first().waitFor();
	await page.locator('#ancestry-choices .header-text').getByText(ancestryExpected.wyrmplate.name.zh, { exact: true }).waitFor();
	await page.locator('#ancestry-choices').getByText(projectedWyrmplateDescription, { exact: true }).waitFor();
	await page.locator('button').filter({ hasText: saveChangesText }).first().click();
	await page.waitForURL('**/hero/view/**');
	await page.getByText(ancestryExpected.dragonKnight.zh, { exact: true }).first().waitFor();
	const dragonKnightStored = await readStoredHeroes(page);
	assert.equal(dragonKnightStored.find(hero => hero.id === state.heroes.fury.id).ancestry.id, 'ancestry-dragon-knight');
	console.log('PASS browser: ancestry candidate, approved choice panel, dynamic English fallback, saved value');

	await page.goto(`${origin}#/hero/sheet/${state.heroes.fury.id}`);
	await page.locator('.hero-header.card').getByText(ancestryExpected.dragonKnight.zh, { exact: true }).waitFor();
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
			aspects: [ EnvironmentData.wilderness, OrganizationData.communal, UpbringingData.labor ].map(aspect => {
				const descriptionRow = strings[mapping[`element:${aspect.id}:description`].sheetId];
				return {
					en: aspect.name,
					zh: name(aspect),
					descriptionEn: descriptionRow.fs?.en ?? descriptionRow.en,
					descriptionZh: descriptionRow.fs?.zh ?? descriptionRow.zh
				};
			})
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
	await page.locator('button').filter({ hasText: saveChangesText }).first().click();
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
	for (const [ index, button ] of [
		uiText('ui.hero-builder.choose-environment.e7ee4885'),
		uiText('ui.hero-builder.choose-organization.e94b4b4d'),
		uiText('ui.hero-builder.choose-upbringing.d441f2f0')
	].entries()) {
		const aspect = cultureExpected.aspects[index];
		await page.getByRole('button', { name: button, exact: true }).click();
		await page.locator('.feature-select-modal:visible .selectable-panel').filter({ has: page.getByText(aspect.zh, { exact: true }) }).click();
		await page.locator('#culture-choices .field-label').getByText(aspect.zh, { exact: true }).waitFor();
		const aspectPanel = page.locator('#culture-choices .feature-config-panel').filter({ has: page.getByText(aspect.zh, { exact: true }) });
		await aspectPanel.getByText(aspect.descriptionZh, { exact: true }).waitFor();
	}
	await page.locator('.app-footer').getByRole('button', { name: '中文', exact: true }).click();
	for (const aspect of cultureExpected.aspects) {
		await page.locator('#culture-choices .field-label').getByText(aspect.en, { exact: true }).waitFor();
		const aspectPanel = page.locator('#culture-choices .feature-config-panel').filter({ has: page.getByText(aspect.en, { exact: true }) });
		await aspectPanel.getByText(aspect.descriptionEn, { exact: true }).waitFor();
	}
	assert.equal(await page.locator('#culture-choices').getByPlaceholder('Name', { exact: true }).inputValue(), customName);
	await page.locator('.app-footer').getByRole('button', { name: 'EN', exact: true }).click();
	for (const aspect of cultureExpected.aspects) await page.locator('#culture-choices .field-label').getByText(aspect.zh, { exact: true }).waitFor();
	await page.locator('button').filter({ hasText: saveChangesText }).first().click();
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
