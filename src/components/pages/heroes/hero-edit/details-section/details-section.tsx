import { AutoComplete, Button, Flex, Space, Upload } from 'antd';
import { CheckIcon } from '@/components/controls/check-icon/check-icon';
import { Collections } from '@/utils/collections';
import { DangerButton } from '@/components/controls/danger-button/danger-button';
import { DownloadOutlined } from '@ant-design/icons';
import { Empty } from '@/components/controls/empty/empty';
import { Expander } from '@/components/controls/expander/expander';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureConfigPanel } from '@/components/panels/feature-config-panel/feature-config-panel';
import { FeatureData } from '@/models/feature';
import { FeatureLogic } from '@/logic/feature-logic';
import { FeatureType } from '@/enums/feature-type';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { Hero } from '@/models/hero';
import { HeroLogic } from '@/logic/hero-logic';
import { HeroTutorialPanel } from '@/components/panels/hero-tutorial/hero-tutorial-panel';
import { Info } from '@/components/controls/info/info';
import { NameSuggestions } from '@/components/panels/name-suggestions/name-suggestions';
import { SelectablePanel } from '@/components/controls/selectable-panel/selectable-panel';
import { Sourcebook } from '@/models/sourcebook';
import { TextInput } from '@/components/controls/text-input/text-input';
import { TutorialMode } from '@/enums/tutorial-mode';
import { Utils } from '@/utils/utils';
import { localizeUIString } from '@/localization/resolver';
import { useHeroes } from '@/contexts/data-context';
import { useLocalization } from '@/contexts/localization-context';

import './details-section.scss';

interface DetailsSectionProps {
	hero: Hero;
	sourcebooks: Sourcebook[];
	setName: (value: string) => void;
	setPicture: (value: string | null) => void;
	setFolder: (value: string) => void;
	setTutorialMode: (value: TutorialMode) => void;
	setFeatureData: (featureID: string, data: FeatureData) => void;
}

export const DetailsSection = (props: DetailsSectionProps) => {
	const { locale } = useLocalization();
	const allHeroes = useHeroes();
	const folders = allHeroes
		.map(h => h.folder)
		.filter(f => !!f)
		.sort();

	// These features exist only to be drawn: the panel below shows their name and hands the
	// hero's own feature ID back to setFeatureData, so a localized name here is display text
	// and never reaches the hero, the feature IDs, the options or the selected values. The
	// feature's own name, where it has one, is element data and stays canonical.
	const languageFeatures = HeroLogic.getFeatures(props.hero)
		.map(f => f.feature)
		.filter(f => f.type === FeatureType.LanguageChoice)
		.map(f => {
			return FactoryLogic.feature.createLanguageChoice({
				id: f.id,
				name: f.name || localizeUIString(locale, 'hero-edit.details.language', 'Language'),
				options: [ ...f.data.options ],
				allowedTypes: [ ...f.data.allowedTypes ],
				count: f.data.count,
				selected: [ ...f.data.selected ]
			});
		});

	const skillFeatures = HeroLogic.getFeatures(props.hero)
		.map(f => f.feature)
		.filter(f => f.type === FeatureType.SkillChoice)
		.map(f => {
			return FactoryLogic.feature.createSkillChoice({
				id: f.id,
				name: localizeUIString(locale, 'hero-edit.details.skill', 'Skill'),
				options: [ ...f.data.options ],
				listOptions: [ ...f.data.listOptions ],
				count: f.data.count,
				selected: [ ...f.data.selected ]
			});
		});

	const languagesDone = languageFeatures.every(f => FeatureLogic.isChosen(f, props.hero, props.sourcebooks));
	const skillsDone = skillFeatures.every(f => FeatureLogic.isChosen(f, props.hero, props.sourcebooks));

	return (
		<div className='hero-edit-content details-section'>
			<div className='hero-edit-content-column selected' id='details-main'>
				<SelectablePanel>
					<HeaderText>{localizeUIString(locale, 'hero-edit.name', 'Name')}</HeaderText>
					<Space.Compact style={{ width: '100%' }}>
						<TextInput
							status={props.hero.name === '' ? 'warning' : ''}
							placeholder={localizeUIString(locale, 'hero-edit.name', 'Name')}
							allowClear={true}
							value={props.hero.name}
							onChange={props.setName}
						/>
						<NameSuggestions onSelect={props.setName} />
					</Space.Compact>
				</SelectablePanel>
				<SelectablePanel>
					<HeaderText>{localizeUIString(locale, 'hero-edit.details.portrait', 'Portrait')}</HeaderText>
					{
						props.hero.picture ?
							<Flex align='center' justify='center' gap={10}>
								<img className='portrait-edit' src={props.hero.picture} title={localizeUIString(locale, 'hero-edit.details.portrait', 'Portrait')} />
								<DangerButton mode='clear' onConfirm={() => props.setPicture(null)} />
							</Flex>
							:
							<Upload
								style={{ width: '100%' }}
								accept='.png,.webp,.gif,.jpg,.jpeg,.svg'
								showUploadList={false}
								beforeUpload={async file => {
									const reader = new FileReader();
									reader.onload = async progress => {
										if (progress.target) {
											const content = progress.target.result as string;
											const resized = await Utils.getResizedImage(content);
											props.setPicture(resized);
										}
									};
									reader.readAsDataURL(file);
									return false;
								}}
							>
								<Button>
									<DownloadOutlined />
									{localizeUIString(locale, 'hero-edit.details.choose-picture', 'Choose a picture')}
								</Button>
							</Upload>
					}
				</SelectablePanel>
				<SelectablePanel>
					<HeaderText
						extra={<Info>{localizeUIString(locale, 'hero-edit.details.folder-explanation', 'You can add your hero to a folder to group it with other heroes.')}</Info>}
					>
						{localizeUIString(locale, 'hero-edit.details.folder', 'Folder')}
					</HeaderText>
					<AutoComplete
						options={Collections.distinct(folders, f => f).map(option => ({ value: option, label: option }))}
						optionRender={o => <div className='ds-text'>{o.data.label}</div>}
						placeholder={localizeUIString(locale, 'hero-edit.details.folder', 'Folder')}
						allowClear={true}
						showSearch={{ filterOption: true }}
						value={props.hero.folder}
						onSelect={props.setFolder}
						onChange={props.setFolder}
					/>
				</SelectablePanel>
				<SelectablePanel>
					<HeroTutorialPanel value={props.hero.state.tutorialMode} onChange={props.setTutorialMode} />
				</SelectablePanel>
			</div>
			<div className='hero-edit-content-column selected'>
				<Expander
					title={localizeUIString(locale, 'hero-edit.details.language-choices', 'Language Choices')}
					expandedByDefault={!languagesDone}
					extra={[
						languagesDone ?
							<CheckIcon key='completed' state='success' />
							: null
					]}
				>
					{
						languageFeatures.map(f => (
							<FeatureConfigPanel
								key={f.id}
								feature={f}
								hero={props.hero}
								sourcebooks={props.sourcebooks}
								setData={props.setFeatureData}
							/>
						))
					}
					{
						languageFeatures.length === 0 ?
							<Empty />
							: null
					}
				</Expander>
				<Expander
					title={localizeUIString(locale, 'hero-edit.details.skill-choices', 'Skill Choices')}
					expandedByDefault={!skillsDone}
					extra={[
						skillsDone ?
							<CheckIcon key='completed' state='success' />
							: null
					]}
				>
					{
						skillFeatures.map(f => (
							<FeatureConfigPanel
								key={f.id}
								feature={f}
								hero={props.hero}
								sourcebooks={props.sourcebooks}
								setData={props.setFeatureData}
							/>
						))
					}
					{
						skillFeatures.length === 0 ?
							<Empty />
							: null
					}
				</Expander>
			</div>
		</div>
	);
};
