import type { CalculationDisplay } from '@/l10n/catalog';
import bindings from '@/l10n/calculation-bindings.json';

interface CalculationBinding {
	sheetId: string;
	enHash: string;
	sourceHash?: string;
	zhHash: string;
	sourceSpan: number[];
	targetSpan: number[];
	sourceLength: number;
	targetLength: number;
	valueSuffix: string;
	useDisplayTemplate?: boolean;
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

const integerValue = (value: string) => /^-?\d+$/.test(value);

/**
 * Integers the upstream calculator wrote in place of one approved phrase.
 * The first span is the binding's source span. The same phrase may occur
 * again later in that sentence; each occurrence must become its own integer.
 */
const boundValues = (binding: CalculationBinding, canonical: string, calculatedText: string): string[] | null => {
	const [ sourceStart, sourceEnd ] = binding.sourceSpan;
	const prefix = canonical.slice(0, sourceStart);
	const suffix = canonical.slice(sourceEnd);
	if (calculatedText.startsWith(prefix) && calculatedText.endsWith(suffix) && calculatedText.length > prefix.length + suffix.length) {
		const value = calculatedText.slice(prefix.length, calculatedText.length - suffix.length);
		if (integerValue(value)) {
			return [ value ];
		}
	}
	const sourcePhrase = canonical.slice(sourceStart, sourceEnd);
	if (!sourcePhrase || canonical.indexOf(sourcePhrase) !== sourceStart) {
		return null;
	}
	const parts = canonical.split(sourcePhrase);
	if (parts.length < 3) {
		return null;
	}
	let rest = calculatedText;
	const values: string[] = [];
	for (let i = 0; i < parts.length - 1; i++) {
		if (!rest.startsWith(parts[i])) {
			return null;
		}
		rest = rest.slice(parts[i].length);
		const next = parts[i + 1];
		const end = next === '' ? rest.length : rest.indexOf(next);
		if (end < 1) {
			return null;
		}
		const value = rest.slice(0, end);
		if (!integerValue(value)) {
			return null;
		}
		values.push(value);
		rest = rest.slice(end);
	}
	return rest === parts[parts.length - 1] ? values : null;
};

/** The calculated English still differs from its source only by the bound integers. */
export const isProjectedCalculation = (key: string, canonical: string, calculated: string): boolean => {
	const binding = table[key];
	if (!binding || canonical.length !== binding.sourceLength) {
		return false;
	}
	const calculatedText = calculated.slice(calculated.length - calculated.trimStart().length, calculated.trimEnd().length);
	if (calculatedText === canonical) {
		return true;
	}
	return boundValues(binding, canonical, calculatedText) !== null;
};

/**
 * Projects scalars already produced by the upstream English calculator.
 * The guard checks both approved text hashes and the UTF-16 slice positions.
 * No hero data or arithmetic enters this display adapter. One approved phrase
 * may occur more than once; each upstream integer fills that same phrase.
 * Each integer keeps one half-width space on both sides. A different rewrite
 * retains the complete calculated English.
 */
export const projectCalculatedText = (key: string, canonical: string, calculated: string, chinese: string, display?: CalculationDisplay): string => {
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

	const values = boundValues(binding, canonical, calculatedText);
	if (!values) {
		return calculated;
	}
	const [ targetStart, targetEnd ] = binding.targetSpan;
	const targetPhrase = chinese.slice(targetStart, targetEnd);
	if (!targetPhrase || chinese.indexOf(targetPhrase) !== targetStart) {
		return calculated;
	}
	const targetParts = chinese.split(targetPhrase);
	if (targetParts.length !== values.length + 1) {
		return calculated;
	}
	if (values.length === 1 && binding.useDisplayTemplate) {
		if (!display || display.target !== targetPhrase
			|| display.template.split('{value}').length !== 2 || /[{}]/.test(display.template.replace('{value}', ''))) {
			return calculated;
		}
		const replacement = display.template.replace('{value}', values[0]);
		return calculated.slice(0, leadingLength) + chinese.slice(0, targetStart) + replacement + chinese.slice(targetEnd) + calculated.slice(trailingStart);
	}
	if (binding.useDisplayTemplate || display) {
		return calculated;
	}
	let projected = targetParts[0];
	values.forEach((value, index) => {
		const after = targetParts[index + 1];
		projected += spacedInteger(projected, value, binding.valueSuffix, after) + after;
	});
	return calculated.slice(0, leadingLength) + projected + calculated.slice(trailingStart);
};

/**
 * Arabic numerals take one half-width space on each side. Spaces already
 * present in the approved text, or supplied by valueSuffix, are kept once.
 */
const spacedInteger = (before: string, value: string, valueSuffix: string, after: string) => {
	const lead = before.length > 0 && !/\s$/.test(before) ? ' ' : '';
	const trail = valueSuffix.length > 0 ? valueSuffix : (after.length > 0 && !/^\s/.test(after) ? ' ' : '');
	return lead + value + trail;
};
