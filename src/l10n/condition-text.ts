import { ConditionType } from '@/enums/condition-type';
import { useL10nText } from '@/l10n/hooks';

const nameKey = (type: ConditionType): string | undefined => {
	switch (type) {
		case ConditionType.Bleeding:
			return 'enum:ConditionType:Bleeding';
		case ConditionType.Dazed:
			return 'enum:ConditionType:Dazed';
		case ConditionType.Frightened:
			return 'enum:ConditionType:Frightened';
		case ConditionType.Grabbed:
			return 'enum:ConditionType:Grabbed';
		case ConditionType.Prone:
			return 'enum:ConditionType:Prone';
		case ConditionType.Restrained:
			return 'enum:ConditionType:Restrained';
		case ConditionType.Slowed:
			return 'enum:ConditionType:Slowed';
		case ConditionType.Taunted:
			return 'enum:ConditionType:Taunted';
		case ConditionType.Weakened:
			return 'enum:ConditionType:Weakened';
		default:
			return undefined;
	}
};

const rulesKey = (type: ConditionType): string | undefined => {
	switch (type) {
		case ConditionType.Bleeding:
			return 'data:ConditionData:bleeding';
		case ConditionType.Dazed:
			return 'data:ConditionData:dazed';
		case ConditionType.Frightened:
			return 'data:ConditionData:frightened';
		case ConditionType.Restrained:
			return 'data:ConditionData:restrained';
		case ConditionType.Slowed:
			return 'data:ConditionData:slowed';
		case ConditionType.Taunted:
			return 'data:ConditionData:taunted';
		case ConditionType.Weakened:
			return 'data:ConditionData:weakened';
		default:
			return undefined;
	}
};

/** The key for a condition's rules, or nothing when that text stays English. */
export const conditionRulesKey = (type: ConditionType): string | undefined => {
	return rulesKey(type);
};

/** The condition name to draw. The value passed in is still the English enum. */
export const ConditionName = (props: { type: ConditionType, english?: string }) => {
	const english = props.english ?? props.type;
	return useL10nText(english === props.type ? nameKey(props.type) : undefined, english);
};

/** The rules paragraph to draw. Unmapped conditions keep `english`. */
export const ConditionRules = (props: { type: ConditionType, english: string }) => {
	return useL10nText(rulesKey(props.type), props.english);
};
