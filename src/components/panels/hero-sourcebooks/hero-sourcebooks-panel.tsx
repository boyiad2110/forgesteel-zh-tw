import { Button, Divider, Flex, Space, Upload, notification } from 'antd';
import { localizeMessage, localizeUIString } from '@/localization/resolver';
import { DownloadOutlined } from '@ant-design/icons';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Markdown } from '@/components/controls/markdown/markdown';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { Toggle } from '@/components/controls/toggle/toggle';
import { UpdateLogic } from '@/logic/update/update-logic';
import { Utils } from '@/utils/utils';
import { useLocalization } from '@/contexts/localization-context';
import { useState } from 'react';

import './hero-sourcebooks-panel.scss';

const notAvailableTemplate = '{sourcebookType} sourcebooks are not available in this edition.';

// The sourcebook types a hero can draw on, and the heading each one's section carries. The
// SourcebookType value is what filters and compares; the heading beside it is only how that
// section is read.
const sourcebookTypeSections = [
	{ type: SourcebookType.Official, headingKey: 'hero-sourcebooks.type-sourcebooks.official', heading: 'Official Sourcebooks' },
	{ type: SourcebookType.Homebrew, headingKey: 'hero-sourcebooks.type-sourcebooks.homebrew', heading: 'Homebrew Sourcebooks' }
];

interface Props {
	sourcebooks: Sourcebook[];
	sourcebookIDs: string[];
	onImportSourcebook: (sourcebook: Sourcebook) => void;
	onChange: (sourcebookIDs: string[]) => void;
}

export const HeroSourcebooksPanel = (props: Props) => {
	const { locale } = useLocalization();
	const [ ids, setIDs ] = useState<string[]>(Utils.copy(props.sourcebookIDs));

	const toggleSourcebook = (include: boolean, id: string) => {
		const newIDs = include ? [ ...ids, id ] : ids.filter(i => i !== id);
		setIDs(newIDs);
		props.onChange(newIDs);
	};

	return (
		<div className='hero-sourcebooks-panel'>
			<HeaderText>{localizeUIString(locale, 'hero-sourcebooks.title', 'Sourcebooks')}</HeaderText>
			<div className='ds-text'>
				{localizeUIString(locale, 'hero-sourcebooks.explanation', 'This hero can use content from the following sourcebooks:')}
			</div>
			<Space orientation='vertical' style={{ width: '100%' }}>
				{
					sourcebookTypeSections
						.map(section => ({ ...section, sourcebooks: props.sourcebooks.filter(sb => sb.type === section.type).filter(sb => SourcebookLogic.getElements(sb).length > 0) }))
						.filter(item => item.sourcebooks.length > 0)
						.map(item => (
							<div key={item.type} className='sourcebook-type-section'>
								<HeaderText level={3}>
									{localizeUIString(locale, item.headingKey, item.heading)}
								</HeaderText>
								{
									item.sourcebooks.map(sb => (
										<Toggle
											key={sb.id}
											label={<Field label={sb.name || localizeUIString(locale, 'hero-sourcebooks.unnamed', 'Unnamed Sourcebook')} value={<Markdown text={sb.description} useSpan={true} />} />}
											value={ids.includes(sb.id)}
											onChange={value => toggleSourcebook(value, sb.id)}
										/>
									))
								}
							</div>
						))
				}
			</Space>
			<Divider />
			<Flex align='center' gap={10}>
				<div className='ds-text'>
					{localizeUIString(locale, 'hero-sourcebooks.import-explanation', 'If you have a homebrew sourcebook you want to use, and it isn\'t listed here, you can import it now.')}
				</div>
				<Upload
					style={{ width: '100%' }}
					accept='.drawsteel-sourcebook,.ds-sourcebook'
					showUploadList={false}
					beforeUpload={file => {
						file
							.text()
							.then(json => {
								const sourcebook = JSON.parse(json) as Sourcebook;
								sourcebook.id = Utils.guid();
								UpdateLogic.updateSourcebook(sourcebook);
								if (!SourcebookLogic.isSourcebookAllowed(sourcebook)) {
									notification.error({
										title: localizeUIString(locale, 'hero-sourcebooks.not-imported', 'Sourcebook not imported'),
										// The rejected type is named as the canonical value it was rejected for.
										description: localizeMessage(locale, 'hero-sourcebooks.type-not-available', { sourcebookType: sourcebook.type }, notAvailableTemplate),
										placement: 'top'
									});
									return;
								}
								props.onImportSourcebook(sourcebook);
							});
						return false;
					}}
				>
					<Button title={localizeUIString(locale, 'hero-sourcebooks.import', 'Import a sourcebook')} icon={<DownloadOutlined />} />
				</Upload>
			</Flex>
		</div>
	);
};
