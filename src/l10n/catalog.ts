export interface ForgeSteelText {
	basisHash: string;
	en: string;
	zh: string;
}

export interface SheetEntry {
	zh: string;
	en: string;
	updated: string;
	fs?: ForgeSteelText;
}

export type Catalog = Record<string, SheetEntry>;

let catalog: Catalog | null = null;
let loading: Promise<void> | null = null;
let tick = 0;
const subscribers = new Set<() => void>();

/** The loaded sheet, or null when nothing has been fetched yet. */
export const peekCatalog = (): Catalog | null => {
	return catalog;
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
	return typeof forge.basisHash === 'string' && typeof forge.en === 'string' && typeof forge.zh === 'string';
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
		import('@/l10n/generated/zh-TW/strings.json')
	]).then(modules => {
		const loaded: Catalog = {};
		modules.forEach(mod => readEntries(mod.default, loaded));
		catalog = loaded;
		tick += 1;
		subscribers.forEach(onChange => onChange());
	}).catch(() => {
		// Stay on the English string. The settled promise is kept so a render
		// loop does not request the files again.
	});

	return loading;
};
