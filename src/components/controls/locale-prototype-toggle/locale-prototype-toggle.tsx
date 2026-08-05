import { AppLocale } from '@/localization/prototype-localization';
import { useLocalization } from '@/contexts/localization-context';

export const LocalePrototypeToggle = () => {
	const { locale, setLocale } = useLocalization();
	const setPrototypeLocale = (value: AppLocale) => setLocale(value);

	return (
		<div aria-label='Prototype locale controls' className='locale-prototype-toggle'>
			<span>Prototype locale</span>
			<button aria-pressed={locale === 'en'} onClick={() => setPrototypeLocale('en')} type='button'>EN</button>
			<button aria-pressed={locale === 'zh-TW'} onClick={() => setPrototypeLocale('zh-TW')} type='button'>zh-TW</button>
		</div>
	);
};
