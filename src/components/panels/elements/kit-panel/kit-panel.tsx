/* eslint-disable sort-imports */

import { ErrorBoundary } from '@/components/controls/error-boundary/error-boundary';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { Kit } from '@/models/kit';
import { KitArmor } from '@/enums/kit-armor';
import { KitWeapon } from '@/enums/kit-weapon';
import { Markdown } from '@/components/controls/markdown/markdown';
import { PanelMode } from '@/enums/panel-mode';
import { Segmented } from 'antd';
import { SheetFormatter } from '@/logic/classic-sheet/sheet-formatter';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { AppLocale } from '@/localization/locale';
import { localizeElementField, localizeUIString } from '@/localization/resolver';
import { useLocalization } from '@/contexts/localization-context';
import { useState } from 'react';

import './kit-panel.scss';

// How a KitArmor or KitWeapon value reads on screen. The enum value stays exactly what it
// is - it is canonical data, a sort key and a save value - and only this reading changes.
const kitArmorUIKeys: Record<KitArmor, string> = {
	[KitArmor.Light]: 'kit-armor.light',
	[KitArmor.Medium]: 'kit-armor.medium',
	[KitArmor.Heavy]: 'kit-armor.heavy',
	[KitArmor.Shield]: 'kit-armor.shield'
};

const kitWeaponUIKeys: Record<KitWeapon, string> = {
	[KitWeapon.Bow]: 'kit-weapon.bow',
	[KitWeapon.Ensnaring]: 'kit-weapon.ensnaring',
	[KitWeapon.Heavy]: 'kit-weapon.heavy',
	[KitWeapon.Light]: 'kit-weapon.light',
	[KitWeapon.Medium]: 'kit-weapon.medium',
	[KitWeapon.Polearm]: 'kit-weapon.polearm',
	[KitWeapon.Unarmed]: 'kit-weapon.unarmed',
	[KitWeapon.Whip]: 'kit-weapon.whip'
};

// A value outside the enum can only have come from imported or homebrew content, so it is
// shown as authored rather than dropped.
const localizeKitArmor = (locale: AppLocale, armor: KitArmor) => {
	const key = kitArmorUIKeys[armor];
	return key ? localizeUIString(locale, key, armor) : armor;
};

const localizeKitWeapon = (locale: AppLocale, weapon: KitWeapon) => {
	const key = kitWeaponUIKeys[weapon];
	return key ? localizeUIString(locale, key, weapon) : weapon;
};

interface Props {
	kit: Kit;
	sourcebooks: Sourcebook[];
	hero?: Hero;
	mode?: PanelMode;
}

export const KitPanel = (props: Props) => {
	const { locale } = useLocalization();
	const [ page, setPage ] = useState<string>('overview');

	const kitName = props.kit.name
		? localizeElementField(locale, props.kit.id, 'name', props.kit.name)
		: localizeUIString(locale, 'kit-panel.unnamed', 'Unnamed Kit');
	const kitDescription = localizeElementField(locale, props.kit.id, 'description', props.kit.description);
	// The join is over display text only; props.kit.armor and props.kit.weapon keep their
	// canonical enum values and their order.
	const armorReadings = props.kit.armor.map(armor => localizeKitArmor(locale, armor));
	const weaponReadings = props.kit.weapon.map(weapon => localizeKitWeapon(locale, weapon));

	const getOverview = () => {
		return (
			<>
				<Markdown text={kitDescription} />
				<Field label={localizeUIString(locale, 'kit-panel.uses', 'Uses')} value={[ ...armorReadings, ...weaponReadings ].join(', ')} />
				<Field
					label={localizeUIString(locale, 'kit-panel.features', 'Features')}
					value={props.kit.features.map(f => localizeElementField(locale, f.id, 'name', f.name)).join(', ')}
				/>
			</>
		);
	};

	const getStats = () => {
		return (
			<>
				{props.kit.armor.length > 0 ? <Field label={localizeUIString(locale, 'kit-panel.armor', 'Armor')} value={armorReadings.join(', ')} /> : null}
				{props.kit.weapon.length > 0 ? <Field label={localizeUIString(locale, 'kit-panel.weapon', 'Weapon')} value={weaponReadings.join(', ')} /> : null}
				{props.kit.stamina > 0 ? <Field label={localizeUIString(locale, 'kit-panel.stamina', 'Stamina')} value={`+${props.kit.stamina}`} /> : null}
				{props.kit.speed > 0 ? <Field label={localizeUIString(locale, 'kit-panel.speed', 'Speed')} value={`+${props.kit.speed}`} /> : null}
				{props.kit.stability > 0 ? <Field label={localizeUIString(locale, 'kit-panel.stability', 'Stability')} value={`+${props.kit.stability}`} /> : null}
				{
					props.kit.meleeDamage ?
						<Field label={localizeUIString(locale, 'kit-panel.melee-damage', 'Melee Damage')} value={`+${props.kit.meleeDamage.tier1} / +${props.kit.meleeDamage.tier2} / +${props.kit.meleeDamage.tier3}`} />
						: null
				}
				{
					props.kit.rangedDamage ?
						<Field label={localizeUIString(locale, 'kit-panel.ranged-damage', 'Ranged Damage')} value={`+${props.kit.rangedDamage.tier1} / +${props.kit.rangedDamage.tier2} / +${props.kit.rangedDamage.tier3}`} />
						: null
				}
				{props.kit.meleeDistance > 0 ? <Field label={localizeUIString(locale, 'kit-panel.melee-distance', 'Melee Distance')} value={`+${props.kit.meleeDistance}`} /> : null}
				{props.kit.rangedDistance > 0 ? <Field label={localizeUIString(locale, 'kit-panel.ranged-distance', 'Ranged Distance')} value={`+${props.kit.rangedDistance}`} /> : null}
				{props.kit.disengage > 0 ? <Field label={localizeUIString(locale, 'kit-panel.disengage', 'Disengage')} value={`+${props.kit.disengage}`} /> : null}
			</>
		);
	};

	const getFeatures = () => {
		return (
			<>
				{props.kit.features.map(f => <FeaturePanel key={f.id} feature={f} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} />)}
			</>
		);
	};

	const getContent = () => {
		let content = null;
		switch (page) {
			case 'overview':
				content = getOverview();
				break;
			case 'stats':
				content = getStats();
				break;
			case 'features':
				content = getFeatures();
				break;
		}

		return (
			<>
				<Segmented
					style={{ marginBottom: '20px' }}
					block={true}
					// The value is what the panel is on; the label beside it is only how that page reads.
					options={[
						{ value: 'overview', label: localizeUIString(locale, 'kit-panel.overview', 'Overview') },
						{ value: 'stats', label: localizeUIString(locale, 'kit-panel.stats', 'Stats') },
						{ value: 'features', label: localizeUIString(locale, 'kit-panel.features', 'Features') }
					]}
					value={page}
					onChange={setPage}
					onClick={e => e.stopPropagation()}
				/>
				{content}
			</>
		);
	};

	const tags = [];
	if (props.kit.type) {
		tags.push(props.kit.type);
	}
	if (props.sourcebooks.length > 0) {
		const sourcebookType = SourcebookLogic.getKitSourcebook(props.sourcebooks, props.kit)?.type || SourcebookType.Official;
		if (sourcebookType !== SourcebookType.Official) {
			tags.push(sourcebookType);
		}
	}

	if (props.mode !== PanelMode.Full) {
		return (
			<div className='kit-panel compact'>
				<HeaderText level={1} tags={tags}>
					{kitName}
				</HeaderText>
				<Markdown text={kitDescription} />
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<div className='kit-panel' id={SheetFormatter.getPageId('kit', props.kit.id)}>
				<HeaderText level={1} tags={tags}>{kitName}</HeaderText>
				{getContent()}
			</div>
		</ErrorBoundary>
	);
};
