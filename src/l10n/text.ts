import { Catalog, loadCatalog, peekCatalog } from '@/l10n/catalog';
import { Language, getLanguage } from '@/l10n/language';
import { hasCalculationBinding, plainForLookup, projectCalculatedText } from '@/l10n/calculated-text';
import glossary from '@/l10n/generated/zh-TW/glossary.json';
import { mapping } from '@/l10n/mapping';

export interface L10nField {
	field: string;
	text: string;
}

export interface L10nScopeState {
	id: string;
	fields: L10nField[];
}

const blank = (text: string) => {
	return text.trim().length === 0;
};

/**
 * Drop the first line and the blank line under it.
 * The same rule lives in scripts/l10n/check.mjs. Keep the two copies identical.
 */
export const stripRulesHeading = (text: string): string | null => {
	const splitAt = text.indexOf('\n');
	if (splitAt <= 0) {
		return null;
	}
	const rest = text.slice(splitAt + 1);
	if (!rest.startsWith('\n')) {
		return null;
	}
	const body = rest.slice(1);
	if (body.trim().length === 0) {
		return null;
	}
	return body;
};

/**
 * Picks the sheet lookup key for one displayed string.
 *
 * An explicit key wins. Otherwise a matching field produces its
 * `element:<id>:<field>` key. Markdown emphasis the display added is ignored
 * for that comparison. A changed display string may select a key only when
 * the scope has exactly one field with an explicit calculation binding; the
 * projection adapter then validates the computed value. Ambiguous fields
 * and unknown rewrites remain untranslated.
 */
export const displayKey = (explicit: string | undefined, text: string | undefined, scope: L10nScopeState | null): string | undefined => {
	if (explicit) {
		return explicit;
	}
	if (!scope || text === undefined) {
		return undefined;
	}

	const exact = scope.fields.filter(field => field.text === text);
	if (exact.length > 1) {
		return undefined;
	}
	if (exact.length === 1) {
		return `element:${scope.id}:${exact[0].field}`;
	}

	const plain = plainForLookup(text);
	if (plain !== text) {
		const loosened = scope.fields.filter(field => plainForLookup(field.text) === plain);
		if (loosened.length === 1) {
			return `element:${scope.id}:${loosened[0].field}`;
		}
	}

	// Calculated display text may differ from its source field. Only expose a
	// key for a single field with an explicit numeric binding; the projection
	// adapter still rejects every change outside that approved number span.
	const bound = scope.fields.filter(field => hasCalculationBinding(`element:${scope.id}:${field.field}`));
	return bound.length === 1 ? `element:${scope.id}:${bound[0].field}` : undefined;
};

/**
 * Condition words the display bolds, in lowercase, and the glossary rows that
 * name them. The first row is the condition itself. Later rows are longer
 * approved phrases whose unique prefix can stand in when the condition name
 * is not the word this sentence used.
 */
const conditionSheets: Record<string, string[]> = {
	bleeding: [ 'term.bleeding' ],
	dazed: [ 'term.dazed' ],
	frightened: [ 'term.frightened' ],
	grabbed: [ 'term.grabbed', 'term.grab-maneuver' ],
	prone: [ 'term.prone' ],
	restrained: [ 'term.restrained' ],
	slowed: [ 'term.slowed' ],
	taunted: [ 'term.taunted' ],
	weakened: [ 'term.weakened' ]
};

const glossaryZh = glossary as Record<string, { zh?: string }>;

const BOLD_MARK = /\*\*([^*]+)\*\*|<strong>([^<]*)<\/strong>|<b>([^<]*)<\/b>/gi;

const sentencePieces = (text: string) => {
	const parts = text.split(/([。！？]|[.!?](?=\s|$))/);
	const sentences: string[] = [];
	for (let i = 0; i < parts.length; i += 2) {
		const chunk = `${parts[i] ?? ''}${parts[i + 1] ?? ''}`;
		if (chunk.length > 0) {
			sentences.push(chunk);
		}
	}
	return sentences;
};

const termCount = (text: string, term: string) => {
	if (term.length === 0) {
		return 0;
	}
	let count = 0;
	let from = 0;
	while (from < text.length) {
		const index = text.indexOf(term, from);
		if (index < 0) {
			break;
		}
		const wrapped = text.startsWith('**', index - 2) && text.startsWith('**', index + term.length);
		if (!wrapped) {
			count += 1;
		}
		from = index + term.length;
	}
	return count;
};

const wrapTerm = (text: string, term: string) => {
	if (termCount(text, term) !== 1) {
		return null;
	}
	let from = 0;
	while (from < text.length) {
		const index = text.indexOf(term, from);
		if (index < 0) {
			return null;
		}
		const wrapped = text.startsWith('**', index - 2) && text.startsWith('**', index + term.length);
		if (!wrapped) {
			return `${text.slice(0, index)}**${term}**${text.slice(index + term.length)}`;
		}
		from = index + term.length;
	}
	return null;
};

const approvedPhrases = (word: string) => {
	const ids = conditionSheets[word.toLowerCase()];
	if (!ids) {
		return [];
	}
	return ids
		.map(id => glossaryZh[id]?.zh?.trim() ?? '')
		.filter(phrase => phrase.length > 0);
};

/**
 * The Chinese word that should receive this English bold.
 * An approved glossary name wins when it appears once. A longer approved
 * phrase can lend its longest unique prefix when the condition name itself
 * is absent. Two hits, or none, stay plain.
 */
const boldTarget = (region: string, word: string) => {
	const phrases = approvedPhrases(word);
	if (phrases.length === 0) {
		return null;
	}
	if (phrases.some(phrase => termCount(region, phrase) > 1)) {
		return null;
	}
	for (const phrase of phrases) {
		if (termCount(region, phrase) === 1) {
			return phrase;
		}
	}
	let best: string | null = null;
	phrases.slice(1).forEach(phrase => {
		for (let length = phrase.length - 1; length >= 2; length -= 1) {
			const prefix = phrase.slice(0, length);
			if (termCount(region, prefix) !== 1) {
				continue;
			}
			if (!best || prefix.length > best.length) {
				best = prefix;
			}
			break;
		}
	});
	return best;
};

/**
 * Copy condition bolds from the English on screen onto the Chinese.
 * The sheet text is not rewritten. A bold with no single matching word is left off.
 */
const carryConditionBold = (english: string, chinese: string) => {
	if (!/\*\*|<strong>|<b>/i.test(english)) {
		return chinese;
	}
	const enSentences = sentencePieces(english);
	const zhSentences = sentencePieces(chinese);
	const paired = enSentences.length > 0 && enSentences.length === zhSentences.length;
	const regions = paired ?
		enSentences.map((sentence, index) => ({ en: sentence, zh: zhSentences[index] }))
		: [ { en: english, zh: chinese } ];

	return regions.map(region => {
		let zh = region.zh;
		for (const match of region.en.matchAll(BOLD_MARK)) {
			const word = (match[1] ?? match[2] ?? match[3] ?? '').trim();
			const term = boldTarget(zh, word);
			if (!term) {
				continue;
			}
			zh = wrapTerm(zh, term) ?? zh;
		}
		return zh;
	}).join('');
};

/**
 * The string to show. English mode always returns `english`, the exact value
 * the screen already had — never the sheet's own English copy.
 *
 * In zh-TW, a missing key, a missing table row, a sheet id that is not
 * loaded, or a blank translation also returns `english`. A row with a
 * Forge Steel version uses that Chinese. A blank Forge Steel translation
 * returns `english`.
 */
export const resolveText = (language: Language, key: string | undefined, english: string, table: Record<string, string>, catalog: Catalog | null, stripHeading = false): string => {
	if (language === 'en' || !key) {
		return english;
	}

	const sheetId = table[key];
	if (!sheetId || !catalog) {
		return english;
	}

	const row = catalog[sheetId];
	if (row?.fs) {
		if (!row.fs.zh || blank(row.fs.zh)) {
			return english;
		}
		return carryConditionBold(english, projectCalculatedText(key, row.fs.en, english, row.fs.zh));
	}

	const zh = row?.zh;
	if (!zh || blank(zh)) {
		return english;
	}

	if (!stripHeading) {
		return carryConditionBold(english, zh);
	}

	const body = stripRulesHeading(zh);
	if (!body) {
		return english;
	}

	return carryConditionBold(english, body);
};

/**
 * Live lookup used by shared display components. Starts loading the generated
 * JSON only when zh-TW mode has a real sheet id to read. An empty mapping
 * table never loads it.
 */
export const translate = (key: string | undefined, english: string): string => {
	const language = getLanguage();
	const entry = language === 'zh-TW' && key ? mapping[key] : undefined;
	const sheetId = entry?.sheetId;
	if (sheetId && !peekCatalog()) {
		void loadCatalog();
	}

	const table: Record<string, string> = {};
	if (key && sheetId) {
		table[key] = sheetId;
	}

	return resolveText(language, key, english, table, peekCatalog(), entry?.stripHeading === true);
};
