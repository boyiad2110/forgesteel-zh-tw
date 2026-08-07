import { describe, expect, it } from 'vitest';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { UpdateLogic } from '@/logic/update/update-logic';

// Options as they arrive from storage: a plain object that may predate the locale
// preference, or hold a value that is no longer a supported locale.
const storedOptions = (extra: Record<string, unknown> = {}): Options => {
	return JSON.parse(JSON.stringify({
		cookieConsent: true,
		showDataSource: true,
		xpPerLevel: 32,
		heroCount: 6,
		heroLevel: 3,
		...extra
	})) as Options;
};

describe('FactoryLogic.createOptions locale', () => {
	it('defaults new options to zh-TW', () => {
		expect(FactoryLogic.createOptions().locale).toBe('zh-TW');
	});
});

describe('UpdateLogic.updateOptions locale', () => {
	it('sets zh-TW when stored options have no locale', () => {
		const options = storedOptions();

		UpdateLogic.updateOptions(options);

		expect(options.locale).toBe('zh-TW');
	});

	it('keeps a stored locale that is still supported', () => {
		const english = storedOptions({ locale: 'en' });
		const chinese = storedOptions({ locale: 'zh-TW' });

		UpdateLogic.updateOptions(english);
		UpdateLogic.updateOptions(chinese);

		expect(english.locale).toBe('en');
		expect(chinese.locale).toBe('zh-TW');
	});

	it('recovers to zh-TW for an unsupported locale value without failing', () => {
		[ 'fr', 'zh', 'ZH-TW', '', null, 42, {} ].forEach(value => {
			const options = storedOptions({ locale: value });

			expect(() => UpdateLogic.updateOptions(options)).not.toThrow();
			expect(options.locale).toBe('zh-TW');
		});
	});

	it('leaves the other stored option values alone', () => {
		const options = storedOptions({ locale: 'fr' });

		UpdateLogic.updateOptions(options);

		expect(options.cookieConsent).toBe(true);
		expect(options.showDataSource).toBe(true);
		expect(options.xpPerLevel).toBe(32);
		expect(options.heroCount).toBe(6);
		expect(options.heroLevel).toBe(3);
	});
});
