import {
	assertCanonicalEnglishCalculationInput,
	protectCanonicalState,
	verifyLocaleDifferentialInvariants
} from '@/localization/test-support/localization-differential-invariants';
import { describe, expect, it } from 'vitest';

describe('localization differential invariants', () => {
	it('runs zh-TW to English and back while preserving a protected snapshot', () => {
		const fixture = { canonicalName: 'Storm' };
		let locale = 'zh-TW';
		const phases: string[] = [];

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'fixture', capture: () => fixture.canonicalName }) ],
			assertZhTW: () => {
				phases.push(locale);
			},
			switchToEnglish: () => {
				locale = 'en';
			},
			assertEnglish: () => {
				phases.push(locale);
			},
			switchToZhTW: () => {
				locale = 'zh-TW';
			},
			assertZhTWAfterRoundTrip: () => {
				phases.push(locale);
			}
		});

		expect(phases).toEqual([ 'zh-TW', 'en', 'zh-TW' ]);
	});

	it('detects a deliberately changed protected fixture', () => {
		const fixture = { canonicalName: 'Storm' };

		expect(() => verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'changed fixture', capture: () => fixture.canonicalName }) ],
			assertZhTW: () => {
				fixture.canonicalName = '風暴';
			},
			switchToEnglish: () => {},
			assertEnglish: () => {},
			switchToZhTW: () => {},
			assertZhTWAfterRoundTrip: () => {}
		})).toThrow('Protected canonical state changed: changed fixture');
	});

	it('accepts an explicitly checked canonical-English calculation input', () => {
		expect(() => assertCanonicalEnglishCalculationInput('7 + R damage; push 2')).not.toThrow();
	});

	it('detects a deliberately localized calculation input', () => {
		expect(() => assertCanonicalEnglishCalculationInput('7 傷害；推動 2')).toThrow('Canonical-English calculation input contains CJK characters');
	});
});
