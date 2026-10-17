import { LabeledBooleanField, LabeledTextField } from '@/components/panels/classic-sheet/components/labeled-field';
import { FeatureComponent } from '@/components/panels/classic-sheet/components/feature-component';
import { HeroLogic } from '@/logic/hero-logic';
import { HeroSheet } from '@/models/classic-sheets/hero-sheet';
import { SheetFormatter } from '@/logic/classic-sheet/sheet-formatter';
import { kitEquipmentLabels, kitFieldLabel, useKitModifierName } from '@/l10n/kit-text';
import { useUI } from '@/l10n/ui-text';

import './modifiers-card.scss';

import rollT1 from '@/assets/icons/power-roll-t1.svg';
import rollT2 from '@/assets/icons/power-roll-t2.svg';
import rollT3 from '@/assets/icons/power-roll-t3.svg';
import { useMemo } from 'react';

interface Props {
	character: HeroSheet;
}

export const ModifiersCard = (props: Props) => {
	const ui = useUI();
	const modifierName = useKitModifierName(props.character.modifierName || '', HeroLogic.getKits(props.character.hero));
	const character = useMemo(
		() => props.character,
		[ props.character ]
	);

	const getModifierNameLabel = () => {
		let label = 'Name';

		if (character.modifierTypes.includes('Kit')) {
			label = kitFieldLabel(ui, 'Kit');
			if (character.modifierName?.includes('&') && ui.language === 'en') {
				label += 's';
			}
		} else if (character.modifierTypes.includes('Augmentation')) {
			label = 'Augmentation';
		} else if (character.modifierTypes.includes('Prayer')) {
			label = 'Prayer';
		} else if (character.modifierTypes.includes('Enchantment')) {
			label = 'Enchantment';
		}

		return label;
	};

	const getKitDamageModificationSection = () => {
		return (
			<>
				<div className='power-roll-damage-modifiers'>
					<h4>{ui.text('ui.hero-builder.classic-melee-damage-bonus.a17961ad', 'Melee Damage Bonus')}</h4>
					<div className='roll-tiers'>
						<div className='tier t1'>
							<div className='effect'>{SheetFormatter.addSign(character.modifierMeleeDamageT1)}</div>
							<img src={rollT1} alt='≤ 11' className='range' />
						</div>
						<div className='tier t2'>
							<div className='effect'>{SheetFormatter.addSign(character.modifierMeleeDamageT2)}</div>
							<img src={rollT2} alt='12 - 16' className='range' />
						</div>
						<div className='tier t3'>
							<div className='effect'>{SheetFormatter.addSign(character.modifierMeleeDamageT3)}</div>
							<img src={rollT3} alt='17 +' className='range' />
						</div>
					</div>
				</div>
				<div className='power-roll-damage-modifiers'>
					<h4>{ui.text('ui.hero-builder.classic-ranged-damage-bonus.0ea33528', 'Ranged Damage Bonus')}</h4>
					<div className='roll-tiers'>
						<div className='tier t1'>
							<div className='effect'>{SheetFormatter.addSign(character.modifierRangedDamageT1)}</div>
							<img src={rollT1} alt='≤ 11' className='range' />
						</div>
						<div className='tier t2'>
							<div className='effect'>{SheetFormatter.addSign(character.modifierRangedDamageT2)}</div>
							<img src={rollT2} alt='12 - 16' className='range' />
						</div>
						<div className='tier t3'>
							<div className='effect'>{SheetFormatter.addSign(character.modifierRangedDamageT3)}</div>
							<img src={rollT3} alt='17 +' className='range' />
						</div>
					</div>
				</div>
			</>
		);
	};

	let bothWeaponArmor = true;
	let onlyWeaponImplement = false;
	let onlyArmorWard = false;
	if (!character.modifierWeaponImplement?.length || !character.modifierArmorWard?.length) {
		if (character.modifierWeaponImplement?.length) {
			onlyWeaponImplement = true;
			bothWeaponArmor = false;
		}
		if (character.modifierArmorWard?.length) {
			onlyArmorWard = true;
			bothWeaponArmor = false;
		}
	}

	return (
		<div className='modifiers card'>
			<h2>
				<div className='title'>{ui.text('ui.hero-builder.classic-equipment-and-modifiers.94215895', 'Equipment and Modifiers')}</div>
				<LabeledBooleanField
					label={kitFieldLabel(ui, 'Kit')}
					value={character.modifierTypes?.includes('Kit')}
				/>
			</h2>
			<LabeledTextField
				label={getModifierNameLabel()}
				content={modifierName}
				additionalClasses={[ 'name', 'label-overlay' ]}
			/>

			<div className='modifier-augmentations'>
				<div className={`proficiencies ${!bothWeaponArmor ? 'single' : null}`}>
					{
						bothWeaponArmor || onlyWeaponImplement ?
							<LabeledTextField
								label={ui.text('ui.hero-builder.classic-weapon-implement.23348605', 'Weapon / Implement')}
								content={character.modifierWeaponImplement ? kitEquipmentLabels(character.modifierWeaponImplement.split(', ')) : character.modifierWeaponImplement}
								additionalClasses={[ 'label-overlay' ]}
							/>
							: null
					}
					{
						bothWeaponArmor || onlyArmorWard ?
							<LabeledTextField
								label={ui.text('ui.hero-builder.classic-armor-ward.cc07ef85', 'Armor / Ward')}
								content={character.modifierArmorWard ? kitEquipmentLabels(character.modifierArmorWard.split(', ')) : character.modifierArmorWard}
								additionalClasses={[ 'label-overlay' ]}
							/>
							: null
					}
				</div>

				<div className='stats'>
					<LabeledTextField
						label={kitFieldLabel(ui, 'Speed')}
						content={SheetFormatter.addSign(character.modifierSpeed)}
					/>
					<LabeledTextField
						label={kitFieldLabel(ui, 'Disengage')}
						content={SheetFormatter.addSign(character.modifierDisengage)}
					/>
					<LabeledTextField
						label={kitFieldLabel(ui, 'Stamina')}
						content={SheetFormatter.addSign(character.modifierStamina)}
					/>
					<LabeledTextField
						label={kitFieldLabel(ui, 'Stability')}
						content={SheetFormatter.addSign(character.modifierStability)}
					/>
					<LabeledTextField
						label={kitFieldLabel(ui, 'Melee Distance')}
						content={SheetFormatter.addSign(character.modifierMeleeDistance)}
					/>
					<LabeledTextField
						label={kitFieldLabel(ui, 'Ranged Distance')}
						content={SheetFormatter.addSign(character.modifierRangedDistance)}
					/>
				</div>
			</div>

			<div className='effects'>
				<div className='damage-modifiers'>
					{getKitDamageModificationSection()}
				</div>

				<div className='benefits'>
					<h3>{ui.text('ui.hero-builder.classic-effects.358511c8', 'Effects')}</h3>
					<div className='features'>
						{character.modifierBenefits?.map(f =>
							<FeatureComponent
								key={f.id}
								hero={character.hero}
								feature={f}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
