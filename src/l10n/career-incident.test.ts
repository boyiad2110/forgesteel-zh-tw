import { CareerData } from '@/data/career-data';
import { Catalog } from '@/l10n/catalog';
import { resolveText } from '@/l10n/text';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookType } from '@/enums/sourcebook-type';
import { careerIncidentKeys } from '@/l10n/career-incident';
import { mapping } from '@/l10n/mapping';
import strings from '@/l10n/generated/zh-TW/strings.json';
import { describe, expect, test } from 'vitest';

const catalog = strings as Catalog;
const careers = Object.values(CareerData);
const officialBook = { type: SourcebookType.Official, careers } as Sourcebook;
describe('Career inciting incident localization', () => {
	test('covers every approved event name and description', () => {
		expect(careers).toHaveLength(18);
		expect(careers.flatMap(career => career.incitingIncidents.options)).toHaveLength(108);
		let names = 0;
		let descriptions = 0;

		for (const career of careers) {
			for (const incident of career.incitingIncidents.options) {
				const keys = careerIncidentKeys(career, incident, [ officialBook ]);
				const nameKey = `element:${incident.id}:name`;
				const descriptionKey = `element:${incident.id}:description`;
				const nameId = `heroes.background.career.${career.id.replace('career-', '')}.inciting.${incident.id.split('-ii-')[1]}.name`;
				const descriptionId = nameId.replace(/\.name$/, '.description');
				const name = catalog[nameId];
				expect(keys.nameKey).toBe(nameKey);
				expect(mapping[nameKey]).toMatchObject({ sheetId: nameId, enHash: expect.stringMatching(/^[a-f0-9]{64}$/) });
				expect(name.fs?.en).toBe(incident.name);
				expect(name.fs?.zh).toMatch(/[\u3400-\u9fff]/);
				expect(resolveText('zh-TW', keys.nameKey, incident.name, { [nameKey]: nameId }, catalog)).toBe(name.fs?.zh);
				expect(resolveText('en', keys.nameKey, incident.name, { [nameKey]: nameId }, catalog)).toBe(incident.name);
				names += 1;

				const description = catalog[descriptionId];
				expect(keys.descriptionKey).toBe(descriptionKey);
				expect(mapping[descriptionKey]).toMatchObject({ sheetId: descriptionId, enHash: expect.stringMatching(/^[a-f0-9]{64}$/) });
				expect(description.fs?.en).toBe(incident.description);
				expect(description.fs?.zh).toMatch(/[\u3400-\u9fff]/);
				expect(resolveText('zh-TW', keys.descriptionKey, incident.description, { [descriptionKey]: descriptionId }, catalog)).toBe(description.fs?.zh);
				expect(resolveText('en', keys.descriptionKey, incident.description, { [descriptionKey]: descriptionId }, catalog)).toBe(incident.description);
				descriptions += 1;
			}
		}

		expect(names).toBe(108);
		expect(descriptions).toBe(108);
	});

	test('keeps renamed, rewritten, and non-official incidents in English', () => {
		const career = careers[0];
		const incident = career.incitingIncidents.options[0];
		const changed = { ...incident, description: `${incident.description} Changed.` };
		const renamedCareer = { ...career, name: 'Custom career' };
		const homebrew = { ...officialBook, type: SourcebookType.Homebrew } as Sourcebook;

		expect(careerIncidentKeys(career, changed, [ officialBook ])).toEqual({ nameKey: undefined, descriptionKey: undefined });
		expect(careerIncidentKeys(renamedCareer, incident, [ officialBook ])).toEqual({ nameKey: undefined, descriptionKey: undefined });
		expect(careerIncidentKeys(career, incident, [ homebrew ])).toEqual({ nameKey: undefined, descriptionKey: undefined });
	});
});
