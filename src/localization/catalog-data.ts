import { LocalizationEntry } from '@/localization/catalog';

/**
 * The production zh-TW catalog.
 *
 * It is empty: no game translation has been approved by the project owner yet, so every
 * call site currently resolves to the canonical English it passes in. Later batches add
 * approved entries here; nothing else in the app has to change for them to take effect.
 */
export const productionLocalizationEntries: LocalizationEntry[] = [];
