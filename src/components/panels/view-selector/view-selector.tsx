import { DesktopOutlined, FilePdfOutlined, FileTextOutlined, PrinterOutlined, TableOutlined } from '@ant-design/icons';
import { Popover, Segmented } from 'antd';
import { ReactNode } from 'react';
import { localizeUIString } from '@/localization/resolver';
import { useLocalization } from '@/contexts/localization-context';

interface Props {
	mode: 'hero' | 'classic' | 'printable';
	value: string;
	onChange: (value: string) => void;
}

export const ViewSelector = (props: Props) => {
	const { locale } = useLocalization();

	// The value is the mode itself: it is what the selector reports, what the page switches
	// on, and what is stored. Only the tooltip above it is read.
	const createOption = (value: string, title: string, icon: ReactNode, key?: string) => {
		return {
			value: value,
			label: (
				<Popover content={key ? localizeUIString(locale, key, title) : title}>
					{icon}
				</Popover>
			)
		};
	};

	const getOptions = () => {
		const options = [
			createOption('modern', 'Interactive View (for on-screen use)', <DesktopOutlined />, 'view-selector.modern')
		];

		switch (props.mode) {
			case 'hero':
				options.push(createOption('classic', 'Classic View (for exporting)', <FilePdfOutlined />, 'view-selector.classic'));
				options.push(createOption('abilities', 'Standard Abilities', <TableOutlined />, 'view-selector.abilities'));
				options.push(createOption('notes', 'Notes', <FileTextOutlined />, 'view-selector.notes'));
				break;
			case 'classic':
				options.push(createOption('classic', 'Classic View (for exporting)', <FilePdfOutlined />, 'view-selector.classic'));
				break;
			case 'printable':
				// Print has no approved reading in this batch, so it stays canonical English.
				options.push(createOption('print', 'Print', <PrinterOutlined />));
				break;
		}

		return options;
	};

	return (
		<Segmented
			block={true}
			options={getOptions()}
			value={props.value}
			onChange={props.onChange}
		/>
	);
};
