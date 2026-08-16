import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createLocalizationStatusReport } from './localization-status-report';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { v1LocalizationManifest } from '@/localization/v1-localization-manifest';

/** Loads the live manifest and production catalog without maintaining a status snapshot. */
export const getLiveLocalizationStatusReport = () => createLocalizationStatusReport(analyzeV1LocalizationCompleteness({
	...v1LocalizationManifest,
	catalogEntries: productionLocalizationEntries
}));
