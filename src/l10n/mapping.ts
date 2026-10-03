/**
 * One approved display string.
 *
 * `sheetId` is a row in the generated zh-TW JSON.
 * `enHash` is the sha256 of the Forge Steel English at the moment this row
 * was approved. `scripts/l10n/check.mjs` recomputes that English from
 * upstream data and fails when the hash no longer matches.
 *
 * `stripHeading` marks a rules row whose sheet text starts with a title line
 * and a blank line. Display drops those two lines. The export keeps them.
 */
export interface MappingEntry {
	sheetId: string;
	enHash: string;
	stripHeading?: true;
}

/**
 * Forge Steel display key → approved sheet row.
 *
 * Keys:
 *   element:<id>:<field>   for example element:ancestry-orc:name
 *   enum:<Enum>:<Member>   for example enum:Characteristic:Might
 *   data:<Class>:<field>   for example data:ConditionData:bleeding
 *   ui:<id>                for example ui:library.ancestries
 */
export const mapping: Record<string, MappingEntry> = {
	'enum:ConditionType:Bleeding': { sheetId: 'term.bleeding', enHash: '68a89d8475444066a48efe8debcef05fc25306d5f950db02d9bec6cc3e61e4d4' },
	'data:ConditionData:bleeding': { sheetId: 'heroes.conditions.bleeding.rules', enHash: 'd88a981038c39238673b38ef8d5b4b46b192d0ff55c94b30f72fcb8864cbe8fd', stripHeading: true },
	'enum:ConditionType:Dazed': { sheetId: 'term.dazed', enHash: '885b940d512c1f48cb8a32d5050192046c57facff335b5f4fff97812a057ed69' },
	'data:ConditionData:dazed': { sheetId: 'heroes.conditions.dazed.rules', enHash: '7dbd60a940360411a7d173b55aae6de5625e7c99ee37a77a444fe966a68f2063', stripHeading: true },
	'enum:ConditionType:Frightened': { sheetId: 'term.frightened', enHash: '6ac39a6938218b25279d6d02792cbbf186fec0e9b44e284a7beade23d12d37c5' },
	'data:ConditionData:frightened': { sheetId: 'heroes.conditions.frightened.rules', enHash: '22313b6cda8cc7e5cf075eb06bb1c035eca64ce0c515105bbe79a4c8703841c3', stripHeading: true },
	'enum:ConditionType:Grabbed': { sheetId: 'term.grabbed', enHash: 'cdb542525944d27df3ee03f85782c77de90ede57ba80f8096dd8a475208a14eb' },
	'enum:ConditionType:Prone': { sheetId: 'term.prone', enHash: '4d99dff1fb964110812ea0fbf1dbb836fec22cd3148c5f304feec35c969e88f4' },
	'enum:ConditionType:Restrained': { sheetId: 'term.restrained', enHash: '0b83fa4760bfd0a27819b8527b904ce372cce9abeda90be4f4a2f0907b8d0f55' },
	'data:ConditionData:restrained': { sheetId: 'heroes.conditions.restrained.rules', enHash: '0ecc5f9cd7e868fd7cb9887b9f2b201cada6cdc1ccbe1f4332e7e9ae4fde4ba9', stripHeading: true },
	'enum:ConditionType:Slowed': { sheetId: 'term.slowed', enHash: '851048823b87faa3ea81132afad085f7d46c259da0ce6206e47b865018018f8a' },
	'data:ConditionData:slowed': { sheetId: 'heroes.conditions.slowed.rules', enHash: '5f3c1bcbc07244a573fdeea01fdf556851c0e7d9a393525d370a886996f25975', stripHeading: true },
	'enum:ConditionType:Taunted': { sheetId: 'term.taunted', enHash: '73a737d615833672e97a4f912ae7b6ba7804308c6275a4be329e5ed26cee2d8b' },
	'data:ConditionData:taunted': { sheetId: 'heroes.conditions.taunted.rules', enHash: 'b1b60b06498d1d2d4459c003f912ed2fc157fb6b8811c4ba0b808e2081d13dd7', stripHeading: true },
	'enum:ConditionType:Weakened': { sheetId: 'term.weakened', enHash: '2fabd8091e1d12a5db535d011eafa4581cccbc11c6179c5114e46c0075a44a9d' },
	'data:ConditionData:weakened': { sheetId: 'heroes.conditions.weakened.rules', enHash: 'ea0e2b4c0e17cecdca16fb0f1279b5794d527e79a336ead39bf69af318f0265e', stripHeading: true },
	'enum:Characteristic:Might': { sheetId: 'term.might', enHash: 'f68b032edc2230443f299ef26e02607744624f032195c026102979f51a9570ed' },
	'enum:Characteristic:Agility': { sheetId: 'term.agility', enHash: '49796694dc6770112a10ab0c588fc67e1d793ed6f4fa80184090edcaf9712a12' },
	'enum:Characteristic:Reason': { sheetId: 'term.reason', enHash: 'f81ab834de5f84918dc040b884267c2b61cb1a52d46442de10e97f35a94d0500' },
	'enum:Characteristic:Intuition': { sheetId: 'term.intuition', enHash: '680274b27b43c79375bff96cac66a9b56ccaab7eff364612faf98ada603f7a31' },
	'enum:Characteristic:Presence': { sheetId: 'term.presence', enHash: 'd6b3e8c828d3742089ed59ebbfd89492ec2ce0bc89a19294cae52a6ac233b244' }
};
