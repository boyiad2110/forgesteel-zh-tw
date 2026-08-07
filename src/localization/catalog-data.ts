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
	{ kind: 'ui', key: 'hero-edit.unselect', canonicalEnglish: 'Unselect', zhTW: '取消選擇', approval: 'approved' }
];
