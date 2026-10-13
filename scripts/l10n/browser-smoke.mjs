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
				description: text(dragonKnight.features[0], 'description'),
				display: strings[mapping['element:dragon-knight-feature-1:description'].sheetId].fs.calculationDisplay
			}
		};
	});
	await page.locator('#ancestry-list .selectable-panel').filter({ has: page.getByText(ancestryExpected.dragonKnight.zh, { exact: true }) }).click();
	await page.locator('#ancestry-selected').getByText(ancestryExpected.dragonKnight.zh, { exact: true }).waitFor();
	const wyrmplatePanel = page.locator('#ancestry-choices .feature-config-panel').filter({ has: page.getByText(ancestryExpected.wyrmplate.name.zh, { exact: true }) });
	const projectedWyrmplateEnglish = ancestryExpected.wyrmplate.description.en.replace('your level', '1');
	const projectedWyrmplateChinese = ancestryExpected.wyrmplate.description.zh.replace(
		ancestryExpected.wyrmplate.display.target,
		ancestryExpected.wyrmplate.display.template.replace('{value}', '1')
	);
	await wyrmplatePanel.getByText(projectedWyrmplateChinese, { exact: true }).waitFor();
	const purchasedTraitsPanel = page.locator('#ancestry-choices .feature-config-panel').filter({ has: page.getByText('自購特性', { exact: true }) });
	await purchasedTraitsPanel.getByText('此特性能讓你從一組特性中做出選擇。', { exact: true }).waitFor();
	await purchasedTraitsPanel.getByRole('button', { name: '選擇 1 個項目', exact: true }).waitFor();
	await purchasedTraitsPanel.locator('.toggle').click();
	await purchasedTraitsPanel.getByRole('button', { name: '選擇 1 個項目（擴充）', exact: true }).waitFor();
	await purchasedTraitsPanel.locator('.toggle').click();
	await page.locator('.app-footer').getByRole('button', { name: '中文', exact: true }).click();
	await page.getByText('Hero Builder', { exact: true }).first().waitFor();
	await page.locator('#ancestry-choices .header-text').getByText(ancestryExpected.wyrmplate.name.en, { exact: true }).waitFor();
	await page.locator('#ancestry-choices').getByText(projectedWyrmplateEnglish, { exact: true }).waitFor();
	await page.locator('.app-footer').getByRole('button', { name: 'EN', exact: true }).click();
	await page.getByText(uiText('ui.hero-builder.hero-builder.bd7e4ec0'), { exact: true }).first().waitFor();
	await page.locator('#ancestry-choices .header-text').getByText(ancestryExpected.wyrmplate.name.zh, { exact: true }).waitFor();
	await page.locator('#ancestry-choices').getByText(projectedWyrmplateChinese, { exact: true }).waitFor();
	await page.locator('button').filter({ hasText: saveChangesText }).first().click();
	await page.waitForURL('**/hero/view/**');
	await page.getByText(ancestryExpected.dragonKnight.zh, { exact: true }).first().waitFor();
	const dragonKnightStored = await readStoredHeroes(page);
	assert.equal(dragonKnightStored.find(hero => hero.id === state.heroes.fury.id).ancestry.id, 'ancestry-dragon-knight');
	console.log('PASS browser: ancestry candidate, approved choice panel, dynamic value projection, saved value');

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
	const cultureLanguagePanel = page.locator('#culture-choices .feature-config-panel').filter({ has: page.getByText('語言', { exact: true }) });
	await cultureLanguagePanel.getByText('選擇 1 種語言。', { exact: true }).waitFor();
	await page.locator('.app-footer').getByRole('button', { name: '中文', exact: true }).click();
	await page.locator('#culture-selected').getByText(cultureExpected.enSummary, { exact: true }).waitFor();
	await page.locator('#culture-choices .feature-config-panel').filter({ has: page.getByText('Language', { exact: true }) })
		.getByText('Choose a  language.', { exact: true }).waitFor();
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
	await page.locator('#culture-choices').getByPlaceholder(uiText('ui.hero-builder.name.f7c27f51'), { exact: true }).fill(customName);
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
	await abilityPage.evaluate(async () => {
		const ReactModule = await import('/node_modules/.vite/deps/react.js');
		const React = ReactModule.default ?? ReactModule;
		const reactDom = await import('/node_modules/.vite/deps/react-dom_client.js');
		const createRoot = reactDom.createRoot ?? reactDom.default.createRoot;
		const { FeatureConfigPanel } = await import('/src/components/panels/feature-config-panel/feature-config-panel.tsx');
		const { FactoryLogic } = await import('/src/logic/factory-logic.ts');
		const { OptionsContext } = await import('/src/contexts/data-context.tsx');
		const { core } = await import('/src/data/sourcebooks/official/core.ts');
		const { loadCatalog } = await import('/src/l10n/catalog.ts');
		const { setLanguage } = await import('/src/l10n/language.ts');
		await loadCatalog();
		setLanguage('zh-TW');
		const host = document.createElement('section');
		host.id = 'feature-config-regression';
		document.body.append(host);
		const root = createRoot(host);
		const hero = FactoryLogic.createHero();
		const choice = (id, name) => FactoryLogic.feature.createChoice({ id, name, options: [], count: 1 });
		root.render(React.createElement(OptionsContext, { value: FactoryLogic.createOptions() },
			React.createElement(React.Fragment, null,
				React.createElement(FeatureConfigPanel, { feature: choice('human-feature-2', 'Purchased Traits'), hero, sourcebooks: [ core ], setData: () => undefined }),
				React.createElement(FeatureConfigPanel, { feature: choice('homebrew-purchased-traits', 'Purchased Traits'), hero, sourcebooks: [ core ], setData: () => undefined }),
				React.createElement(FeatureConfigPanel, {
					feature: FactoryLogic.feature.createLanguageChoice({ id: 'homebrew-culture-language' }),
					hero,
					sourcebooks: [ core ],
					setData: () => undefined
				})
			)));
	});
	const configPanels = abilityPage.locator('#feature-config-regression .feature-config-panel');
	const officialTraits = configPanels.nth(0);
	await officialTraits.getByText('自購特性', { exact: true }).waitFor();
	await officialTraits.getByText('此特性能讓你從一組特性中做出選擇。', { exact: true }).waitFor();
	await officialTraits.getByText('此特性沒有可選的選項。', { exact: true }).waitFor();
	const customTraits = configPanels.nth(1);
	await customTraits.getByText('Purchased Traits', { exact: true }).waitFor();
	await customTraits.getByText('This feature allows you to choose from a collection of features.', { exact: true }).waitFor();
	const customLanguage = configPanels.nth(2);
	await customLanguage.getByText('Language', { exact: true }).waitFor();
	await customLanguage.getByText('Choose a  language.', { exact: true }).waitFor();
	console.log('PASS browser: FeatureConfigPanel approved ancestry and culture text, Choice empty state, custom text protection');
	const ui05Expected = await abilityPage.evaluate(async () => {
		const ReactModule = await import('/node_modules/.vite/deps/react.js');
		const React = ReactModule.default ?? ReactModule;
		const reactDom = await import('/node_modules/.vite/deps/react-dom_client.js');
		const createRoot = reactDom.createRoot ?? reactDom.default.createRoot;
		const { FeatureConfigPanel } = await import('/src/components/panels/feature-config-panel/feature-config-panel.tsx');
		const { FactoryLogic } = await import('/src/logic/factory-logic.ts');
		const { OptionsContext } = await import('/src/contexts/data-context.tsx');
		const { core } = await import('/src/data/sourcebooks/official/core.ts');
		const { SkillList } = await import('/src/enums/skill-list.ts');
		const { FeatureType } = await import('/src/enums/feature-type.ts');
		const { LanguageType } = await import('/src/enums/language-type.ts');
		const { mapping } = await import('/src/l10n/mapping.ts');
		const { default: glossary } = await import('/src/l10n/generated/zh-TW/glossary.json');
		const { default: strings } = await import('/src/l10n/generated/zh-TW/strings.json');
		const { default: ui } = await import('/src/l10n/generated/zh-TW/ui.json');
		const { loadCatalog } = await import('/src/l10n/catalog.ts');
		const { setLanguage } = await import('/src/l10n/language.ts');
		await loadCatalog();
		setLanguage('zh-TW');
		const official = new Map();
		const seen = new WeakSet();
		const visit = value => {
			if (!value || typeof value !== 'object' || seen.has(value)) return;
			seen.add(value);
			if (value.type === FeatureType.SkillChoice) official.set(value.id, value);
			Object.values(value).forEach(visit);
		};
		visit(core);
		const skillIDs = [ 'devil-feature-1b', 'career-artisan-feature-1', 'elementalist-1-2', 'shadow-1-3', 'env-urban', 'up-martial' ];
		const sourceFeatures = skillIDs.map(id => official.get(id));
		if (sourceFeatures.some(feature => !feature)) throw new Error('Approved skill-choice browser fixtures are missing');
		const hero = FactoryLogic.createHero();
		const panels = [
			{ feature: hero.features[0], sourceFeature: hero.features[0] },
			...sourceFeatures.map(sourceFeature => ({
				sourceFeature,
				feature: FactoryLogic.feature.createSkillChoice({
					id: sourceFeature.id,
					name: 'Skill',
					options: [ ...sourceFeature.data.options ],
					listOptions: [ ...sourceFeature.data.listOptions ],
					count: sourceFeature.data.count,
					selected: sourceFeature.id === 'devil-feature-1b' ? [ 'Lead' ] : [ ...sourceFeature.data.selected ]
				})
			})),
			{ feature: FactoryLogic.feature.createSkillChoice({ id: 'homebrew-custom-skill-choice', name: 'Skill', options: [ 'Smoke Test Skill' ], count: 1 }) },
			{ feature: sourceFeatures[1] },
			{ feature: [ ...official.values() ].find(f => f.name === 'Skill' && f.description === 'Choose a skill from any list.') },
			{ feature: FactoryLogic.feature.createSkillChoice({ id: 'unknown-any-list-skill-choice', name: 'Skill' }) }
		];
		const get = key => {
			const entry = mapping[key];
			if (!entry) throw new Error(`Missing UI-05 smoke mapping: ${key}`);
			const row = entry.sheetId;
			const source = key.startsWith('ui:') ? ui : (key.startsWith('skill:') || key.startsWith('enum:')) ? glossary : strings;
			const record = source[row];
			const value = record?.fs?.zh ?? record?.zh;
			if (!value) throw new Error(`Missing UI-05 smoke translation: ${key} → ${row}`);
			return value;
		};
		const expected = sourceFeatures.map(sourceFeature => {
			const { options, listOptions, count } = sourceFeature.data;
			const parts = [
				...options.map(name => get(`skill:${name}`)),
				...(listOptions.length === 5
					? [ get('ui:ui.hero-builder.any-skill-list.7f7a6841') ]
					: listOptions.map(list => get('ui:ui.hero-builder.skill-list-description.f94c20ab').replace('{list}', get(`enum:SkillList:${list}`))))
			];
			const template = count > 1
				? get('ui:ui.hero-builder.skills-choice-description.1a7008a2')
				: get('ui:ui.hero-builder.skill-choice-description.9172d5a4');
			return template.replace('{count}', String(count)).replace('{source}', parts.join(' / '));
		});
		const custom = FactoryLogic.createSourcebook();
		custom.type = 'Homebrew';
		custom.skills = [ { name: 'Smoke Test Skill', description: '', list: SkillList.Custom } ];
		const languageBook = FactoryLogic.createSourcebook();
		languageBook.type = 'Official';
		languageBook.languages = [ { name: 'Smoke Test Common', description: '', type: LanguageType.Common, related: [] } ];
		const host = document.createElement('section');
		host.id = 'ui05-regression';
		document.body.append(host);
		const root = createRoot(host);
		root.render(React.createElement(OptionsContext, { value: FactoryLogic.createOptions() },
			React.createElement(React.Fragment, null, ...panels.map((panel, index) => React.createElement(FeatureConfigPanel, {
				key: `${panel.feature.id}-${index}`,
				feature: panel.feature,
				detailsSourceFeature: panel.sourceFeature,
				hero,
				sourcebooks: [ core, custom, languageBook ],
				setData: () => undefined
			})))));
		return { expected, defaultFeature: hero.features[0].description };
	});
	const ui05Panels = abilityPage.locator('#ui05-regression .feature-config-panel');
	await ui05Panels.nth(0).getByText('預設語言', { exact: true }).waitFor();
	await ui05Panels.nth(0).getByText('選擇 1 種通用語。', { exact: true }).waitFor();
	for (const [ index, text ] of ui05Expected.expected.entries()) {
		await ui05Panels.nth(index + 1).getByText(text, { exact: true }).waitFor();
	}
	await ui05Panels.nth(1).getByText('鼓舞他人採取行動。', { exact: true }).waitFor();
	await ui05Panels.nth(0).getByRole('button', { name: '選擇語言', exact: true }).click();
	await abilityPage.locator('.language-select-modal').getByText('通用語', { exact: true }).waitFor();
	await abilityPage.keyboard.press('Escape');
	await ui05Panels.nth(7).getByRole('button', { name: '選擇技能', exact: true }).click();
	assert.equal(await abilityPage.locator('.skill-select-modal').getByText('自訂', { exact: true }).count(), 2, 'Custom category heading and skill tag');
	await abilityPage.locator('.skill-select-modal').getByText('Smoke Test Skill', { exact: true }).waitFor();
	await abilityPage.locator('.skill-select-modal').getByText('其他技能', { exact: true }).click();
	await abilityPage.locator('.skill-select-modal').getByText('了解魔法地點、法術、儀式、道具與現象。', { exact: true }).waitFor();
	await abilityPage.keyboard.press('Escape');
	await ui05Panels.nth(8).getByText(ui05Expected.expected[1], { exact: true }).waitFor();
	await ui05Panels.nth(8).getByText('工藝類技能', { exact: true }).waitFor();
	await ui05Panels.nth(9).getByText('技能', { exact: true }).waitFor();
	await ui05Panels.nth(9).getByText('從任意技能類別中選擇 1 項技能。', { exact: true }).waitFor();
	await ui05Panels.nth(10).getByText('Skill', { exact: true }).waitFor();
	await ui05Panels.nth(10).getByText('Choose a skill from any list.', { exact: true }).waitFor();
	await abilityPage.locator('.app-footer').getByRole('button', { name: '中文', exact: true }).click();
	await ui05Panels.nth(0).getByText('Default Language', { exact: true }).waitFor();
	await ui05Panels.nth(1).getByText('Choose a skill from Interpersonal skills.', { exact: true }).waitFor();
	await abilityPage.locator('.app-footer').getByRole('button', { name: 'EN', exact: true }).click();
	await ui05Panels.nth(0).getByText('預設語言', { exact: true }).waitFor();
	console.log('PASS browser: UI-05 official skill templates at 1 / 2 / 3 / 5, default language, selector labels, English fallback');
	// Check every inventoried choice through both real display paths, not just representative prompts.
	const matrix = await abilityPage.evaluate(async () => {
		const ReactModule = await import('/node_modules/.vite/deps/react.js');
		const React = ReactModule.default ?? ReactModule;
		const reactDom = await import('/node_modules/.vite/deps/react-dom_client.js');
		const { FeatureConfigPanel } = await import('/src/components/panels/feature-config-panel/feature-config-panel.tsx');
		const { FactoryLogic } = await import('/src/logic/factory-logic.ts');
		const { AbilityLogic } = await import('/src/logic/ability-logic.ts');
		const { DetailsSection } = await import('/src/components/pages/heroes/hero-edit/details-section/details-section.tsx');
		const { Utils } = await import('/src/utils/utils.ts');
		const { OptionsContext, HeroesContext } = await import('/src/contexts/data-context.tsx');
		const { FeatureType } = await import('/src/enums/feature-type.ts');
		const { core } = await import('/src/data/sourcebooks/official/core.ts');
		const { orden } = await import('/src/data/sourcebooks/official/orden.ts');
		const { beastheartSourcebook } = await import('/src/data/sourcebooks/official/beastheart.ts');
		const { summonerSourcebook } = await import('/src/data/sourcebooks/official/summoner.ts');
		const { CultureData } = await import('/src/data/culture-data.ts');
		const { mapping } = await import('/src/l10n/mapping.ts');
		const { default: glossary } = await import('/src/l10n/generated/zh-TW/glossary.json');
		const { default: ui } = await import('/src/l10n/generated/zh-TW/ui.json');
		const books = [ core, orden, beastheartSourcebook, summonerSourcebook ];
		const hero = FactoryLogic.createHero();
		const candidates = new Map();
		const seen = new WeakSet();
		const visit = value => {
			if (!value || typeof value !== 'object' || seen.has(value)) return;
			seen.add(value);
			if ([ FeatureType.LanguageChoice, FeatureType.SkillChoice ].includes(value.type)) candidates.set(value.id, value);
			Object.values(value).forEach(visit);
		};
		[ ...books, CultureData.bespoke, hero.features[0] ].forEach(visit);
		const get = key => {
			const id = mapping[key]?.sheetId;
			const entry = (key.startsWith('ui:') ? ui : glossary)[id];
			const target = entry?.fs?.zh ?? entry?.zh;
			if (!target) throw new Error(`Unapproved matrix translation: ${key}`);
			return target;
		};
		const uiGet = id => get(`ui:ui.hero-builder.${id}`);
		const group = list => uiGet('skill-list-description.f94c20ab').replace('{list}', get(`enum:SkillList:${list}`));
		const skillPrompt = f => {
			const parts = [ ...f.data.options.map(name => get(`skill:${name}`)),
				...(f.data.listOptions.length === 5 ? [ uiGet('any-skill-list.7f7a6841') ] : f.data.listOptions.map(group)) ];
			return uiGet(f.data.count === 1 ? 'skill-choice-description.9172d5a4' : 'skills-choice-description.1a7008a2')
				.replace('{count}', String(f.data.count)).replace('{source}', parts.join(' / '));
		};
		const languageDescriptions = new Map([
			[ 'Choose a  language.', uiGet('culture-language-description.ad467037') ],
			[ 'Choose 2  languages.', uiGet('two-languages-description.0139e42b') ],
			[ 'Choose a Common language.', uiGet('common-language-description.cc9ef9be') ]
		]);
		const records = [];
		for (const source of candidates.values()) {
			const rebuilt = source.type === FeatureType.SkillChoice
				? FactoryLogic.feature.createSkillChoice({ id: source.id, name: 'Skill', options: [ ...source.data.options ], listOptions: [ ...source.data.listOptions ], count: source.data.count })
				: FactoryLogic.feature.createLanguageChoice({ id: source.id, name: source.name || 'Language', options: [ ...source.data.options ], allowedTypes: [ ...source.data.allowedTypes ], count: source.data.count });
			for (const [ path, feature ] of [ [ 'direct', source ], [ 'details', rebuilt ] ]) {
				let title = feature.name;
				let description = feature.description;
				if (feature.type === FeatureType.LanguageChoice) {
					const titles = { Language: 'language.996aaf3b', Languages: 'languages.318655ce', 'Default Language': 'default-language.28bee244' };
					if (titles[title]) title = uiGet(titles[title]);
					description = languageDescriptions.get(description) ?? description;
				} else {
					if (path === 'details' || description === rebuilt.description) description = skillPrompt(source);
					if (title === 'Skill') title = uiGet('skill.a5ed2dcb');
					else if (source.id === 'devil-feature-1b') title = uiGet('interpersonal-skill.3095ff6f');
					else if (!source.data.options.length && source.data.listOptions.length < 5
						&& title === `${source.data.listOptions.join(' / ')} ${source.data.count === 1 ? 'Skill' : 'Skills'}`) {
						title = uiGet('skill-list-description.f94c20ab').replace('{list}', source.data.listOptions.map(list => get(`enum:SkillList:${list}`)).join(' / '));
					}
				}
				records.push({ feature, sourceFeature: path === 'details' ? source : undefined, title, description, label: `${source.id}:${path}` });
			}
		}
		const artisan = candidates.get('career-artisan-feature-2');
		const sampleSkill = candidates.get('career-agent-feature-1');
		for (const source of [ artisan, sampleSkill ]) {
			const changedSource = { ...structuredClone(source), description: 'Changed original description.' };
			records.push({ feature: source, sourceFeature: changedSource, title: source.name, description: source.description, label: `${source.id}:protected-original-source` });
			const cases = [
				{ ...structuredClone(source), id: `unknown-${source.id}` },
				{ ...structuredClone(source), name: 'Custom title' },
				{ ...structuredClone(source), description: 'Custom description.' },
				{ ...structuredClone(source), data: { ...source.data, count: 99 } }
			];
			for (const feature of cases) {
				records.push({ feature, title: feature.name, description: feature.description, label: `${source.id}:protected-direct` });
				records.push({ feature, sourceFeature: source, title: feature.name, description: feature.description, label: `${source.id}:protected-projection` });
			}
		}
		const homebrew = FactoryLogic.createSourcebook();
		homebrew.type = 'Homebrew';
		homebrew.careers = [ { ...FactoryLogic.createCareer(), features: [ FactoryLogic.feature.createLanguageChoice({ id: 'homebrew-language' }), FactoryLogic.feature.createSkillChoice({ id: 'homebrew-skill' }) ] } ];
		books.push(homebrew);
		for (const feature of homebrew.careers[0].features) records.push({ feature, sourceFeature: feature, title: feature.name, description: feature.description, label: 'protected-homebrew' });
		const snapshot = JSON.stringify({ records, books, hero });
		const changedHero = FactoryLogic.createHero();
		changedHero.features = [ { ...structuredClone(artisan), description: 'Changed original language.' }, { ...structuredClone(sampleSkill), description: 'Changed original skill.' } ];
		changedHero.features.forEach(feature => { feature.data.selected = []; });
		const host = document.createElement('section');
		host.id = 'choice-matrix';
		document.body.append(host);
		const root = (reactDom.createRoot ?? reactDom.default.createRoot)(host);
		root.render(React.createElement(OptionsContext, { value: FactoryLogic.createOptions() },
			React.createElement(React.Fragment, null, ...records.map((record, index) => React.createElement(FeatureConfigPanel, {
				key: index, feature: record.feature, detailsSourceFeature: record.sourceFeature, hero, sourcebooks: books,
				setData: () => { throw new Error('Display mutated choice data'); }
			})), React.createElement('section', { id: 'changed-details-source' }, React.createElement(HeroesContext, { value: [] }, React.createElement(DetailsSection, {
				hero: changedHero, sourcebooks: books, setName: () => undefined, setPicture: () => undefined, setFolder: () => undefined,
				setTutorialMode: () => undefined, setFeatureData: () => undefined, setExtensionIDs: () => undefined
			}))))));
		const plain = text => {
			const div = document.createElement('div');
			div.innerHTML = Utils.markdownToHtml(AbilityLogic.getTextEffect(text, hero));
			return div.textContent.trim().replace(/\s+/g, ' ');
		};
		window.choiceMatrix = { root, checkUnchanged: () => snapshot === JSON.stringify({ records, books, hero }) };
		return { count: candidates.size, languageCount: [ ...candidates.values() ].filter(f => f.type === FeatureType.LanguageChoice).length,
			zh: records.map(r => ({ label: r.label, title: r.title, description: plain(r.description) })),
			en: records.map(r => ({ label: r.label, title: r.feature.name, description: plain(r.feature.description) })) };
	});
	const assertMatrix = async (expected, language) => {
		await abilityPage.waitForFunction(count => document.querySelectorAll('#choice-matrix > .feature-config-panel').length === count, expected.length);
		await abilityPage.locator('#choice-matrix .header-text').first().getByText(expected[0].title, { exact: true }).waitFor();
		const actual = await abilityPage.locator('#choice-matrix > .feature-config-panel').evaluateAll(panels => panels.map(panel => ({
			title: panel.querySelector('.header-text').textContent.trim(),
			description: panel.querySelector('.header-text-panel').nextElementSibling.textContent.trim().replace(/\s+/g, ' ')
		})));
		for (const [ index, record ] of expected.entries()) {
			assert.deepEqual(actual[index], { title: record.title, description: record.description }, `${record.label}:${language}`);
		}
		assert.equal(await abilityPage.evaluate(() => window.choiceMatrix.checkUnchanged()), true, 'Choice source / selection / hero data unchanged');
		await abilityPage.locator('#changed-details-source').getByText('Choose a  language.', { exact: true }).waitFor();
		const skillExpander = abilityPage.locator('#changed-details-source .ant-collapse').nth(1);
		if (await skillExpander.locator('.ant-collapse-header').getAttribute('aria-expanded') === 'false') await skillExpander.locator('.ant-collapse-header').click();
		await abilityPage.locator('#changed-details-source').getByText('Choose a skill from any list.', { exact: true }).waitFor();
		await abilityPage.locator('#changed-details-source').getByText('Language', { exact: true }).waitFor();
		await abilityPage.locator('#changed-details-source').getByText('Skill', { exact: true }).waitFor();
	};
	await assertMatrix(matrix.zh, 'zh-TW');
	await abilityPage.locator('.app-footer').getByRole('button', { name: '中文', exact: true }).click();
	await assertMatrix(matrix.en, 'en');
	await abilityPage.locator('.app-footer').getByRole('button', { name: 'EN', exact: true }).click();
	await assertMatrix(matrix.zh, 'zh-TW');
	await abilityPage.evaluate(() => { window.choiceMatrix.root.unmount(); document.querySelector('#choice-matrix').remove(); });
	console.log(`PASS browser: ${matrix.count} choices (${matrix.languageCount} language), direct + rebuilt DOM, 20 protected cases + changed-source DetailsSection, zh / en / zh, data unchanged`);
	const careerHeroes = await readStoredHeroes(page);
	const artisan = await page.evaluate(async () => (await import('/src/data/careers/artisan.ts')).artisan);
	careerHeroes.find(hero => hero.id === state.heroes.fury.id).career = artisan;
	await writeSeedState(page, { 'forgesteel-heroes': careerHeroes });
	await page.reload();
	await page.goto(`${origin}#/hero/edit/${state.heroes.fury.id}/career`);
	const careerChoices = page.locator('.career-section .feature-config-panel');
	await careerChoices.getByText('語言', { exact: true }).waitFor();
	await careerChoices.getByText('選擇 1 種語言。', { exact: true }).waitFor();
	await careerChoices.getByText('工藝類技能', { exact: true }).waitFor();
	await careerChoices.getByText(uiText('ui.hero-builder.crafting-perk.cc40cc14'), { exact: true }).waitFor();
	await careerChoices.getByText(uiText('ui.hero-builder.this-feature-allows-you-to-choos.f843efd3'), { exact: true }).waitFor();
	await page.goto(`${origin}#/hero/edit/${state.heroes.fury.id}/details`);
	await page.locator('#details-main').getByText(uiText('ui.hero-builder.name.f7c27f51'), { exact: true }).waitFor();
	await page.locator('#details-main').getByPlaceholder(uiText('ui.hero-builder.name.f7c27f51'), { exact: true }).waitFor();
	await page.locator('.details-section .feature-config-panel').getByText('選擇 1 種語言。', { exact: true }).first().waitFor();
	await page.locator('button').filter({ hasText: saveChangesText }).first().click();
	await page.waitForURL('**/hero/view/**');
	assert.deepEqual((await readStoredHeroes(page)).find(hero => hero.id === state.heroes.fury.id).career, artisan, 'Saved career retains original source text');
	console.log('PASS browser: Artisan career route, Details Name and language, unapproved perk fallback, saved source unchanged');
	const careerPage = await context.newPage();
	careerPage.on('pageerror', error => errors.push(error.message));
	await careerPage.goto(origin);
	const careerExpected = await careerPage.evaluate(async () => {
		const reactModule = await import('/node_modules/.vite/deps/react.js');
		const React = reactModule.default ?? reactModule;
		const reactDom = await import('/node_modules/.vite/deps/react-dom_client.js');
		const createRoot = reactDom.createRoot ?? reactDom.default.createRoot;
		const { CareerPanel } = await import('/src/components/panels/elements/career-panel/career-panel.tsx');
		const { CareerData } = await import('/src/data/career-data.ts');
		const { core } = await import('/src/data/sourcebooks/official/core.ts');
		const { FactoryLogic } = await import('/src/logic/factory-logic.ts');
		const { OptionsContext } = await import('/src/contexts/data-context.tsx');
		const { PanelMode } = await import('/src/enums/panel-mode.ts');
		const { loadCatalog } = await import('/src/l10n/catalog.ts');
		const { setLanguage } = await import('/src/l10n/language.ts');
		const { default: strings } = await import('/src/l10n/generated/zh-TW/strings.json');
		const { mapping } = await import('/src/l10n/mapping.ts');
		await loadCatalog();
		setLanguage('zh-TW');
		const host = document.createElement('section');
		host.id = 'career-l10n-regression';
		document.body.append(host);
		const root = createRoot(host);
		const careers = Object.values(CareerData);
		const source = careers.map(career => ({ name: career.name, description: career.description }));
		const records = careers.map(career => {
			const nameRow = strings[mapping[`element:${career.id}:name`].sheetId];
			const descriptionRow = strings[mapping[`element:${career.id}:description`].sheetId];
			return {
				id: career.id,
				name: { en: career.name, zh: nameRow.fs?.zh ?? nameRow.zh },
				description: { en: career.description, zh: descriptionRow.fs?.zh ?? descriptionRow.zh }
			};
		});
		root.render(React.createElement(OptionsContext, { value: FactoryLogic.createOptions() },
			React.createElement(React.Fragment, null, ...careers.flatMap(career => [ PanelMode.Compact, PanelMode.Full ].map(mode =>
				React.createElement('div', { id: `${career.id}-${mode}`, key: `${career.id}-${mode}` },
					React.createElement(CareerPanel, { career, sourcebooks: [ core ], mode }))
			)))));
		window.careerL10nRegression = { root, careers, source, records };
		return records;
	});
	assert.equal(careerExpected.length, 18, 'All official Careers are covered');
	const careerPanel = (id, mode) => careerPage.locator(`#${id}-${mode}`);
	for (const record of careerExpected) {
		for (const mode of [ 0, 1 ]) {
			await careerPanel(record.id, mode).locator('.header-text').first().getByText(record.name.zh, { exact: true }).waitFor();
			await careerPanel(record.id, mode).locator('p').first().getByText(record.description.zh, { exact: true }).waitFor();
		}
	}
	const visibleCareerText = async (id, mode) => ({
		name: (await careerPanel(id, mode).locator('.header-text').first().innerText()).trim(),
		description: (await careerPanel(id, mode).locator('p').first().innerText()).trim().replace(/\s+/g, ' ')
	});
	for (const record of careerExpected) {
		for (const mode of [ 0, 1 ]) assert.deepEqual(await visibleCareerText(record.id, mode), {
			name: record.name.zh,
			description: record.description.zh
		}, `${record.id}:${mode}:zh`);
	}
	await careerPage.evaluate(() => window.careerL10nRegression && import('/src/l10n/language.ts').then(({ setLanguage }) => setLanguage('en')));
	for (const record of careerExpected) {
		for (const mode of [ 0, 1 ]) {
			await careerPanel(record.id, mode).locator('.header-text').first().getByText(record.name.en, { exact: true }).waitFor();
			await careerPanel(record.id, mode).locator('p').first().getByText(record.description.en, { exact: true }).waitFor();
			assert.deepEqual(await visibleCareerText(record.id, mode), {
				name: record.name.en,
				description: record.description.en
			}, `${record.id}:${mode}:en`);
		}
	}
	await careerPage.evaluate(() => import('/src/l10n/language.ts').then(({ setLanguage }) => setLanguage('zh-TW')));
	for (const record of careerExpected) {
		for (const mode of [ 0, 1 ]) {
			await careerPanel(record.id, mode).locator('.header-text').first().getByText(record.name.zh, { exact: true }).waitFor();
			await careerPanel(record.id, mode).locator('p').first().getByText(record.description.zh, { exact: true }).waitFor();
		}
	}
	assert.deepEqual(await careerPage.evaluate(() => window.careerL10nRegression.careers.map(career => ({ name: career.name, description: career.description }))),
		await careerPage.evaluate(() => window.careerL10nRegression.source), 'Career source names and descriptions remain unchanged');
	await careerPage.evaluate(() => { window.careerL10nRegression.root.unmount(); document.querySelector('#career-l10n-regression').remove(); });
	console.log('PASS browser: all 18 Career names and descriptions in compact and full CareerPanel, zh / en / zh, source unchanged');
	assert.deepEqual(errors, [], 'Browser page errors');
	await context.close();
} finally {
	await browser?.close();
	await server.close();
}
