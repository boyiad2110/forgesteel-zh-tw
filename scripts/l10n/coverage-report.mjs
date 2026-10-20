/** Validate and summarize the batch's declared display evidence. Rendering is checked separately. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const positions = [ 'candidate', 'selected', 'summary', 'overview', 'detail', 'classic' ];
const evidenceKinds = [ 'vitest', 'browser' ];
const englishReasons = [ 'unapproved', 'dynamic-unsupported', 'intentional', 'custom' ];
const fallbackCases = [ 'renamed', 'edited-description', 'unknown-id' ];
const contractPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/l10n/coverage-contracts.json');
const defaultDescriptionPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/l10n/default-description-contracts.json');

export const validateCoverageContracts = contract => {
	const errors = [];
	if (!contract || typeof contract.batchId !== 'string' || !contract.batchId.trim() || !Array.isArray(contract.checks) || contract.checks.length === 0) {
		return [ 'batchId and a nonempty checks array are required' ];
	}
	const ids = new Set();
	for (const check of contract.checks) {
		const id = check?.featureId;
		if (typeof id !== 'string' || !id.trim() || ids.has(id)) {
			errors.push(`invalid or repeated featureId: ${id}`);
			continue;
		}
		ids.add(id);
		const fields = check.fields;
		if (!Array.isArray(fields) || fields.length === 0 || new Set(fields).size !== fields.length
			|| fields.some(field => ![ 'name', 'description' ].includes(field))) {
			errors.push(`${id}: fields must be distinct supported fields`);
		}
		for (const field of Array.isArray(fields) ? fields : []) {
			if (typeof check.sourceIds?.[field] !== 'string' || !check.sourceIds[field].trim()) {
				errors.push(`${id}:${field}: approved source ID is required`);
			}
		}
		if (!Array.isArray(check.surfaces) || check.surfaces.length === 0
			|| new Set(check.surfaces).size !== check.surfaces.length
			|| check.surfaces.some(surface => !positions.includes(surface))) {
			errors.push(`${id}: surfaces must be distinct journey positions`);
		}
		if (!check.journey || Object.keys(check.journey).sort().join() !== [ ...positions ].sort().join()) {
			errors.push(`${id}: classify all six journey positions exactly once`);
			continue;
		}
		for (const position of positions) {
			const entry = check.journey[position];
			if (entry?.status === 'verified') {
				const evidence = Array.isArray(entry.evidence) ? entry.evidence : [];
				if (evidence.length === 0 || new Set(evidence).size !== evidence.length
					|| evidence.some(kind => !evidenceKinds.includes(kind))) {
					errors.push(`${id}:${position}: verified position needs distinct Vitest or browser evidence`);
				}
				if (evidence.includes('vitest') !== (Array.isArray(check.surfaces) && check.surfaces.includes(position))) {
					errors.push(`${id}:${position}: Vitest evidence must match the executable surfaces list`);
				}
			} else if (entry?.status === 'not-applicable') {
				if (typeof entry.reason !== 'string' || !entry.reason.trim()) {
					errors.push(`${id}:${position}: not-applicable position needs a reason`);
				}
			} else if (entry?.status === 'english') {
				if (!englishReasons.includes(entry.reason)) {
						errors.push(`${id}:${position}: English fallback needs a recognized reason category`);
				}
			} else {
				errors.push(`${id}:${position}: unresolved or unsupported coverage status`);
			}
		}
		if (!Array.isArray(check.englishFallbacks) || check.englishFallbacks.length !== fallbackCases.length
			|| fallbackCases.some(value => !check.englishFallbacks.includes(value))) {
			errors.push(`${id}: renamed, edited-description, and unknown-id fallback cases are required`);
		}
	}
	return errors;
};

export const formatCoverageReport = contract => {
	const lines = [ `${contract.batchId}: ${contract.checks.length} content check${contract.checks.length === 1 ? '' : 's'}` ];
	for (const check of contract.checks) {
		const states = positions.map(position => {
			const entry = check.journey[position];
			return `${position}=${entry.status}${entry.evidence ? `(${entry.evidence.join('+')})` : entry.reason ? `(${entry.reason})` : ''}`;
		});
		lines.push(`${check.featureId} [${check.fields.join(', ')}]: ${states.join('; ')}`);
		lines.push(`${check.featureId} English protections: ${check.englishFallbacks.join(', ')}`);
	}
	return lines.join('\n');
};

export const readCoverageContracts = (file = contractPath) => JSON.parse(readFileSync(file, 'utf8'));

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const contracts = [ contractPath, defaultDescriptionPath ].map(readCoverageContracts);
	const errors = contracts.flatMap(contract => validateCoverageContracts(contract).map(message => `${contract.batchId}: ${message}`));
	if (errors.length) {
		console.error(errors.join('\n'));
		process.exitCode = 1;
	} else {
		contracts.forEach(contract => console.log(formatCoverageReport(contract)));
	}
}
