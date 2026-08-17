/* eslint-disable sort-imports */

import { AbilityCustomization, Hero } from '@/models/hero';
import { CSSProperties, useState } from 'react';
import { CopyOutlined, ThunderboltFilled, ThunderboltOutlined } from '@ant-design/icons';
import { Pill, ResourcePill } from '@/components/controls/pill/pill';
import { AbilityLogic } from '@/logic/ability-logic';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { ButtonGroup } from '@/components/controls/button-group/button-group';
import { ErrorBoundary } from '@/components/controls/error-boundary/error-boundary';
import { Feature } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Field } from '@/components/controls/field/field';
import { FollowerPanel } from '@/components/panels/elements/follower-panel/follower-panel';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { InfoFeature } from '@/components/features/feature';
import { Markdown } from '@/components/controls/markdown/markdown';
import { PanelMode } from '@/enums/panel-mode';
import { Perk } from '@/models/perk';
import { SheetFormatter } from '@/logic/classic-sheet/sheet-formatter';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizeElementField, localizeUIString } from '@/localization/resolver';
import { useClipboard } from '@/hooks/use-clipboard';
import { useLocalization } from '@/contexts/localization-context';
import { useOptions } from '@/contexts/data-context';

import './feature-panel.scss';

interface Props {
	feature: Feature | Perk;
	source?: string;
	cost?: number | 'signature';
	repeatable?: boolean;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
	mode?: PanelMode;
	style?: CSSProperties;
}

export const FeaturePanel = (props: Props) => {
	const { locale } = useLocalization();
	const [ autoCalc, setAutoCalc ] = useState<boolean>(true);
	const options = useOptions();
	const clipboard = useClipboard();

	const getTags = () => {
		const tags = [];

		const list = (props.feature as Perk).list;
		if (list !== undefined) {
			if (props.sourcebooks && (props.sourcebooks.length > 0)) {
				const sourcebookType = SourcebookLogic.getPerkSourcebook(props.sourcebooks, props.feature as Perk)?.type || SourcebookType.Official;
				if (sourcebookType !== SourcebookType.Official) {
					tags.push(sourcebookType === SourcebookType.Homebrew ? localizeUIString(locale, 'element-header.sourcebook-type.homebrew', 'Homebrew') : sourcebookType);
				}
			}

			tags.push(list);
		}

		if (props.source) {
			tags.push(props.source);
		}

		if (props.feature.type === FeatureType.AddOn) {
			tags.push(props.feature.data.category);
		}

		if (props.feature.type === FeatureType.HeroicResource) {
			switch (props.feature.data.type) {
				case 'heroic':
					tags.push(localizeUIString(locale, 'feature-panel.heroic-resource', 'Heroic Resource'));
					break;
				case 'epic':
					tags.push('Epic Resource');
					break;
			}
		}

		if ((props.feature.type === FeatureType.Malice) || (props.feature.type === FeatureType.MaliceAbility)) {
			if (props.feature.data.echelon > 1) {
				tags.push(`Echelon ${props.feature.data.echelon}`);
			}
		}

		if (props.feature.type === FeatureType.TaggedFeature) {
			tags.push(props.feature.data.tag);
		}

		return tags;
	};

	const autoCalcAvailable = () => {
		return (props.feature.type === FeatureType.Text) && (AbilityLogic.getTextEffect(props.feature.description, props.hero) !== props.feature.description);
	};

	if ((props.feature.type === FeatureType.Ability) || (props.feature.type === FeatureType.MaliceAbility)) {
		return (
			<AbilityPanel
				ability={props.feature.data.ability}
				hero={props.hero}
				cost={props.cost}
				repeatable={props.repeatable}
				mode={PanelMode.Full}
				tags={getTags()}
				style={props.style}
			/>
		);
	}

	if (props.feature.type === FeatureType.AncestryFeatureChoice) {
		if (props.feature.data.selected) {
			return (
				<FeaturePanel feature={props.feature.data.selected} style={props.style} />
			);
		}
	}

	if (props.feature.type === FeatureType.Follower) {
		return (
			<FollowerPanel follower={props.feature.data.follower} mode={PanelMode.Full} />
		);
	}

	let customization: AbilityCustomization | null = null;
	if (props.hero) {
		customization = props.hero.abilityCustomizations.find(ac => ac.abilityID === props.feature.id) || null;
	}

	// A player customization always wins over canonical localization; it's the player's own
	// text, in whichever language they typed it. Falling through to an empty canonical name
	// skips the lookup entirely so it can't shadow the unnamed fallback below.
	const featureName = customization?.name
		|| (props.feature.name ? localizeElementField(locale, props.feature.id, 'name', props.feature.name) : '')
		|| localizeUIString(locale, 'feature-panel.unnamed', 'Unnamed Feature');
	const descriptionSource = customization?.description || props.feature.description;
	const featureDescription = customization?.description || localizeElementField(locale, props.feature.id, 'description', props.feature.description);
	const calculatedDescription = (props.feature.type === FeatureType.Text) && autoCalc && props.hero ?
		AbilityLogic.getTextEffect(descriptionSource, props.hero)
		: null;

	// AbilityLogic only ever sees canonical English (or the player's own text). When a genuine
	// calculation delta exists on canonical content, the calculated English and its raw canonical
	// snapshot go through the shared presenter, which projects only authorized, identity-bound
	// values into the approved zh-TW and otherwise falls back to the complete calculated English.
	// A player customization stays player-owned and is never routed through localization.
	const presentedDescription = (calculatedDescription === null) || (calculatedDescription === descriptionSource) ?
		featureDescription
		: customization?.description ?
			calculatedDescription
			: localizeCalculatedAuthoredTextPresentation({
				locale,
				elementID: props.feature.id,
				field: 'description',
				canonicalEnglish: props.feature.description,
				calculatedEnglish: calculatedDescription
			});

	return (
		<ErrorBoundary>
			<div className={props.mode === PanelMode.Full ? 'feature-panel' : 'feature-panel compact'} id={props.mode === PanelMode.Full ? SheetFormatter.getPageId('feaure', props.feature.id) : undefined} style={props.style}>
				<HeaderText
					ribbon={
						props.cost === 'signature' ?
							<Pill>{localizeUIString(locale, 'feature-panel.signature-badge', 'Signature')}</Pill>
							:
							props.cost ?
								<ResourcePill value={props.cost} repeatable={props.repeatable} />
								: null
					}
					tags={getTags()}
					extra={
						<ButtonGroup
							buttons={[
								autoCalcAvailable() ?
									{
										type: 'button',
										icon: autoCalc ? <ThunderboltFilled style={{ color: 'rgb(22, 119, 255)' }} /> : <ThunderboltOutlined />,
										tooltip: 'Auto-calculate damage, potency, etc',
										onClick: () => setAutoCalc(!autoCalc)
									}
									: null,
								options.showClipboardOptions ?
									{ type: 'button', icon: <CopyOutlined />, tooltip: localizeUIString(locale, 'feature-panel.copy', 'Copy Feature'), onClick: () => clipboard.setData(props.feature) }
									: null
							]}
						/>
					}
				>
					{featureName}
				</HeaderText>
				<Markdown text={presentedDescription} />
				{
					props.mode === PanelMode.Full ?
						<InfoFeature
							feature={props.feature}
							hero={props.hero}
							sourcebooks={props.sourcebooks}
						/>
						: null
				}
				{
					customization && customization.notes ?
						<Field
							label={localizeUIString(locale, 'feature-panel.notes', 'Notes')}
							value={<Markdown text={customization.notes} useSpan={true} />}
						/>
						: null
				}
			</div>
		</ErrorBoundary>
	);
};
