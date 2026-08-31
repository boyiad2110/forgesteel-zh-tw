import { Button, Drawer, Select, Space } from 'antd';
import { Feature, FeaturePerkData } from '@/models/feature';
import { localizeElementField, localizeMessage, localizeUIString } from '@/localization/resolver';
import { Collections } from '@/utils/collections';
import { Empty } from '@/components/controls/empty/empty';
import { FeatureType } from '@/enums/feature-type';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { HeroLogic } from '@/logic/hero-logic';
import { Markdown } from '@/components/controls/markdown/markdown';
import { Modal } from '@/components/modals/modal/modal';
import { NumberSpin } from '@/components/controls/number-spin/number-spin';
import { PanelMode } from '@/enums/panel-mode';
import { Perk } from '@/models/perk';
import { PerkList } from '@/enums/perk-list';
import { PerkPanel } from '@/components/panels/elements/perk-panel/perk-panel';
import { PerkSelectModal } from '@/components/modals/select/perk-select/perk-select-modal';
import { SelectionBox } from '@/components/panels/feature-config-panel/feature-config-panel';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { Utils } from '@/utils/utils';
import { useLocalization } from '@/contexts/localization-context';
import { useState } from 'react';

interface InfoProps {
	data: FeaturePerkData;
	feature: Feature;
	hero?: Hero;
	sourcebooks?: Sourcebook[];
}

export const InfoPerk = (props: InfoProps) => {
	const { locale } = useLocalization();

	if (props.data.selected.length > 0) {
		return (
			<Space orientation='vertical' style={{ width: '100%' }}>
				{
					props.data.selected.map(p => <PerkPanel key={p.id} perk={p} sourcebooks={props.sourcebooks || []} />)
				}
			</Space>
		);
	}

	return (
		<div className='ds-text'>
			{props.data.count > 1 ?
				localizeMessage(locale, 'info-perk.choose-many', { count: props.data.count.toString() }, 'Choose {count} perks.') :
				localizeUIString(locale, 'info-perk.choose-one', 'Choose a perk.')}
		</div>
	);
};

interface EditProps {
	data: FeaturePerkData;
	sourcebooks: Sourcebook[];
	setData: (data: FeaturePerkData) => void;
}

export const EditPerk = (props: EditProps) => {
	const [ data, setData ] = useState<FeaturePerkData>(Utils.copy(props.data));

	const setPerkLists = (value: PerkList[]) => {
		const copy = Utils.copy(data);
		copy.lists = value;
		setData(copy);
		props.setData(copy);
	};

	const setCount = (value: number) => {
		const copy = Utils.copy(data);
		copy.count = value;
		setData(copy);
		props.setData(copy);
	};

	const setSelected = (value: Perk[]) => {
		const copy = Utils.copy(data);
		copy.selected = value;
		setData(copy);
		props.setData(copy);
	};

	const perksInLists = Collections.sort(SourcebookLogic.getPerks(props.sourcebooks).filter(p => data.lists.includes(p.list)), p => p.name);

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			<HeaderText>Lists</HeaderText>
			<Select
				style={{ width: '100%' }}
				status={data.lists.length === 0 ? 'warning' : ''}
				placeholder='Perk lists'
				mode='multiple'
				allowClear={true}
				options={[ PerkList.Crafting, PerkList.Exploration, PerkList.Interpersonal, PerkList.Intrigue, PerkList.Lore, PerkList.Supernatural, PerkList.Special ].map(option => ({ value: option }))}
				optionRender={option => <div className='ds-text'>{option.data.value}</div>}
				value={data.lists}
				onChange={setPerkLists}
			/>
			<HeaderText>Count</HeaderText>
			<NumberSpin min={1} value={data.count} onChange={setCount} />
			<HeaderText>Default Selection</HeaderText>
			<Select
				style={{ width: '100%' }}
				placeholder='Perks'
				mode='multiple'
				allowClear={true}
				options={perksInLists.map(p => ({ label: p.name, value: p.id, desc: p.description }))}
				optionRender={option => <Field label={option.data.label} value={option.data.desc} />}
				value={data.selected.map(p => p.id)}
				onChange={ids => setSelected(ids.map(id => SourcebookLogic.getPerks(props.sourcebooks).find(p => p.id === id)).filter(p => !!p).map(Utils.copy))}
			/>
		</Space>
	);
};

interface ConfigProps {
	data: FeaturePerkData;
	feature: Feature;
	hero: Hero;
	sourcebooks: Sourcebook[];
	setData: (data: FeaturePerkData) => void;
}

export const ConfigPerk = (props: ConfigProps) => {
	const { locale } = useLocalization();
	const [ perkSelectorOpen, setPerkSelectorOpen ] = useState<boolean>(false);
	const [ selectedPerk, setSelectedPerk ] = useState<Perk | null>(null);

	const currentPerkIDs = HeroLogic.getFeatures(props.hero)
		.map(f => f.feature)
		.filter(f => f.type === FeatureType.Perk)
		.flatMap(f => f.data.selected)
		.map(p => p.id);

	const perks = SourcebookLogic.getPerks(props.sourcebooks as Sourcebook[]).filter(p => props.data.lists.includes(p.list));
	const sortedPerks = Collections.sort(perks, p => p.name);

	const getAddButton = () => {
		if (sortedPerks.length === 0) {
			return (
				<Empty text={localizeUIString(locale, 'feature-config.no-options', 'There are no options to choose for this feature.')} />
			);
		}

		return (
			<Button className='status-warning' block={true} onClick={() => setPerkSelectorOpen(true)}>
				{localizeUIString(locale, 'config-perk.choose-perk', 'Choose a perk')}
			</Button>
		);
	};

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			{props.data.count > 1 ? <div className='ds-text'>{localizeMessage(locale, 'config-perk.choose-count', { count: props.data.count.toString() }, 'Choose {count}:')}</div> : null}
			{
				props.data.selected.map(perk => (
					<SelectionBox
						key={perk.id}
						content={
							<Field
								style={{ flex: '1 1 0' }}
								label={localizeElementField(locale, perk.id, 'name', perk.name)}
								value={<Markdown text={localizeElementField(locale, perk.id, 'description', perk.description)} useSpan={true} />}
							/>
						}
						onSelect={() => setSelectedPerk(perk)}
						onRemove={() => {
							const dataCopy = Utils.copy(props.data);
							dataCopy.selected = dataCopy.selected.filter(p => p.id !== perk.id);
							props.setData(dataCopy);
						}}
					/>
				))
			}
			{
				props.data.selected.length < props.data.count ?
					getAddButton()
					: null
			}
			<Drawer open={perkSelectorOpen} onClose={() => setPerkSelectorOpen(false)} closeIcon={null} size={500}>
				<PerkSelectModal
					perks={sortedPerks.filter(p => !currentPerkIDs.includes(p.id))}
					hero={props.hero}
					sourcebooks={props.sourcebooks}
					onSelect={perk => {
						setPerkSelectorOpen(false);

						const dataCopy = Utils.copy(props.data);
						dataCopy.selected.push(perk);
						props.setData(dataCopy);
					}}
					onClose={() => setPerkSelectorOpen(false)}
				/>
			</Drawer>
			<Drawer open={!!selectedPerk} onClose={() => setSelectedPerk(null)} closeIcon={null} size={500}>
				<Modal
					content={selectedPerk ? <PerkPanel perk={selectedPerk} sourcebooks={props.sourcebooks} mode={PanelMode.Full} /> : null}
					onClose={() => setSelectedPerk(null)}
				/>
			</Drawer>
		</Space>
	);
};
