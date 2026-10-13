import { Career } from '@/models/career';
import { Element } from '@/models/element';
import { ReactNode } from 'react';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { SourcebookType } from '@/enums/sourcebook-type';
import { mapping } from '@/l10n/mapping';
import { useL10nText } from '@/l10n/hooks';

export interface CareerIncidentText {
	id: string;
	name: string;
	description: string;
}

export const careerIncidentKeys = (career: Career | undefined, incident: Element, sourcebooks: Sourcebook[]) => {
	if (!career) {
		return { nameKey: undefined, descriptionKey: undefined };
	}

	const sourcebook = SourcebookLogic.getCareerSourcebook(sourcebooks, career);
	if (sourcebook?.type !== SourcebookType.Official) {
		return { nameKey: undefined, descriptionKey: undefined };
	}

	const officialCareer = sourcebook.careers.find(item => item.id === career.id);
	if (!officialCareer || officialCareer.name !== career.name || officialCareer.description !== career.description) {
		return { nameKey: undefined, descriptionKey: undefined };
	}

	const officialIncident = officialCareer.incitingIncidents.options.find(item => item.id === incident.id);
	if (!officialIncident || officialIncident.name !== incident.name || officialIncident.description !== incident.description) {
		return { nameKey: undefined, descriptionKey: undefined };
	}

	const nameKey = `element:${incident.id}:name`;
	const descriptionKey = `element:${incident.id}:description`;
	return {
		nameKey: mapping[nameKey] ? nameKey : undefined,
		descriptionKey: mapping[descriptionKey] ? descriptionKey : undefined
	};
};

interface Props {
	career?: Career;
	incident: Element;
	sourcebooks: Sourcebook[];
	children: (incident: CareerIncidentText) => ReactNode;
}

/** Render copy for an unmodified official incident while preserving the source object. */
export const CareerIncident = (props: Props) => {
	const keys = careerIncidentKeys(props.career, props.incident, props.sourcebooks);
	const name = useL10nText(keys.nameKey, props.incident.name);
	const description = useL10nText(keys.descriptionKey, props.incident.description);
	return props.children({ ...props.incident, name, description });
};
