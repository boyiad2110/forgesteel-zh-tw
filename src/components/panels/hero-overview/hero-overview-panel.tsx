import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { ButtonGroup } from '@/components/controls/button-group/button-group';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { HeroOverview } from '@/models/hero';
import { HeroOverviewToken } from '@/components/panels/token/token';
import { localizeUIString } from '@/localization/resolver';
import { useLocalization } from '@/contexts/localization-context';

import './hero-overview-panel.scss';

interface Props {
	hero: HeroOverview;
	visibility?: {
		visible: boolean;
		onSetVisibility: (value: boolean) => void;
	};
}

export const HeroOverviewPanel = (props: Props) => {
	const { locale } = useLocalization();

	// Only the labels and the unnamed fallback are read here. The hero's name, folder and
	// every value beside a label is the hero's own data, and is shown exactly as it is held.
	return (
		<div className='hero-overview-panel'>
			<HeaderText
				level={1}
				strikethrough={!props.hero.isActive}
				ribbon={props.hero.picture ? <HeroOverviewToken hero={props.hero} size={34} /> : null}
				tags={props.hero.folder ? [ props.hero.folder ] : []}
				extra={
					<ButtonGroup
						buttons={[
							props.visibility ?
								{
									type: 'button',
									icon: props.visibility.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />,
									tooltip: localizeUIString(locale, 'hero-overview.show-hide', 'Show / Hide'),
									onClick: () => props.visibility!.onSetVisibility(!props.visibility!.visible)
								}
								: null
						]}
					/>
				}
			>
				{props.hero.name || localizeUIString(locale, 'hero-overview.unnamed', 'Unnamed Hero')}
			</HeaderText>
			{props.hero.ancestry ? <Field compact={true} label={localizeUIString(locale, 'hero-edit.tab.ancestry', 'Ancestry')} value={props.hero.ancestry} /> : null}
			{props.hero.background ? <Field compact={true} label={localizeUIString(locale, 'hero-overview.background', 'Background')} value={props.hero.background} /> : null}
			{props.hero.class ? <Field compact={true} label={localizeUIString(locale, 'hero-edit.tab.class', 'Class')} value={props.hero.class} /> : null}
			{props.hero.complication ? <Field compact={true} label={localizeUIString(locale, 'hero-edit.tab.complication', 'Complication')} value={props.hero.complication} /> : null}
		</div>
	);
};
