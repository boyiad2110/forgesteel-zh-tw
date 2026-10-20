import { Feature, FeatureAbility, FeatureAbilityDamage, FeatureAbilityDistance, FeatureAncestryChoice, FeatureBonus, FeatureCharacteristicBonus, FeatureChoice, FeatureClassAbility, FeatureCompanion, FeatureConditionImmunity, FeatureDamageModifier, FeatureDomain, FeatureDomainFeature, FeatureFollower, FeatureHeroicResource, FeatureHeroicResourceThreshold, FeatureItemChoice, FeatureKit, FeatureLanguageChoice, FeatureMalice, FeatureMaliceAbility, FeatureMultiple, FeaturePackage, FeaturePerk, FeaturePotencyResistance, FeatureSkillChoice, FeatureSurgeGain, FeatureText } from '@/models/feature';
import { AbilityName, abilityDescriptionKey as getAbilityDescriptionKey, familiarPerLevelLine, familiarSummonLabel, perkGrantLabel, perkGrantUi } from '@/l10n/ability-text';
import { Ability } from '@/models/ability';
import { AbilityComponent } from '@/components/panels/classic-sheet/components/ability-component';
import { AbilityUsage } from '@/enums/ability-usage';
import { Characteristic } from '@/enums/characteristic';
import { ClassicSheetBuilder } from '@/logic/classic-sheet/classic-sheet-builder';
import { ConditionName } from '@/l10n/condition-text';
import { careerBenefitFieldKey } from '@/l10n/career-benefit-ui';
import { DamageModifier } from '@/models/damage-modifier';
import { DamageModifierType } from '@/enums/damage-modifier-type';
import { DamageType } from '@/enums/damage-type';
import { damageModifierFeatureName, damageModifierTypeName, damageTypeName } from '@/l10n/damage-modifier-ui';
import { DrawSteelSymbolText } from '@/components/panels/classic-sheet/components/ds-symbol-text-component';
import { FeatureLogic } from '@/logic/feature-logic';
import { FeatureType } from '@/enums/feature-type';
import { Format } from '@/utils/format';
import { Fragment } from 'react';
import { Hero } from '@/models/hero';
import { HeroLogic } from '@/logic/hero-logic';
import { LanguageName } from '@/l10n/language-text';
import { Markdown } from '@/components/controls/markdown/markdown';
import { ModifierLogic } from '@/logic/modifier-logic';
import { PerkList } from '@/enums/perk-list';
import { PlayerName } from '@/l10n/player-name';
import { SheetFormatter } from '@/logic/classic-sheet/sheet-formatter';
import { SkillList } from '@/enums/skill-list';
import { SkillName } from '@/l10n/skill-text';
import { familiarStaminaKey } from '@/l10n/familiar-stat';
import { officialLanguageChoiceDisplay } from '@/l10n/perk-list-ui';
import { officialPerkDescriptionKey } from '@/l10n/perk-list-ui';
import { perkSkillCountLine } from '@/l10n/perk-list-ui';
import { reusedOfficialPerkName } from '@/l10n/perk-list-ui';
import { ElementScope, L10nText } from '@/l10n/element-scope';
import { getOfficialAncestryFeatureSource } from '@/l10n/official-feature-source';
import { ancestryUiText } from '@/l10n/ancestry-ui';
import { isStandardKitAbility, kitFieldLabel } from '@/l10n/kit-text';
import { useL10nText } from '@/l10n/hooks';
import { Sourcebook } from '@/models/sourcebook';
import { perkCountCategoryLine } from '@/l10n/perk-list-ui';
import { useOptionalSourcebooks } from '@/contexts/data-context';
import { useUI } from '@/l10n/ui-text';

import rollT1 from '@/assets/icons/power-roll-t1.svg';
import rollT2 from '@/assets/icons/power-roll-t2.svg';
import rollT3 from '@/assets/icons/power-roll-t3.svg';

import './feature-component.scss';

interface Props {
	feature: Feature;
	hero?: Hero,
	sourcebooks?: Sourcebook[];
	additionalClasses?: string[];
}

const UnselectedLabel = () => {
	const ui = useUI();
	return ui.text('ui.hero-builder.unselected.26118cfc', 'Unselected');
};

const OfficialPerkName = (props: { feature: { id: string, name: string } }) => {
	const sourcebooks = useOptionalSourcebooks() || [];
	if (getOfficialAncestryFeatureSource(props.feature as Feature, sourcebooks)) {
		return <PlayerName element={props.feature} />;
	}
	const reused = reusedOfficialPerkName(props.feature, sourcebooks);
	if (reused) {
		return reused;
	}
	if (props.feature.id.startsWith('perk-')) {
		return <PlayerName element={props.feature} />;
	}
	return <>{props.feature.name}</>;
};

const BasicFeatureComponent = (feature: Feature, ui: ReturnType<typeof useUI>, descriptionKey?: string) => {
	const typeLabel = familiarSummonLabel(ui, feature) ?? feature.type;
	return (
		<>
			<div className='feature-line'><strong>{`• ${typeLabel}: `}</strong><OfficialPerkName feature={feature} /></div>
			{feature.description ?
				<div className='feature-description'><Markdown text={feature.description} l10nKey={descriptionKey} /></div>
				: undefined}
		</>
	);
};

const ChoiceFeatureComponent = (feature: FeatureChoice | FeatureLanguageChoice | FeatureItemChoice, hero: Hero | undefined, sourcebooks: Sourcebook[]) => {
	let selectedOptions;
	if (feature.data.selected.length > 0) {
		selectedOptions = feature.data.selected.map(s => typeof s === 'string' ? s : s.name).map(s => {
			const shown = feature.type === FeatureType.LanguageChoice ? <LanguageName name={s} /> : s;
			return (<div className='feature-iteration' key={s}>{shown}</div>);
		});
	} else {
		selectedOptions = [
			<div className='feature-iteration no-selection' key='unselected'><UnselectedLabel /></div>
		];
	}
	let ancestryPts = 0;
	if (hero) {
		ancestryPts = HeroLogic.getAncestryPoints(hero);
	}
	const count = feature.data.count === 'ancestry' ? ancestryPts : feature.data.count;
	const languageChoice = feature.id.startsWith('perk-') ? officialLanguageChoiceDisplay(feature, sourcebooks) : {};
	const choiceLine = languageChoice.name
		? `• ${count} ${languageChoice.name}`
		: `• ${feature.data.count} ${SheetFormatter.pluralize(feature.name, count)}`;
	return (
		<>
			<div className='feature-line'>
				{choiceLine}
			</div>
			{selectedOptions}
		</>
	);
};

const AncestryChoiceFeatureComponent = (feature: FeatureAncestryChoice) => {
	return (
		<>
			<div className='feature-line'>
				<strong>• <OfficialPerkName feature={feature} />: </strong>{feature.data.selected ? <PlayerName element={feature.data.selected} /> : null}
			</div>
		</>
	);
};

const isAllSkillLists = (lists: SkillList[]): boolean => {
	return Object.values(SkillList)
		.filter(l => l !== SkillList.Custom)
		.every(l => lists.includes(l));
};

const isAllPerkLists = (lists: PerkList[]): boolean => {
	return Object.values(PerkList).every(l => lists.includes(l));
};

const SkillChoiceFeatureComponent = (feature: FeatureSkillChoice | FeaturePerk, ui: ReturnType<typeof useUI>, descriptionKey?: string) => {
	let listNames;
	let perkLists;
	let choiceType;
	switch (feature.type) {
		case FeatureType.SkillChoice:
			if (!isAllSkillLists(feature.data.listOptions)) {
				listNames = feature.data.listOptions.map(l => l.toString());
			}
			choiceType = 'Skill';
			break;
		case FeatureType.Perk:
			if (!isAllPerkLists(feature.data.lists)) {
				perkLists = feature.data.lists;
			}
			choiceType = 'Perk';
			break;
	}
	const lists = SheetFormatter.joinCommasOr(listNames);
	const skillLine = feature.type === FeatureType.SkillChoice && feature.id.startsWith('perk-')
		? perkSkillCountLine(feature.data.count, feature.data.listOptions.map(list => list.toString()), ui.language)
		: undefined;
	let selectedOptions;
	if (feature.type === FeatureType.Perk && feature.data.selected.length) {
		selectedOptions = feature.data.selected.map(perk => (
			<div className='feature-iteration' key={perk.id}><PlayerName element={perk} /></div>
		));
	} else if (feature.data.selected.length) {
		selectedOptions = feature.data.selected.map(s => typeof s === 'string' ? s : s.name).map(s => {
			return (<div className='feature-iteration' key={s}><SkillName name={s} /></div>);
		});
	} else {
		selectedOptions = [
			<div className='feature-iteration no-selection' key='unselected'><UnselectedLabel /></div>
		];
	}
	return (
		<>
			{feature.id.startsWith('perk-') ? <div className='feature-title'><OfficialPerkName feature={feature} /></div> : null}
			{feature.type === FeatureType.SkillChoice && feature.id.startsWith('perk-') && feature.description ?
				<Markdown text={feature.description} className='feature-description' l10nKey={descriptionKey} />
				: null}
			<div className='feature-line'>
				• {feature.type === FeatureType.Perk
					? perkCountCategoryLine(feature.data.count, perkLists ?? [], ui)
					: skillLine ?? `${feature.data.count} ${lists} ${SheetFormatter.pluralize(choiceType, feature.data.count)}`}
			</div>
			{selectedOptions}
		</>
	);
};

const BonusFeatureComponent = (props: { feature: FeatureBonus, hero?: Hero, sourcebooks?: Sourcebook[], nameKey?: string }) => {
	const ui = useUI();
	const value = props.hero ? ModifierLogic.calculateModifierValue(props.feature.data, props.hero) : props.feature.data.value;
	const ancestrySource = getOfficialAncestryFeatureSource(props.feature, props.sourcebooks || []);
	const staminaKey = familiarStaminaKey(props.feature);
	const label = useL10nText(staminaKey ?? careerBenefitFieldKey(props.feature, props.sourcebooks || []), props.feature.data.field);
	const translatedTitle = useL10nText(staminaKey ?? props.nameKey, props.feature.name);
	const title = ancestrySource?.name === props.feature.name
		? ancestryUiText(props.feature.name, ui) ?? translatedTitle
		: translatedTitle;
	const perLevel = props.feature.id === 'familiar-1' ? familiarPerLevelLine(ui, props.feature.data) : undefined;
	const perEchelon = ancestrySource?.id === 'dwarf-feature-2-5'
		&& props.feature.data.field === 'Stamina' && props.feature.data.valuePerEchelon === 6
		? ancestryUiText('Stamina +6 per echelon', ui)
		: undefined;
	return (
		<>
			<div className='feature-line'><strong>• {title}: </strong>{perEchelon ?? perLevel ?? `${SheetFormatter.addSign(value)} ${label}`}</div>
		</>
	);
};

const CharacteristicBonusFeatureComponent = (feature: FeatureCharacteristicBonus) => {
	return (
		<>
			<div className='feature-line'><strong>• Characteristic Bonus: </strong>{SheetFormatter.addSign(feature.data.value)} {feature.data.characteristic}</div>
		</>
	);
};

const TextFeatureComponent = (feature: FeatureText | FeatureMultiple, descriptionKey?: string) => {
	const familiar = feature.id === 'familiar-2';
	const name = useL10nText(familiar ? 'element:familiar-2:name' : undefined, feature.name);
	return (
		<>
			<div className='feature-title'>{familiar ? name : <OfficialPerkName feature={feature} />}</div>
			<Markdown
				text={feature.description}
				className='feature-description'
				l10nKey={familiar ? 'element:familiar-2:description' : descriptionKey}
			/>
		</>
	);
};

const PackageFeatureComponent = (feature: FeaturePackage, hero: Hero | undefined, name?: string) => {
	const packageContent = hero ?
		HeroLogic.getFeatures(hero)
			.map(f => f.feature)
			.filter(f => f.type === FeatureType.PackageContent)
			.filter(f => f.data.tag === feature.data.tag)
			.map(f => (
				<div className='feature-description' key={f.id}>
					<div className='package-content-name'>{f.name}</div>
					<Markdown text={f.description} />
				</div>
			))
		: null;

	const showPackageContent = !feature.description.includes('class="continued-in-reference"');
	return (
		<>
			<div className='feature-title'>{name ?? <OfficialPerkName feature={feature} />}</div>
			<Markdown
				text={feature.description}
				className='feature-description'
			/>
			{showPackageContent ? packageContent : null}
		</>
	);
};

const AbilityFeatureComponent = (feature: FeatureAbility, ui: ReturnType<typeof useUI>, description: string, officialAncestry = false) => {
	const abilityIcon = SheetFormatter.getAbilityIcon(feature.data.ability);

	const getAbilityType = (ability: Ability) => {
		let type = '';
		if (![ AbilityUsage.NoAction, AbilityUsage.Other ].includes(ability.type.usage)) {
			type = ability.type.usage.toString();
			if (ability.type.free) {
				type = 'Free ' + type;
			}
		}
		if (ability.keywords.includes('Performance')) {
			type = 'Performance';
		}
		return type;
	};

	const type = getAbilityType(feature.data.ability);
	const typeClasses = [ 'type' ];
	typeClasses.push(type.toLocaleLowerCase().split(' ').join('-'));

	return (
		<>
			<div className='feature-title'>
				<img src={abilityIcon} alt='Ability' />
				<span className='ability-name'><AbilityName ability={feature.data.ability} /></span>
				<span className={typeClasses.join(' ')}>{isStandardKitAbility(feature.data.ability) ? kitFieldLabel(ui, type) : officialAncestry ? perkGrantUi(ui, type) : perkGrantLabel(feature.data.ability.id, type, ui)}</span>
			</div>
			<div className='feature-description'><em>{description.replace(/^\s+/, '')}</em></div>
		</>
	);
};

const ClassAbilityFeatureComponent = (feature: FeatureClassAbility) => {
	let abilityCost = Format.capitalize(feature.data.cost.toString());
	if (typeof feature.data.cost === 'number') {
		abilityCost += ' Cost';
	}
	let ability = 'Ability';
	if (feature.data.count > 1) {
		ability = 'Abilities';
	}

	let selectedOptions;
	if (feature.data.selectedIDs.length) {
		selectedOptions = feature.data.selectedIDs.map(s => {
			return (<div className='feature-iteration' key={s}>{s}</div>);
		});
	} else {
		selectedOptions = [
			<div className='feature-iteration no-selection' key='unselected'><UnselectedLabel /></div>
		];
	}
	return (
		<>
			<div className='feature-line'>
				• {abilityCost} Class {ability}:
			</div>
			{selectedOptions}
		</>
	);
};

const AbilityModifierComponent = (feature: FeatureAbilityDamage | FeatureAbilityDistance, hero?: Hero) => {
	const value = hero ? ModifierLogic.calculateModifierValue(feature.data, hero) : feature.data.value;
	const type = feature.type === FeatureType.AbilityDistance ? 'distance' : 'damage';
	return (
		<div className='feature-line'>
			• [{feature.data.keywords.sort(SheetFormatter.sortKeywords).join(' ')}] Abilities: {SheetFormatter.addSign(value)} {type}
		</div>
	);
};

const isPrismaticScalesOption = (id: string) => /^dragon-knight-feature-2-[2-7]$/.test(id);

const PrismaticScalesName = (props: { feature: FeatureDamageModifier }) => {
	return useL10nText(`element:${props.feature.id}:name`, props.feature.name || '');
};

const PrismaticScalesDamageValue = (props: { feature: FeatureDamageModifier, damageType: string, value: number, ui: ReturnType<typeof useUI>, translate: boolean }) => {
	const translatedName = useL10nText(`element:${props.feature.id}:name`, props.feature.name || '');
	const match = translatedName.match(/（([^）]+)）$/);
	const damageType = props.translate
		? damageTypeName(props.ui, props.damageType as DamageType)
		: match?.[1] || props.damageType;
	return <>{damageType} {props.value}</>;
};

const DamageModifierComponent = (feature: FeatureDamageModifier, hero: Hero | undefined, name: string | undefined, ui: ReturnType<typeof useUI>, translate: boolean) => {
	const useChinese = translate && ui.language === 'zh-TW';
	const isPrismaticScales = isPrismaticScalesOption(feature.id);
	const modifiersMap = feature.data.modifiers.reduce((map, m) => {
		const modifiers = map.get(m.type) || [];
		modifiers.push(m);
		map.set(m.type, modifiers);
		return map;
	}, new Map<DamageModifierType, DamageModifier[]>());
	const title = useChinese && (name ?? feature.name) === 'Damage Modifier'
		? damageModifierFeatureName(ui)
		: name ?? <OfficialPerkName feature={feature} />;

	const modifiers = Array.from(modifiersMap.keys()).map(type => {
		const typeMods = modifiersMap.get(type)?.map(m => {
			const value = hero ? ModifierLogic.calculateModifierValue(m, hero) : m.value;
			return (
				<div className={`feature-iteration damage-type ${m.damageType.toLocaleLowerCase()}`} key={`${m.type}-${m.damageType}`}>
					{isPrismaticScales ?
						<PrismaticScalesDamageValue feature={feature} damageType={m.damageType} value={value} ui={ui} translate={useChinese} />
						: `${useChinese ? damageTypeName(ui, m.damageType) : m.damageType} ${value}`}
				</div>
			);
		});
		const typeName = useChinese ? damageModifierTypeName(ui, type) : type;

		return (
			<Fragment key={type}>
				<div className='flex-break' />
				<div className='feature-description'>{useChinese ? `- ${typeName}： ` : `- ${type}: `}</div>
				{typeMods}
			</Fragment>
		);
	});

	return (
		<>
			<div className='feature-title'>{isPrismaticScales ? <PrismaticScalesName feature={feature} /> : title}</div>
			{modifiers}
		</>
	);
};

const DomainFeatureComponent = (feature: FeatureDomain | FeatureDomainFeature) => {
	let selectedOptions;
	if (feature.data.selected.length) {
		selectedOptions = feature.data.selected.map(s => {
			return (<div className='feature-iteration' key={s.id}>{s.name}</div>);
		});
	} else {
		selectedOptions = [
			<div className='feature-iteration no-selection' key='unselected'><UnselectedLabel /></div>
		];
	}
	return (
		<>
			<div className='feature-line'><strong>• {SheetFormatter.pluralize(feature.name, feature.data.count)}:</strong></div>
			{selectedOptions}
		</>
	);
};

const ConditionImmunityFeatureComponent = (feature: FeatureConditionImmunity) => {
	const immunities = feature.data.conditions.map(c => {
		return (<div className='feature-iteration' key={`immunity-${c.toString}`}><ConditionName type={c} /></div>);
	});
	return (
		<>
			<div className='feature-line'><strong>• <OfficialPerkName feature={feature} /></strong>: Immune to </div>
			{immunities}
		</>
	);
};

const HeroicResourceComponent = (feature: FeatureHeroicResource) => {
	return (
		<>
			<div className='feature-line'><strong>{`• ${feature.type}: `}</strong><OfficialPerkName feature={feature} /></div>
			{feature.data.details ?
				<div className='feature-description'>{feature.data.details}</div>
				: undefined}
		</>
	);
};

const HeroicResourceThresholdComponent = (feature: FeatureHeroicResourceThreshold) => {
	const requirement = FeatureLogic.getThresholdRequirement(feature.data)
		+ (feature.data.level > 1 ? ` (level ${feature.data.level}+)` : '');
	return (
		<>
			<div className='feature-line'><strong>{`• ${requirement}: `}</strong>{feature.data.feature.name}</div>
			{SheetFormatter.getThresholdBenefitText(feature.data.feature).map((text, n) =>
				<div className='feature-description' key={n}>{text}</div>
			)}
		</>
	);
};

const SurgeGainFeatureComponent = (feature: FeatureSurgeGain) => {
	return (
		<>
			<div className='feature-title'><OfficialPerkName feature={feature} /></div>
			<div className='feature-description'>{SheetFormatter.getSurgeGainSummary(feature.data)}</div>
			{feature.data.condition ?
				<div className='feature-description'>{feature.data.condition}</div>
				: undefined}
			{feature.description ?
				<Markdown text={feature.description} className='feature-description' />
				: undefined}
		</>
	);
};

const PotencyResistanceFeatureComponent = (feature: FeaturePotencyResistance) => {
	return (
		<>
			<div className='feature-line'><strong>• <OfficialPerkName feature={feature} />: </strong>{SheetFormatter.getPotencyResistanceSummary(feature.data)}</div>
			{feature.description ?
				<div className='feature-description'><L10nText text={feature.description} /></div>
				: undefined}
		</>
	);
};

const KitFeatureComponent = (feature: FeatureKit) => {
	let displayName = feature.name;
	if (!feature.description.length) {
		displayName = 'You can use a Kit';
	}
	return (
		<>
			<div className='feature-line'><strong>{`• ${feature.type}: `}</strong>{displayName}</div>
			{feature.description ?
				<div className='feature-description'>{feature.description}</div>
				: undefined}
		</>
	);
};

const FollowerFeatureComponent = (feature: FeatureFollower) => {
	const follower = feature.data.follower;
	return (
		<div className='feature-line'>
			<strong>• Follower: </strong>
			{follower.name}
			{follower.type ?
				<em> ({follower.type})</em>
				: undefined}
		</div>
	);
};

const CompanionFeatureComponent = (feature: FeatureCompanion) => {
	const companion = feature.data.selected;
	let details;
	if (companion?.retainer) {
		details = <em>{` (Level ${companion.retainer.level} ${companion.role.type} ${companion.role.organization})`}</em>;
	}

	return (
		<div className='feature-line'>
			<strong>• {feature.type}: </strong>
			{companion?.name}
			{details}
		</div>
	);
};

const MaliceFeatureComponent = (feature: FeatureMalice) => {
	const getHeader = (characteristics: Characteristic[]) => {
		if (characteristics.length === 0) {
			return 'Test';
		}
		if (characteristics.length === 5) {
			return 'Highest Characteristic Test';
		}
		return `${characteristics.join(' or ')} Test`;
	};
	const sections = (feature.data.sections ?? []).map((section, n) => (typeof section === 'string') ?
		<Markdown key={n} text={section} className='feature-description' />
		:
		<div className='power-roll' key={n}>
			<div className='header'>{getHeader(section.characteristic)}</div>
			<div className='roll-tiers'>
				<div className='tier t1'>
					<img src={rollT1} alt='≤ 11' className='range' />
					<span className='effect'>
						<DrawSteelSymbolText content={section.tier1} lookFor='potencies' />
					</span>
				</div>
				<div className='tier t2'>
					<img src={rollT2} alt='12 - 16' className='range' />
					<span className='effect'>
						<DrawSteelSymbolText content={section.tier2} lookFor='potencies' />
					</span>
				</div>
				<div className='tier t3'>
					<img src={rollT3} alt='17 +' className='range' />
					<span className='effect'>
						<DrawSteelSymbolText content={section.tier3} lookFor='potencies' />
					</span>
				</div>
			</div>
		</div>
	);
	const iconSrc = SheetFormatter.getIconSrc(feature.data.icon);

	return (
		<div className='feature feature-malice ability' key={feature.id}>
			<img src={iconSrc} className='icon' />
			<div className='details'>
				<div className='header'>
					<label className='name'>{feature.name}</label>
					<div className='ability-type'>
						{feature.data.cost} Malice
					</div>
				</div>
				{sections}
			</div>
		</div>
	);
};

const MaliceAbilityFeatureComponent = (feature: FeatureMaliceAbility) => {
	const abilitySheet = ClassicSheetBuilder.buildAbilitySheet(feature.data.ability, undefined);
	// abilitySheet.abilityType = undefined;
	const icon = SheetFormatter.getAbilityIcon(abilitySheet);

	return (
		<div className='feature feature-malice' key={feature.id}>
			<img src={icon} className='icon' />
			<div className='details'>
				<AbilityComponent
					ability={abilitySheet}
				/>
			</div>
		</div>
	);
};

export const FeatureComponent = (props: Props) => {
	const classes = [ 'feature' ].concat(props.additionalClasses || []).join(' ');
	const feature = props.feature;
	const hero = props.hero;
	const ui = useUI();
	const contextSourcebooks = useOptionalSourcebooks();
	const sourcebooks = props.sourcebooks || contextSourcebooks || [];
	const perkDescriptionKey = feature.id.startsWith('perk-') ? officialPerkDescriptionKey(feature, sourcebooks) : undefined;
	const ancestryFeatureSource = getOfficialAncestryFeatureSource(feature, sourcebooks);
	const ancestryFeature = ancestryFeatureSource !== undefined;
	const ancestryNameKey = ancestryFeature ? `element:${feature.id}:name` : undefined;
	const ancestryDescriptionKey = ancestryFeature ? `element:${feature.id}:description` : undefined;
	const translatedAncestryName = useL10nText(ancestryNameKey, feature.name);
	const ancestryName = ancestryFeatureSource?.name === feature.name
		? ancestryUiText(feature.name.toLocaleUpperCase(), ui) ?? translatedAncestryName
		: translatedAncestryName;
	const ancestryDescription = useL10nText(ancestryDescriptionKey, feature.description);
	const perkDescription = useL10nText(perkDescriptionKey, feature.description);
	const kitAbilityDescriptionKey = feature.type === FeatureType.Ability
		&& isStandardKitAbility(feature.data.ability)
		&& feature.description === feature.data.ability.description
		? getAbilityDescriptionKey(feature.data.ability)
		: undefined;
	const kitAbilityDescription = useL10nText(kitAbilityDescriptionKey, feature.description);
	let content;
	switch (feature.type) {
		case FeatureType.LanguageChoice:
		case FeatureType.Choice:
		case FeatureType.ItemChoice:
			content = ChoiceFeatureComponent(feature, hero, sourcebooks);
			break;
		case FeatureType.AncestryChoice:
			content = AncestryChoiceFeatureComponent(feature);
			break;
		case FeatureType.SkillChoice:
		case FeatureType.Perk:
			content = SkillChoiceFeatureComponent(feature, ui, perkDescriptionKey);
			break;
		case FeatureType.Bonus:
			content = <BonusFeatureComponent feature={feature} hero={hero} sourcebooks={props.sourcebooks} nameKey={ancestryNameKey} />;
			break;
		case FeatureType.CharacteristicBonus:
			content = CharacteristicBonusFeatureComponent(feature);
			break;
		case FeatureType.Text:
			content = TextFeatureComponent(feature, ancestryDescriptionKey ?? perkDescriptionKey);
			break;
		case FeatureType.Package:
			content = PackageFeatureComponent(feature, hero, ancestryFeature ? ancestryName : undefined);
			break;
		case FeatureType.Ability:
			content = AbilityFeatureComponent(feature, ui, ancestryFeature ? ancestryDescription : kitAbilityDescriptionKey ? kitAbilityDescription : perkDescription, ancestryFeature);
			break;
		case FeatureType.ClassAbility:
			content = ClassAbilityFeatureComponent(feature);
			break;
		case FeatureType.AbilityDistance:
		case FeatureType.AbilityDamage:
			content = AbilityModifierComponent(feature, hero);
			break;
		case FeatureType.DamageModifier:
			content = DamageModifierComponent(feature, hero, ancestryFeature ? ancestryName : undefined, ui, ancestryFeature);
			break;
		case FeatureType.Domain:
		case FeatureType.DomainFeature:
			content = DomainFeatureComponent(feature);
			break;
		case FeatureType.ConditionImmunity:
			content = ConditionImmunityFeatureComponent(feature);
			break;
		case FeatureType.HeroicResource:
			content = HeroicResourceComponent(feature);
			break;
		case FeatureType.HeroicResourceThreshold:
			content = HeroicResourceThresholdComponent(feature);
			break;
		case FeatureType.SurgeGain:
			content = SurgeGainFeatureComponent(feature);
			break;
		case FeatureType.PotencyResistance:
			content = PotencyResistanceFeatureComponent(feature);
			break;
		case FeatureType.Kit:
			content = KitFeatureComponent(feature);
			break;
		case FeatureType.Follower:
			content = FollowerFeatureComponent(feature);
			break;
		case FeatureType.Companion:
			content = CompanionFeatureComponent(feature);
			break;
		case FeatureType.Malice:
			content = MaliceFeatureComponent(feature);
			break;
		case FeatureType.MaliceAbility:
			content = MaliceAbilityFeatureComponent(feature);
			break;
		case FeatureType.Multiple:
			content = feature.description ? TextFeatureComponent(feature, ancestryDescriptionKey ?? perkDescriptionKey) : undefined;
			break;
		case FeatureType.PackageContent: // These are brought in as part of the Package
			break;
		default:
			content = BasicFeatureComponent(feature, ui, ancestryDescriptionKey);
			break;
	}
	return (
		<div className={classes} key={feature.id}>
			{ancestryFeature ?
				<ElementScope
					element={feature}
					overlay={feature.description === ancestryFeatureSource.description ? undefined : { description: feature.description }}
					sourcebooks={sourcebooks}
				>
					{content}
				</ElementScope>
				: content}
		</div>
	);
};
