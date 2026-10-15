import './sash-panel.scss';

interface Props {
	monogram: string;
	label?: string;
}

export const SashPanel = (props: Props) => {
	return (
		<div className={`sash-panel type-${props.monogram.toLowerCase()}`}>{props.label ?? props.monogram}</div>
	);
};
