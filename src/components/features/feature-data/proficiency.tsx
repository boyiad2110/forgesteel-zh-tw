import { Feature, FeatureProficiencyData } from '@/models/feature';
import { Select, Space } from 'antd';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { KitArmor } from '@/enums/kit-armor';
import { KitWeapon } from '@/enums/kit-weapon';
import { Sourcebook } from '@/models/sourcebook';
import { Utils } from '@/utils/utils';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';

interface InfoProps {
	data: FeatureProficiencyData;
	feature: Feature;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
}

export const InfoProficiency = (props: InfoProps) => {
	const ui = useUI();
	return (
		<>
			{props.data.weapons.length > 0 ? <Field label={ui.text('ui.hero-builder.weapons.3189d297', 'Weapons')} value={props.data.weapons.join(', ')} /> : null}
			{props.data.armor.length > 0 ? <Field label={ui.text('ui.hero-builder.armor.d165ace3', 'Armor')} value={props.data.armor.join(', ')} /> : null}
		</>
	);
};

interface EditProps {
	data: FeatureProficiencyData;
	sourcebooks: Sourcebook[];
	setData: (data: FeatureProficiencyData) => void;
}

export const EditProficiency = (props: EditProps) => {
	const ui = useUI();
	const [ data, setData ] = useState<FeatureProficiencyData>(Utils.copy(props.data));

	const setProficiencyWeapons = (value: KitWeapon[]) => {
		const copy = Utils.copy(data);
		copy.weapons = value;
		setData(copy);
		props.setData(copy);
	};

	const setProficiencyArmor = (value: KitArmor[]) => {
		const copy = Utils.copy(data);
		copy.armor = value;
		setData(copy);
		props.setData(copy);
	};

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			<HeaderText>{ui.text('ui.hero-builder.weapons.3189d297', 'Weapons')}</HeaderText>
			<Select
				style={{ width: '100%' }}
				placeholder={ui.text('ui.hero-builder.weapons.3189d297', 'Weapons')}
				mode='tags'
				allowClear={true}
				options={[ KitWeapon.Bow, KitWeapon.Ensnaring, KitWeapon.Heavy, KitWeapon.Light, KitWeapon.Medium, KitWeapon.Polearm, KitWeapon.Unarmed, KitWeapon.Whip ].map(option => ({ value: option }))}
				optionRender={option => <div className='ds-text'>{option.data.value}</div>}
				value={data.weapons}
				onChange={setProficiencyWeapons}
			/>
			<HeaderText>{ui.text('ui.hero-builder.armor.d165ace3', 'Armor')}</HeaderText>
			<Select
				style={{ width: '100%' }}
				placeholder={ui.text('ui.hero-builder.armor.d165ace3', 'Armor')}
				mode='tags'
				allowClear={true}
				options={[ KitArmor.Heavy, KitArmor.Light, KitArmor.Medium, KitArmor.Shield ].map(option => ({ value: option }))}
				optionRender={option => <div className='ds-text'>{option.data.value}</div>}
				showSearch={true}
				value={data.armor}
				onChange={setProficiencyArmor}
			/>
		</Space>
	);
};
