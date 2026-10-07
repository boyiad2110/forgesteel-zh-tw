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

/** Display emphasis does not change the authored English. */
export const plainForLookup = (text: string) => {
	return text
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/<\/?(?:strong|b)>/gi, '');
};

export const hasCalculationBinding = (key: string): boolean => Object.hasOwn(table, key);

/**
 * Projects one scalar already produced by the upstream English calculator.
 * The guard checks both approved text hashes and the UTF-16 slice positions.
 * No hero data or arithmetic enters this display adapter. A different rewrite
 * retains the complete calculated English, rather than hiding its values.
 */
export const projectCalculatedText = (key: string, canonical: string, calculated: string, chinese: string): string => {
	const binding = table[key];
	if (!binding) {
		return plainForLookup(calculated).trim() === plainForLookup(canonical).trim() ? chinese : calculated;
	}
	if (canonical.length !== binding.sourceLength || chinese.length !== binding.targetLength) {
		return calculated;
	}
	const leadingLength = calculated.length - calculated.trimStart().length;
	const trailingStart = calculated.trimEnd().length;
	const calculatedText = calculated.slice(leadingLength, trailingStart);
	if (calculatedText === canonical) {
		return chinese;
	}

	const [ sourceStart, sourceEnd ] = binding.sourceSpan;
	const [ targetStart, targetEnd ] = binding.targetSpan;
	const prefix = canonical.slice(0, sourceStart);
	const suffix = canonical.slice(sourceEnd);
	if (!calculatedText.startsWith(prefix) || !calculatedText.endsWith(suffix) || calculatedText.length <= prefix.length + suffix.length) {
		return calculated;
	}
	const value = calculatedText.slice(prefix.length, calculatedText.length - suffix.length);
	if (!/^-?\d+$/.test(value)) {
		return calculated;
	}
	return calculated.slice(0, leadingLength) + chinese.slice(0, targetStart) + value + binding.valueSuffix + chinese.slice(targetEnd) + calculated.slice(trailingStart);
};
