import { LocalizationEntry } from '@/localization/catalog';

/**
 * The production zh-TW catalog.
 *
 * It holds only what the project owner has approved; any call site without an entry here
 * still resolves to the canonical English it passes in. Later batches add approved entries
 * here; nothing else in the app has to change for them to take effect.
 */
export const productionLocalizationEntries: LocalizationEntry[] = [
	{ kind: 'ui', key: 'hero-edit.save-changes', canonicalEnglish: 'Save Changes', zhTW: '儲存變更', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.cancel', canonicalEnglish: 'Cancel', zhTW: '取消', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.random', canonicalEnglish: 'Random', zhTW: '隨機選擇', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.unselect', canonicalEnglish: 'Unselect', zhTW: '取消選擇', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.start', canonicalEnglish: 'Start', zhTW: '開始', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.ancestry', canonicalEnglish: 'Ancestry', zhTW: '族裔', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.culture', canonicalEnglish: 'Culture', zhTW: '文化', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.career', canonicalEnglish: 'Career', zhTW: '職業', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.class', canonicalEnglish: 'Class', zhTW: '範型', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.complication', canonicalEnglish: 'Complication', zhTW: '糾葛', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.details', canonicalEnglish: 'Details', zhTW: '細項', approval: 'approved' }
];
