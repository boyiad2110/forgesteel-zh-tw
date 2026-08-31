import { Alert, Divider, Space } from 'antd';
import { Analytics } from '@/utils/analytics';
import { Expander } from '@/components/controls/expander/expander';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { Modal } from '@/components/modals/modal/modal';
import { PanelMode } from '@/enums/panel-mode';
import { Perk } from '@/models/perk';
import { PerkList } from '@/enums/perk-list';
import { PerkPanel } from '@/components/panels/elements/perk-panel/perk-panel';
import { SearchBox } from '@/components/controls/text-input/text-input';
import { SelectablePanel } from '@/components/controls/selectable-panel/selectable-panel';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { Utils } from '@/utils/utils';
import { localizeElementField, localizeUIString } from '@/localization/resolver';
import { useLocalization } from '@/contexts/localization-context';
import { useState } from 'react';

import './perk-select-modal.scss';

interface Props {
	perks: Perk[];
	hero: Hero;
	sourcebooks: Sourcebook[];
	onClose: () => void;
	onSelect: (perk: Perk) => void;
}

export const PerkSelectModal = (props: Props) => {
	const { locale } = useLocalization();
	const [ searchTerm, setSearchTerm ] = useState<string>('');
	const localizePerk = (perk: Perk, field: 'name' | 'description') => localizeElementField(locale, perk.id, field, perk[field]);
	const getListLabel = (list: PerkList) => localizeUIString(locale, `perk-list.${list.toLowerCase()}`, list);

	const onSelect = (perk: Perk) => {
		Analytics.logElementSelected(perk, 'Perk');
		props.onSelect(perk);
	};

	const perks = props.perks
		.filter(p => Utils.textMatches([
			p.name,
			p.description,
			localizePerk(p, 'name'),
			localizePerk(p, 'description')
		], searchTerm));
	const selectedPerkIDs = new Set(props.perks.map(perk => perk.id));
	const otherPerks = SourcebookLogic.getPerks(props.sourcebooks)
		.filter(perk => !selectedPerkIDs.has(perk.id))
		.filter(os => Utils.textMatches([
			os.name,
			os.description,
			localizePerk(os, 'name'),
			localizePerk(os, 'description')
		], searchTerm));

	return (
		<Modal
			toolbar={
				<SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
			}
			content={
				<div className='perk-select-modal'>
					{
						[ PerkList.Crafting, PerkList.Exploration, PerkList.Interpersonal, PerkList.Intrigue, PerkList.Lore, PerkList.Supernatural, PerkList.Special ].map(list => {
							const subset = perks.filter(p => p.list === list);
							if (subset.length === 0) {
								return null;
							}

							return (
								<Space key={list} orientation='vertical' style={{ width: '100%' }}>
									<HeaderText level={1}>{getListLabel(list)}</HeaderText>
									{
										subset.map(p => (
											<SelectablePanel key={p.id} onSelect={() => onSelect(p)}>
												<PerkPanel perk={p} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} />
											</SelectablePanel>
										))
									}
								</Space>
							);
						})
					}
					{
						otherPerks.length > 0 ?
							<>
								<Divider />
								<Expander title={localizeUIString(locale, 'perk-select.other-perks', 'Other Perks')}>
									<Space orientation='vertical' style={{ width: '100%' }}>
										<Alert
											type='warning'
											showIcon={true}
											title={localizeUIString(locale, 'perk-select.outside-listed-groups-warning', 'Selecting a perk from outside the listed groups is typically against the rules.')}
										/>
										{
											otherPerks.map(p => (
												<SelectablePanel key={p.id} onSelect={() => onSelect(p)}>
													<PerkPanel perk={p} hero={props.hero} sourcebooks={props.sourcebooks} mode={PanelMode.Full} />
												</SelectablePanel>
											))
										}
									</Space>
								</Expander>
							</>
							: null
					}
				</div>
			}
			onClose={props.onClose}
		/>
	);
};
