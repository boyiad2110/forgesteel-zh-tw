import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { localizeUIString } from '@/localization/resolver';
import { useDebounce } from '@/hooks/use-debounce';
import { useLocalization } from '@/contexts/localization-context';

interface Props {
	value: string;
	disabled?: boolean;
	placeholder?: string;
	status?: '' | 'error' | 'warning' | 'success' | 'validating'
	allowClear?: boolean;
	suffix?: ReactNode;
	style?: CSSProperties;
	onChange: (value: string) => void;
}

export const TextInput = (props: Props) => {
	const [ value, setValue ] = useState(props.value);
	const debouncedValue = useDebounce(value);

	useEffect(
		() => setValue(props.value),
		[ props.value ]
	);

	useEffect(
		() => props.onChange(debouncedValue),
		[ debouncedValue ]
	);

	return (
		<Input
			value={value}
			disabled={props.disabled}
			placeholder={props.placeholder}
			status={props.status}
			allowClear={props.allowClear}
			suffix={props.suffix}
			style={props.style}
			onChange={e => setValue(e.target.value)}
		/>
	);
};

interface SearchBoxProps {
	searchTerm: string;
	disabled?: boolean;
	style?: CSSProperties;
	setSearchTerm: (value: string) => void;
}

export const SearchBox = (props: SearchBoxProps) => {
	const { locale } = useLocalization();

	// Only the prompt is read. The search term stays whatever the caller holds, and nothing
	// localized is ever written into it or into what it filters.
	return (
		<TextInput
			placeholder={localizeUIString(locale, 'search-box.placeholder', 'Search')}
			allowClear={true}
			value={props.searchTerm}
			disabled={props.disabled}
			suffix={<SearchOutlined />}
			style={props.style}
			onChange={props.setSearchTerm}
		/>
	);
};
