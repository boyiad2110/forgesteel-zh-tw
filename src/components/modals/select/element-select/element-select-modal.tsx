import { Button, Divider, Space } from 'antd';
import { Markdown, MarkdownEditor } from '@/components/controls/markdown/markdown';
import { SearchBox, TextInput } from '@/components/controls/text-input/text-input';
import { Element } from '@/models/element';
import { Expander } from '@/components/controls/expander/expander';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Modal } from '@/components/modals/modal/modal';
import { SelectablePanel } from '@/components/controls/selectable-panel/selectable-panel';
import { Utils } from '@/utils/utils';
import { useState } from 'react';

import './element-select-modal.scss';

interface Props {
	elements: Element[];
	onClose: () => void;
	onSelect: (element: Element) => void;
	/** Opt-in presentation override: when supplied, the list shows this instead of the Element's own name. The Element handed to onSelect is never affected. */
	getDisplayName?: (element: Element) => string;
	/** Opt-in presentation override: when supplied, the list shows this instead of the Element's own description. The Element handed to onSelect is never affected. */
	getDisplayDescription?: (element: Element) => string;
}

export const ElementSelectModal = (props: Props) => {
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

	const getDisplayName = props.getDisplayName || (e => e.name);
	const getDisplayDescription = props.getDisplayDescription || (e => e.description);

	const elements = props.elements
		.filter(e => Utils.textMatches([
			getDisplayName(e),
			getDisplayDescription(e)
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
							elements.map(e => (
								<SelectablePanel key={e.id} onSelect={() => props.onSelect(e)}>
									<HeaderText>{getDisplayName(e)}</HeaderText>
									<Markdown text={getDisplayDescription(e)} />
								</SelectablePanel>
							))
						}
					</Space>
					<Divider />
					<Expander title='Add a custom element'>
						<Space orientation='vertical' style={{ width: '100%' }}>
							<HeaderText>Name</HeaderText>
							<TextInput
								placeholder='Name'
								allowClear={true}
								value={customElement.name}
								onChange={setCustomName}
							/>
							<HeaderText>Description</HeaderText>
							<MarkdownEditor value={customElement.description} onChange={setCustomDescription} />
							<Button block={true} disabled={!customElement.name} onClick={() => props.onSelect(customElement)}>Select</Button>
						</Space>
					</Expander>
				</div>
			}
			onClose={props.onClose}
		/>
	);
};
