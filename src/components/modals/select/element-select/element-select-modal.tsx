import { Button, Divider, Space } from 'antd';
import { Markdown, MarkdownEditor } from '@/components/controls/markdown/markdown';
import { SearchBox, TextInput } from '@/components/controls/text-input/text-input';
import { Element } from '@/models/element';
import { Expander } from '@/components/controls/expander/expander';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Modal } from '@/components/modals/modal/modal';
import { SelectablePanel } from '@/components/controls/selectable-panel/selectable-panel';
import { Utils } from '@/utils/utils';
import { useUI } from '@/l10n/ui-text';
import { ReactNode } from 'react';
import { useState } from 'react';

import './element-select-modal.scss';

interface Props {
	elements: Element[];
	onClose: () => void;
	onSelect: (element: Element) => void;
	renderElement?: (element: Element) => ReactNode;
}

export const ElementSelectModal = (props: Props) => {
	const ui = useUI();
	const [ searchTerm, setSearchTerm ] = useState<string>('');
	const [ customElement, setCustomElement ] = useState<Element>({ id: Utils.guid(), name: '', description: '' });

	const setCustomName = (value: string) => {
		const copy = Utils.copy(customElement);
		copy.name = value;
		setCustomElement(copy);
	};

	const setCustomDescription = (value: string) => {
		const copy = Utils.copy(customElement);
		copy.description = value;
		setCustomElement(copy);
	};

	const elements = props.elements
		.filter(e => Utils.textMatches([
			e.name,
			e.description
		], searchTerm));

	return (
		<Modal
			toolbar={
				<SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
			}
			content={
				<div className='element-select-modal'>
					<Space orientation='vertical' style={{ width: '100%' }}>
						{
							elements.map(e => {
								const content = props.renderElement?.(e) || [
									<HeaderText key='name'>{e.name}</HeaderText>,
									<Markdown key='description' text={e.description} />
								];
								return <SelectablePanel key={e.id} onSelect={() => props.onSelect(e)}>{content}</SelectablePanel>;
							})
						}
					</Space>
					<Divider />
					<Expander title={ui.text('ui.hero-builder.add-a-custom-element.4555eada', 'Add a custom element')}>
						<Space orientation='vertical' style={{ width: '100%' }}>
							<HeaderText>{ui.text('ui.hero-builder.name.f7c27f51', 'Name')}</HeaderText>
							<TextInput
								placeholder={ui.text('ui.hero-builder.name.f7c27f51', 'Name')}
								allowClear={true}
								value={customElement.name}
								onChange={setCustomName}
							/>
							<HeaderText>{ui.text('ui.hero-builder.description.526e0087', 'Description')}</HeaderText>
							<MarkdownEditor value={customElement.description} onChange={setCustomDescription} />
							<Button block={true} disabled={!customElement.name} onClick={() => props.onSelect(customElement)}>{ui.text('ui.hero-builder.select.ed8e93ef', 'Select')}</Button>
						</Space>
					</Expander>
				</div>
			}
			onClose={props.onClose}
		/>
	);
};
