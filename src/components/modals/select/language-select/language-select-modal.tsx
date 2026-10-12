import { Button, Divider, Space } from 'antd';
import { SearchBox, TextInput } from '@/components/controls/text-input/text-input';
import { Expander } from '@/components/controls/expander/expander';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Language } from '@/models/language';
import { LanguageName } from '@/l10n/language-text';
import { LanguageType } from '@/enums/language-type';
import { Markdown } from '@/components/controls/markdown/markdown';
import { Modal } from '@/components/modals/modal/modal';
import { SelectablePanel } from '@/components/controls/selectable-panel/selectable-panel';
import { Utils } from '@/utils/utils';
import { useState } from 'react';
import { useUI } from '@/l10n/ui-text';

import './language-select-modal.scss';

interface Props {
	languages: Language[];
	onClose: () => void;
	onSelect: (language: Language) => void;
}

export const LanguageSelectModal = (props: Props) => {
	const ui = useUI();
	const [ searchTerm, setSearchTerm ] = useState<string>('');
	const [ customLanguage, setCustomLanguage ] = useState<string>('');

	const languages = props.languages
		.filter(l => Utils.textMatches([
			l.name,
			l.description
		], searchTerm));

	return (
		<Modal
			toolbar={
				<SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
			}
			content={
				<div className='language-select-modal'>
					{
						[ LanguageType.Common, LanguageType.Cultural, LanguageType.Regional, LanguageType.Dead ].map(type => {
							const subset = languages.filter(l => l.type === type);
							if (subset.length === 0) {
								return null;
							}

							return (
								<Space key={type} orientation='vertical' style={{ width: '100%' }}>
									<HeaderText level={1}>{
										type === LanguageType.Common
											? ui.text('ui.hero-builder.language-type-common.309955e0', 'Common')
											: type === LanguageType.Cultural
												? ui.text('ui.hero-builder.language-type-cultural.faf2dbb3', 'Cultural')
												: type === LanguageType.Regional
													? ui.text('ui.hero-builder.language-type-regional.299a03b1', 'Regional')
													: ui.text('ui.hero-builder.language-type-dead.ec9b10a4', 'Dead')
									}
									</HeaderText>
									{
										subset.map((l, n) => (
											<SelectablePanel key={n} onSelect={() => props.onSelect(l)}>
												<HeaderText><LanguageName name={l.name} /></HeaderText>
												<Markdown text={l.description} />
											</SelectablePanel>
										))
									}
								</Space>
							);
						})
					}
					<Divider />
					<Expander title={ui.text('ui.hero-builder.add-a-custom-language.155bdaee', 'Add a custom language')}>
						<Space orientation='vertical' style={{ width: '100%' }}>
							<HeaderText>{ui.text('ui.hero-builder.custom-language.1bf43b8b', 'Custom Language')}</HeaderText>
							<TextInput
								placeholder={ui.text('ui.hero-builder.custom-language-name.5b0c1f59', 'Custom Language Name')}
								allowClear={true}
								value={customLanguage}
								onChange={setCustomLanguage}
							/>
							<Button block={true} disabled={!customLanguage} onClick={() => props.onSelect({ name: customLanguage, description: '', type: LanguageType.Cultural, related: [] })}>Select</Button>
						</Space>
					</Expander>
				</div>
			}
			onClose={props.onClose}
		/>
	);
};
