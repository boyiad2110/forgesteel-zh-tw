import { AppLocale } from '@/localization/locale';
import { Button } from 'antd';
import { useLocalization } from '@/contexts/localization-context';

import './locale-toggle.scss';

interface LocaleToggleOption {
	label: string;
	target: AppLocale;
	action: string;
}

// The visible label is the current locale; the accessible name and tooltip describe
// what a click does, so the current language is never signalled by colour alone.
const options: Record<AppLocale, LocaleToggleOption> = {
	'en': { label: 'EN', target: 'zh-TW', action: 'Switch to Traditional Chinese' },
	'zh-TW': { label: '中文', target: 'en', action: 'Switch to English' }
};

export const LocaleToggle = () => {
	const { locale, setLocale } = useLocalization();
	const option = options[locale];

	return (
		<Button
			className='locale-toggle'
			type='text'
			aria-label={option.action}
			title={option.action}
			onClick={() => setLocale(option.target)}
		>
			{option.label}
		</Button>
	);
};
