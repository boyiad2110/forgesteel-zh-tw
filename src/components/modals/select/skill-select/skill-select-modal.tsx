import { Button, Divider, Space } from 'antd';
import { SearchBox, TextInput } from '@/components/controls/text-input/text-input';
import { Expander } from '@/components/controls/expander/expander';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Markdown } from '@/components/controls/markdown/markdown';
import { Modal } from '@/components/modals/modal/modal';
import { SelectablePanel } from '@/components/controls/selectable-panel/selectable-panel';
import { Skill } from '@/models/skill';
import { SkillList } from '@/enums/skill-list';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { Utils } from '@/utils/utils';
import { localizeSkillField } from '@/localization/resolver';
import { useLocalization } from '@/contexts/localization-context';
import { useState } from 'react';

import './skill-select-modal.scss';

interface Props {
	skills: Skill[];
	sourcebooks: Sourcebook[];
	onClose: () => void;
	onSelect: (skill: Skill) => void;
}

export const SkillSelectModal = (props: Props) => {
	const { locale } = useLocalization();
	const [ searchTerm, setSearchTerm ] = useState<string>('');
	const [ customSkill, setCustomSkill ] = useState<string>('');

	// Display-only readings of a Skill's name / description; the canonical Skill object
	// passed to onSelect, and the values searched against, are never replaced by these.
	const localizedName = (skill: Skill) => localizeSkillField(locale, skill.name, 'name', skill.name);
	const localizedDescription = (skill: Skill) => localizeSkillField(locale, skill.name, 'description', skill.description);

	// Both the canonical English and the current-locale reading are search sources, so a
	// zh-TW search finds the zh-TW name/description while an English search still works.
	const matchesSearch = (skill: Skill) => Utils.textMatches([
		skill.name,
		skill.description,
		localizedName(skill),
		localizedDescription(skill)
	], searchTerm);

	const skills = props.skills
		.filter(matchesSearch);

	const otherSkills = SourcebookLogic.getSkills(props.sourcebooks)
		.filter(os => !props.skills.map(s => s.name).includes(os.name))
		.filter(matchesSearch);

	return (
		<Modal
			toolbar={
				<SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
			}
			content={
				<div className='skill-select-modal'>
					{
						[ SkillList.Crafting, SkillList.Exploration, SkillList.Interpersonal, SkillList.Intrigue, SkillList.Lore ].map(list => {
							const subset = skills.filter(s => s.list === list);
							if (subset.length === 0) {
								return null;
							}

							return (
								<Space key={list} orientation='vertical' style={{ width: '100%' }}>
									<HeaderText level={1}>{list}</HeaderText>
									{
										subset.map((s, n) => (
											<SelectablePanel key={n} onSelect={() => props.onSelect(s)}>
												<HeaderText tags={[ s.list ]}>{localizedName(s)}</HeaderText>
												<Markdown text={localizedDescription(s)} />
											</SelectablePanel>
										))
									}
								</Space>
							);
						})
					}
					{
						otherSkills.length > 0 ?
							<>
								<Divider />
								<Expander title='Other skills'>
									<Space orientation='vertical' style={{ width: '100%' }}>
										{
											otherSkills.map((s, n) => (
												<SelectablePanel key={n} onSelect={() => props.onSelect(s)}>
													<HeaderText tags={[ s.list ]}>{localizedName(s)}</HeaderText>
													<Markdown text={localizedDescription(s)} />
												</SelectablePanel>
											))
										}
									</Space>
								</Expander>
							</>
							: null
					}
					<Divider />
					<Expander title='Add a custom skill'>
						<Space orientation='vertical' style={{ width: '100%' }}>
							<HeaderText>Custom Skill</HeaderText>
							<TextInput
								placeholder='Custom Skill Name'
								allowClear={true}
								value={customSkill}
								onChange={setCustomSkill}
							/>
							<Button block={true} disabled={!customSkill} onClick={() => props.onSelect({ name: customSkill, description: '', list: SkillList.Custom })}>Select</Button>
						</Space>
					</Expander>
				</div>
			}
			onClose={props.onClose}
		/>
	);
};
