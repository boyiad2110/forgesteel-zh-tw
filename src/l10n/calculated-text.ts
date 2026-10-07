import bindings from '@/l10n/calculation-bindings.json';

interface CalculationBinding {
	sheetId: string;
	enHash: string;
	zhHash: string;
	sourceSpan: number[];
	targetSpan: number[];
	sourceLength: number;
	targetLength: number;
	valueSuffix: string;
}

const table: Record<string, CalculationBinding> = bindings;

/**
 * Projects one scalar already produced by the upstream English calculator.
 * The guard checks both approved text hashes and the UTF-16 slice positions.
 * No hero data or arithmetic enters this display adapter. A different rewrite
 * retains the complete calculated English, rather than hiding its values.
 */
export const projectCalculatedText = (key: string, canonical: string, calculated: string, chinese: string): string => {
	const binding = table[key];
	if (!binding) {
		return chinese;
	}
	if (canonical.length !== binding.sourceLength || chinese.length !== binding.targetLength) {
		return calculated;
	}
	if (calculated === canonical) {
		return chinese;
	}

	const [ sourceStart, sourceEnd ] = binding.sourceSpan;
	const [ targetStart, targetEnd ] = binding.targetSpan;
	const prefix = canonical.slice(0, sourceStart);
	const suffix = canonical.slice(sourceEnd);
	if (!calculated.startsWith(prefix) || !calculated.endsWith(suffix) || calculated.length <= prefix.length + suffix.length) {
		return calculated;
	}
	const value = calculated.slice(prefix.length, calculated.length - suffix.length);
	if (!/^-?\d+$/.test(value)) {
		return calculated;
	}
	return chinese.slice(0, targetStart) + value + binding.valueSuffix + chinese.slice(targetEnd);
};
