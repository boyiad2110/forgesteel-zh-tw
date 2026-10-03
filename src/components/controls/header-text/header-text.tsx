import { CSSProperties, ReactNode } from 'react';
import { Flex, Tag } from 'antd';
import { useDisplayKey, useL10nText } from '@/l10n/hooks';

import './header-text.scss';

interface Props {
	children: ReactNode;
	level?: number;
	strikethrough?: boolean;
	ribbon?: ReactNode;
	tags?: string[];
	extra?: ReactNode;
	style?: CSSProperties;
	l10nKey?: string;
}

export const HeaderText = (props: Props) => {
	const source = typeof props.children === 'string' ? props.children : undefined;
	const key = useDisplayKey(props.l10nKey, source);
	const translated = useL10nText(key, source ?? '');

	if (!props.children) {
		return null;
	}

	const children = source === undefined ? props.children : translated;

	return (
		<div className={`header-text-panel level-${props.level || 2}`} style={props.style}>
			<div className='header-text-content'>
				{props.ribbon}
				<div className={props.strikethrough ? 'header-text strikethrough' : 'header-text'}>{children}</div>
				{
					props.tags ?
						<Flex gap={3}>{props.tags.map((t, n) => <Tag key={n} variant='outlined'>{t}</Tag>)}</Flex>
						: null
				}
			</div>
			{props.extra}
		</div>
	);
};
