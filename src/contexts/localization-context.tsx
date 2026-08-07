import { AppLocale, defaultLocale, isAppLocale } from '@/localization/locale';
import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { useDataManager, useOptions } from '@/contexts/data-context';
import { Utils } from '@/utils/utils';

interface LocalizationContextValue {
	locale: AppLocale;
	setLocale: (locale: AppLocale) => void;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export const LocalizationProvider = (props: PropsWithChildren) => {
	const dataManager = useDataManager();
	const options = useOptions();
	// The loaded (and already normalized) options are the initial value; the provider
	// never re-reads them, so saving options cannot restart the app or reload data.
	const [ locale, setLocaleState ] = useState<AppLocale>(() => isAppLocale(options.locale) ? options.locale : defaultLocale);

	const value = useMemo(() => ({
		locale,
		setLocale: (value: AppLocale) => {
			setLocaleState(value);

			const copy = Utils.copy(options);
			copy.locale = value;
			dataManager.saveOptions(copy);
		}
	}), [ dataManager, locale, options ]);

	return <LocalizationContext value={value}>{props.children}</LocalizationContext>;
};

export const useLocalization = () => {
	const context = useContext(LocalizationContext);
	if (!context) {
		throw new Error('useLocalization may only be used within <LocalizationProvider>');
	}
	return context;
};
