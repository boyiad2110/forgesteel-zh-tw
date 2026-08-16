export interface ProtectedCanonicalState {
	label: string;
	assertUnchanged: () => void;
}

interface ProtectedCanonicalStateOptions<T> {
	label: string;
	capture: () => T;
	equals?: (before: T, after: T) => boolean;
}

interface LocaleDifferentialInvariantScenario {
	protectedStates?: ProtectedCanonicalState[];
	assertZhTW: () => void;
	switchToEnglish: () => void;
	assertEnglish: () => void;
	switchToZhTW: () => void;
	assertZhTWAfterRoundTrip: () => void;
}

const containsCJK = (input: string) => /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/.test(input);

/**
 * Captures a test-defined canonical-state snapshot. Callers can use a serialization, selected
 * fields, or a custom equality predicate instead of assuming that a model is JSON serializable.
 */
export const protectCanonicalState = <T>(options: ProtectedCanonicalStateOptions<T>): ProtectedCanonicalState => {
	const before = options.capture();
	const equals = options.equals ?? Object.is;

	return {
		label: options.label,
		assertUnchanged: () => {
			if (!equals(before, options.capture())) {
				throw new Error(`Protected canonical state changed: ${options.label}`);
			}
		}
	};
};

/** Runs the public locale sequence while checking protected canonical state at every phase. */
export const verifyLocaleDifferentialInvariants = (scenario: LocaleDifferentialInvariantScenario) => {
	const assertProtectedStates = () => scenario.protectedStates?.forEach(state => state.assertUnchanged());

	assertProtectedStates();
	scenario.assertZhTW();
	assertProtectedStates();

	scenario.switchToEnglish();
	scenario.assertEnglish();
	assertProtectedStates();

	scenario.switchToZhTW();
	scenario.assertZhTWAfterRoundTrip();
	assertProtectedStates();
};

/**
 * Use only at known canonical-English calculation boundaries. This is intentionally opt-in so
 * tests do not prohibit CJK in arbitrary English-mode or player-entered text.
 */
export const assertCanonicalEnglishCalculationInput = (input: string) => {
	if (containsCJK(input)) {
		throw new Error('Canonical-English calculation input contains CJK characters');
	}
};
