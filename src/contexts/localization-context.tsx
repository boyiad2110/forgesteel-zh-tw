import { AppLocale, defaultLocale } from '@/localization/prototype-localization';
import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';

interface LocalizationContextValue {
	locale: AppLocale;
	setLocale: (locale: AppLocale) => void;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export const LocalizationProvider = (props: PropsWithChildren) => {
	const [ locale, setLocale ] = useState<AppLocale>(defaultLocale);
	const value = useMemo(() => ({ locale, setLocale }), [ locale ]);

	return <LocalizationContext value={value}>{props.children}</LocalizationContext>;
};

export const useLocalization = () => {
	const context = useContext(LocalizationContext);
	if (!context) {
		throw new Error('useLocalization may only be used within <LocalizationProvider>');
	}
	return context;
};
