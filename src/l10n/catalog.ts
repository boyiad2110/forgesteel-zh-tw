export interface CalculationDisplay {
	target: string;
	template: string;
}

export interface ForgeSteelText {
	basisHash: string;
	en: string;
	zh: string;
	calculationDisplay?: CalculationDisplay;
}

export interface SheetEntry {
	zh: string;
	en: string;
	updated: string;
	fs?: ForgeSteelText;
}

export type Catalog = Record<string, SheetEntry>;

export interface AdaptationSourceLink {
	order: number;
	sourceId: string;
	enHash: string;
	zhHash: string;
}

export interface UsageAdaptation {
	bookStringId: string;
	en: string;
	zh: string;
	basisHash: string;
	sources: AdaptationSourceLink[];
	calculationDisplay?: CalculationDisplay;
}

let catalog: Catalog | null = null;
let usageAdaptations: Record<string, UsageAdaptation> | null = null;
let loading: Promise<void> | null = null;
let tick = 0;
const subscribers = new Set<() => void>();

/** The loaded sheet, or null when nothing has been fetched yet. */
export const peekCatalog = (): Catalog | null => {
	return catalog;
};

/** A second approved use of a book row, selected by its usage key. */
export const usageAdaptation = {
	peek: (key: string | undefined): UsageAdaptation | undefined => {
		if (!key || !usageAdaptations) {
			return undefined;
		}
		return usageAdaptations[key];
	}
};

export const peekUsageAdaptation = (key: string | undefined): UsageAdaptation | undefined => {
	return usageAdaptation.peek(key);
};

const readSourceLinks = (value: unknown): AdaptationSourceLink[] | undefined => {
	if (!Array.isArray(value)) {
		return [];
	}
	const links: AdaptationSourceLink[] = [];
	for (const item of value) {
		if (!item || typeof item !== 'object') {
			return undefined;
		}
		const source = item as Record<string, unknown>;
		if (typeof source.order !== 'number' || typeof source.sourceId !== 'string'
			|| typeof source.enHash !== 'string' || typeof source.zhHash !== 'string') {
			return undefined;
		}
		links.push({
			order: source.order,
			sourceId: source.sourceId,
			enHash: source.enHash,
			zhHash: source.zhHash
		});
	}
	return links;
};

const readUsageAdaptations = (value: unknown): Record<string, UsageAdaptation> => {
	const map: Record<string, UsageAdaptation> = {};
	if (!value || typeof value !== 'object') {
		return map;
	}
	for (const entry of Object.values(value as Record<string, unknown>)) {
		if (!entry || typeof entry !== 'object') {
			continue;
		}
		const row = entry as Record<string, unknown>;
		const sources = readSourceLinks(row.sources);
		if (typeof row.usageKey !== 'string' || row.usageKey.length === 0
			|| typeof row.bookStringId !== 'string' || typeof row.en !== 'string'
			|| typeof row.zh !== 'string' || typeof row.basisHash !== 'string'
			|| !sources) {
			continue;
		}
		map[row.usageKey] = {
			bookStringId: row.bookStringId,
			en: row.en,
			zh: row.zh,
			basisHash: row.basisHash,
			sources,
			...(row.calculationDisplay && typeof row.calculationDisplay === 'object'
				&& typeof (row.calculationDisplay as Record<string, unknown>).target === 'string'
				&& typeof (row.calculationDisplay as Record<string, unknown>).template === 'string'
				? { calculationDisplay: row.calculationDisplay as CalculationDisplay }
				: {})
		};
	}
	return map;
};

/** Changes when a load finishes, so React can re-render. */
export const getCatalogTick = (): number => {
	return tick;
};

/** Called when the catalog finishes loading. Returns an unsubscribe function. */
export const subscribeToCatalog = (onChange: () => void) => {
	subscribers.add(onChange);
	return () => {
		subscribers.delete(onChange);
	};
};

const isForgeSteelText = (value: unknown): value is ForgeSteelText => {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const forge = value as Record<string, unknown>;
	if (typeof forge.basisHash !== 'string' || typeof forge.en !== 'string' || typeof forge.zh !== 'string') {
		return false;
	}
	if (forge.calculationDisplay === undefined) {
		return true;
	}
	const display = forge.calculationDisplay as CalculationDisplay | null;
	return !!display && typeof display.target === 'string' && typeof display.template === 'string';
};

const isSheetEntry = (value: unknown): value is SheetEntry => {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const entry = value as Record<string, unknown>;
	if (typeof entry.zh !== 'string' || typeof entry.en !== 'string' || typeof entry.updated !== 'string') {
		return false;
	}
	if (entry.fs === undefined) {
		return true;
	}
	return isForgeSteelText(entry.fs);
};

const readEntries = (value: unknown, into: Catalog) => {
	if (!value || typeof value !== 'object') {
		return;
	}
	Object.entries(value).forEach(([ id, entry ]) => {
		if (isSheetEntry(entry)) {
			into[id] = entry;
		}
	});
};

/**
 * Fetches the generated zh-TW JSON once. Callers that have no sheet id yet
 * must not call this: an empty mapping table never needs the files.
 */
export const loadCatalog = (): Promise<void> => {
	if (catalog) {
		return Promise.resolve();
	}

	loading ??= Promise.all([
		import('@/l10n/generated/zh-TW/glossary.json'),
		import('@/l10n/generated/zh-TW/names.json'),
		import('@/l10n/generated/zh-TW/strings.json'),
		import('@/l10n/generated/zh-TW/ui.json'),
		import('@/l10n/generated/zh-TW/adaptations.json')
	]).then(modules => {
		const loaded: Catalog = {};
		modules.slice(0, 4).forEach(mod => readEntries(mod.default, loaded));
		usageAdaptations = readUsageAdaptations(modules[4].default);
		catalog = loaded;
		tick += 1;
		subscribers.forEach(onChange => onChange());
	}).catch(() => {
		// Stay on the English string. The settled promise is kept so a render
		// loop does not request the files again.
	});

	return loading;
};
