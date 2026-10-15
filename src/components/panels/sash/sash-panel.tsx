import './sash-panel.scss';

interface Props {
	monogram: string;
	label?: string;
}

export const SashPanel = (props: Props) => {
	const shown = props.label ?? props.monogram;
	const labeled = shown !== props.monogram && shown.length > 4;
	return (
		<div className={`sash-panel type-${props.monogram.toLowerCase()}${labeled ? ' labeled' : ''}`}>{shown}</div>
	);
};
