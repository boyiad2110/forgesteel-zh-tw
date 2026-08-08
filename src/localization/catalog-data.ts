import { LocalizationEntry } from '@/localization/catalog';

/**
 * The production zh-TW catalog.
 *
 * It holds only what the project owner has approved; any call site without an entry here
 * still resolves to the canonical English it passes in. Later batches add approved entries
 * here; nothing else in the app has to change for them to take effect.
 */
export const productionLocalizationEntries: LocalizationEntry[] = [
	{ kind: 'ui', key: 'hero-edit.hero-builder', canonicalEnglish: 'Hero Builder', zhTW: '創建英雄', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.save-changes', canonicalEnglish: 'Save Changes', zhTW: '儲存變更', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.cancel', canonicalEnglish: 'Cancel', zhTW: '取消', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.random', canonicalEnglish: 'Random', zhTW: '隨機選擇', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.unselect', canonicalEnglish: 'Unselect', zhTW: '取消選擇', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.start', canonicalEnglish: 'Start', zhTW: '開始', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.ancestry', canonicalEnglish: 'Ancestry', zhTW: '族裔', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.culture', canonicalEnglish: 'Culture', zhTW: '文化', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.career', canonicalEnglish: 'Career', zhTW: '職業', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.class', canonicalEnglish: 'Class', zhTW: '範型', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.complication', canonicalEnglish: 'Complication', zhTW: '糾葛', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.tab.details', canonicalEnglish: 'Details', zhTW: '細項', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.page-state.optional', canonicalEnglish: 'Optional', zhTW: '非強制', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.page-state.not-started', canonicalEnglish: 'Not Started', zhTW: '尚未開始', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.page-state.in-progress', canonicalEnglish: 'In Progress', zhTW: '進行中', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.page-state.completed', canonicalEnglish: 'Completed', zhTW: '已完成', approval: 'approved' },
	// Section-local labels that read the same wherever a hero edit section shows them.
	{ kind: 'ui', key: 'hero-edit.choices', canonicalEnglish: 'Choices', zhTW: '選項', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.name', canonicalEnglish: 'Name', zhTW: '名稱', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.remove', canonicalEnglish: 'Remove', zhTW: '移除', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.empty-message.click-here', canonicalEnglish: 'Click Here', zhTW: '點擊這裡', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.culture.your-ancestry', canonicalEnglish: 'Your Ancestry', zhTW: '你的族裔', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.culture.ancestral-cultures', canonicalEnglish: 'Ancestral Cultures', zhTW: '族裔文化', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.culture.professional-cultures', canonicalEnglish: 'Professional Cultures', zhTW: '專業文化', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.culture.bespoke-cultures', canonicalEnglish: 'Bespoke Cultures', zhTW: '自訂文化', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.culture.bespoke-culture', canonicalEnglish: 'Bespoke Culture', zhTW: '自訂文化', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.culture.choose-name', canonicalEnglish: 'Choose a name for your culture.', zhTW: '為你的文化取個名稱。', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.culture.choose-aspects', canonicalEnglish: 'Choose your Environment, Organization, and Upbringing.', zhTW: '選擇你的生活環境、組織型態與成長經歷。', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.culture.choose-environment', canonicalEnglish: 'Choose environment', zhTW: '選擇生活環境', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.culture.choose-organization', canonicalEnglish: 'Choose organization', zhTW: '選擇組織型態', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.culture.choose-upbringing', canonicalEnglish: 'Choose upbringing', zhTW: '選擇成長經歷', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.career.inciting-incident', canonicalEnglish: 'Inciting Incident', zhTW: '關鍵事件', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.career.choose-inciting-incident', canonicalEnglish: 'Choose an inciting incident', zhTW: '選擇 1 個關鍵事件', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.details.portrait', canonicalEnglish: 'Portrait', zhTW: '肖像', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.details.choose-picture', canonicalEnglish: 'Choose a picture', zhTW: '選擇圖片', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.details.folder', canonicalEnglish: 'Folder', zhTW: '資料夾', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.details.folder-explanation', canonicalEnglish: 'You can add your hero to a folder to group it with other heroes.', zhTW: '你可以將英雄加入資料夾，以便與其他英雄分組管理。', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.details.language-choices', canonicalEnglish: 'Language Choices', zhTW: '語言選項', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.details.skill-choices', canonicalEnglish: 'Skill Choices', zhTW: '技能選項', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.details.language', canonicalEnglish: 'Language', zhTW: '語言', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.details.skill', canonicalEnglish: 'Skill', zhTW: '技能', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.class.level', canonicalEnglish: 'Level', zhTW: '等級', approval: 'approved' },
	// XP is read as XP in zh-TW; the entry exists so that stays a decision rather than an omission.
	{ kind: 'ui', key: 'hero-edit.class.xp', canonicalEnglish: 'XP', zhTW: 'XP', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.class.class-choices', canonicalEnglish: 'Class Choices', zhTW: '範型選項', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.class.nothing-to-choose', canonicalEnglish: 'Nothing to choose for this level', zhTW: '此等級沒有需要選擇的項目', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.class.characteristics', canonicalEnglish: 'Characteristics', zhTW: '屬性', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.class.choose-primary-characteristics', canonicalEnglish: 'Your class allows you to choose your primary characteristics.', zhTW: '你的範型允許你選擇主要屬性。', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.class.select-primary-characteristics', canonicalEnglish: 'Select your primary characteristics', zhTW: '選擇你的主要屬性', approval: 'approved' },
	{ kind: 'ui', key: 'hero-edit.class.choose-characteristics', canonicalEnglish: 'Choose your characteristics.', zhTW: '選擇你的屬性。', approval: 'approved' },
	// The info action's canonical English reads 'Select' today; only the zh-TW says what it does.
	{ kind: 'ui', key: 'hero-edit.class.subclass-info', canonicalEnglish: 'Select', zhTW: '查看詳細資訊', approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.class.advance-to-level', canonicalEnglish: 'Advance to level {level}', zhTW: '提升至 {level} 級', placeholders: [ 'level' ], approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.class.level-choices', canonicalEnglish: 'Level {level} Choices', zhTW: '{level} 級選項', placeholders: [ 'level' ], approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.class.characteristic-array', canonicalEnglish: 'You start with a 2 in {primaryCharacteristics}. Choose the set of values you\'d like for your other characteristics.', zhTW: '你的{primaryCharacteristics}起始值為 2。請為其他屬性選擇 1 組數值。', placeholders: [ 'primaryCharacteristics' ], approval: 'approved' },
	// English picks its article from the subclass name, and zh-TW needs no article at all, so
	// each English form is its own entry rather than one entry with an article placeholder.
	{ kind: 'message', key: 'hero-edit.class.choose-subclass-a', canonicalEnglish: 'Choose a {subclassName}.', zhTW: '選擇 1 個 {subclassName}。', placeholders: [ 'subclassName' ], approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.class.choose-subclass-an', canonicalEnglish: 'Choose an {subclassName}.', zhTW: '選擇 1 個 {subclassName}。', placeholders: [ 'subclassName' ], approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.class.choose-subclasses', canonicalEnglish: 'Choose {count} {subclassName}s.', zhTW: '選擇 {count} 個 {subclassName}。', placeholders: [ 'count', 'subclassName' ], approval: 'approved' },
	// The selector button says the same thing as the prompt above it, without the full stop.
	{ kind: 'message', key: 'hero-edit.class.choose-subclass-button-a', canonicalEnglish: 'Choose a {subclassName}', zhTW: '選擇 1 個 {subclassName}', placeholders: [ 'subclassName' ], approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.class.choose-subclass-button-an', canonicalEnglish: 'Choose an {subclassName}', zhTW: '選擇 1 個 {subclassName}', placeholders: [ 'subclassName' ], approval: 'approved' },
	// The Start tab's instructional copy. Each sentence is one entry so it can be translated
	// as a sentence; the terms it names are placeholders, and the section draws the emphasis
	// the canonical English gave them around whatever those placeholders resolved to.
	{ kind: 'ui', key: 'hero-edit.start.creating-a-hero', canonicalEnglish: 'Creating a Hero', zhTW: '創建英雄', approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.start.intro', canonicalEnglish: 'Creating a hero in {appName} is simple.', zhTW: '在 {appName} 創建英雄很簡單。', placeholders: [ 'appName' ], approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.start.choose-tabs', canonicalEnglish: 'Use the tabs above to select your hero\'s {ancestry}, {culture}, {career}, and {class}. If there are any choices to be made, you\'ll be prompted to make your selections.', zhTW: '使用上方分頁選擇英雄的{ancestry}、{culture}、{career}與{class}。若還有需要選擇的項目，系統會提示你進行選擇。', placeholders: [ 'ancestry', 'culture', 'career', 'class' ], approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.start.choose-complication', canonicalEnglish: 'Optionally, you can choose a {complication} - but you can skip this if you\'d prefer.', zhTW: '此外，你也可以選擇 1 個{complication}，但這不是強制的，可以直接略過。', placeholders: [ 'complication' ], approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.start.name-your-hero', canonicalEnglish: 'Finally, go to the {details} tab and give your hero a name.', zhTW: '最後，前往{details}分頁，為你的英雄取個名字。', placeholders: [ 'details' ], approval: 'approved' },
	{ kind: 'message', key: 'hero-edit.start.finish', canonicalEnglish: 'When you\'re done, click {saveChanges} in the toolbar at the top, and you\'ll see your hero sheet.', zhTW: '完成後，點擊頂部工具列的{saveChanges}，即可查看你的角色卡。', placeholders: [ 'saveChanges' ], approval: 'approved' },
	// The hero's sourcebook selection. The SourcebookType value still does the filtering; the
	// section headings are approved as whole headings rather than composed from the type.
	{ kind: 'ui', key: 'hero-sourcebooks.title', canonicalEnglish: 'Sourcebooks', zhTW: '資料來源', approval: 'approved' },
	{ kind: 'ui', key: 'hero-sourcebooks.explanation', canonicalEnglish: 'This hero can use content from the following sourcebooks:', zhTW: '這名英雄可以使用下列資料來源的內容：', approval: 'approved' },
	{ kind: 'ui', key: 'hero-sourcebooks.type.homebrew', canonicalEnglish: 'Homebrew', zhTW: '自製', approval: 'approved' },
	{ kind: 'ui', key: 'hero-sourcebooks.type-sourcebooks.official', canonicalEnglish: 'Official Sourcebooks', zhTW: '官方資料來源', approval: 'approved' },
	{ kind: 'ui', key: 'hero-sourcebooks.type-sourcebooks.homebrew', canonicalEnglish: 'Homebrew Sourcebooks', zhTW: '自製資料來源', approval: 'approved' },
	{ kind: 'ui', key: 'hero-sourcebooks.unnamed', canonicalEnglish: 'Unnamed Sourcebook', zhTW: '未命名的資料來源', approval: 'approved' },
	{ kind: 'ui', key: 'hero-sourcebooks.import-explanation', canonicalEnglish: 'If you have a homebrew sourcebook you want to use, and it isn\'t listed here, you can import it now.', zhTW: '如果你想使用的自製資料來源沒有列在這裡，可以現在匯入。', approval: 'approved' },
	{ kind: 'ui', key: 'hero-sourcebooks.import', canonicalEnglish: 'Import a sourcebook', zhTW: '匯入資料來源', approval: 'approved' },
	{ kind: 'ui', key: 'hero-sourcebooks.not-imported', canonicalEnglish: 'Sourcebook not imported', zhTW: '無法匯入資料來源', approval: 'approved' },
	// The rejected type is reported as the canonical SourcebookType value it was rejected
	// for; no zh-TW reading of that value has been approved, and none is invented here.
	{ kind: 'message', key: 'hero-sourcebooks.type-not-available', canonicalEnglish: '{sourcebookType} sourcebooks are not available in this edition.', zhTW: '此版本不支援 {sourcebookType} 類型的資料來源。', placeholders: [ 'sourcebookType' ], approval: 'approved' },
	// The hero's tutorial mode. The TutorialMode enum still names the stage a hero is in and
	// still drives which features and abilities that stage offers; the stage labels below are
	// only how those stages are read, and the restriction lines below only describe the
	// filtering that already happens.
	{ kind: 'ui', key: 'hero-tutorial.title', canonicalEnglish: 'Tutorial Mode', zhTW: '教學模式', approval: 'approved' },
	{ kind: 'ui', key: 'hero-tutorial.explanation', canonicalEnglish: 'Switch this on if you want to gain your abilities incrementally.', zhTW: '如果你想逐步獲得能力，請開啟此模式。', approval: 'approved' },
	// The canonical English of a stage label is the TutorialMode value it stands for; the
	// zh-TW is display text only, and the canonical value is what the panel reports back.
	{ kind: 'ui', key: 'hero-tutorial.stage-1', canonicalEnglish: 'Stage 1', zhTW: '階段 1', approval: 'approved' },
	{ kind: 'ui', key: 'hero-tutorial.stage-2', canonicalEnglish: 'Stage 2', zhTW: '階段 2', approval: 'approved' },
	{ kind: 'ui', key: 'hero-tutorial.stage-3', canonicalEnglish: 'Stage 3', zhTW: '階段 3', approval: 'approved' },
	// These lines name abilities a hero can use, which is the '招式' reading of ability, not
	// the '能力' reading the explanation above uses for a hero's capabilities in general.
	{ kind: 'ui', key: 'hero-tutorial.no-triggered-action-abilities', canonicalEnglish: 'No triggered action abilities', zhTW: '不提供反應動作招式', approval: 'approved' },
	{ kind: 'ui', key: 'hero-tutorial.no-heroic-resource-abilities', canonicalEnglish: 'No abilities with a heroic resource cost', zhTW: '不提供需要消耗英雄資源的招式', approval: 'approved' },
	{ kind: 'ui', key: 'hero-tutorial.no-disengage-bonus', canonicalEnglish: 'No disengage bonus', zhTW: '不提供撤離加值', approval: 'approved' },
	{ kind: 'ui', key: 'hero-tutorial.no-perks', canonicalEnglish: 'No perks', zhTW: '不提供專長', approval: 'approved' },
	{ kind: 'ui', key: 'hero-tutorial.no-costly-heroic-resource-abilities', canonicalEnglish: 'No abilities with a heroic resource cost of more than 3', zhTW: '不提供英雄資源費用超過 3 的招式', approval: 'approved' },
	// The ancestry panel's own frame. The page a panel is on stays the canonical 'overview',
	// 'signature', 'purchased' or 'culture'; the labels below are only how those pages read.
	// The ancestry's name, description and features are element data and stay canonical.
	{ kind: 'ui', key: 'ancestry-panel.page.overview', canonicalEnglish: 'Overview', zhTW: '概述', approval: 'approved' },
	// 'Signature' and 'Purchased' read as they do here because each names a kind of ancestry
	// trait; neither is a general reading of the word on its own.
	{ kind: 'ui', key: 'ancestry-panel.page.signature', canonicalEnglish: 'Signature', zhTW: '招牌特性', approval: 'approved' },
	{ kind: 'ui', key: 'ancestry-panel.page.purchased', canonicalEnglish: 'Purchased', zhTW: '自購特性', approval: 'approved' },
	{ kind: 'ui', key: 'ancestry-panel.page.culture', canonicalEnglish: 'Culture', zhTW: '文化', approval: 'approved' },
	// The label only; the ancestry's own points value is drawn beside it unchanged.
	{ kind: 'ui', key: 'ancestry-panel.ancestry-points', canonicalEnglish: 'Ancestry Points', zhTW: '族裔點數', approval: 'approved' },
	{ kind: 'ui', key: 'ancestry-panel.unnamed', canonicalEnglish: 'Unnamed Ancestry', zhTW: '未命名族裔', approval: 'approved' },
	// The career panel's own frame. The page a panel is on stays the canonical 'overview',
	// 'features' or 'incidents'; the labels below are only how those pages read. The career's
	// name, description, features and inciting incidents are element data and stay canonical.
	{ kind: 'ui', key: 'career-panel.page.overview', canonicalEnglish: 'Overview', zhTW: '概述', approval: 'approved' },
	{ kind: 'ui', key: 'career-panel.page.features', canonicalEnglish: 'Features', zhTW: '特性', approval: 'approved' },
	{ kind: 'ui', key: 'career-panel.page.incidents', canonicalEnglish: 'Inciting Incidents', zhTW: '關鍵事件', approval: 'approved' },
	{ kind: 'ui', key: 'career-panel.unnamed', canonicalEnglish: 'Unnamed Career', zhTW: '未命名職業', approval: 'approved' },
	// The culture panel's type tag. The canonical English of each entry is the CultureType
	// value it stands for; the culture's own type keeps that value, and the reading below is
	// only what the tag beside its name says. The culture's name, description and aspect
	// features are element data and stay canonical.
	{ kind: 'ui', key: 'culture-panel.type.bespoke', canonicalEnglish: 'Bespoke', zhTW: '自訂', approval: 'approved' },
	{ kind: 'ui', key: 'culture-panel.type.ancestral', canonicalEnglish: 'Ancestral', zhTW: '族裔', approval: 'approved' },
	{ kind: 'ui', key: 'culture-panel.type.professional', canonicalEnglish: 'Professional', zhTW: '專業', approval: 'approved' },
	{ kind: 'ui', key: 'culture-panel.type.regional', canonicalEnglish: 'Regional', zhTW: '地區', approval: 'approved' },
	{ kind: 'ui', key: 'culture-panel.unnamed', canonicalEnglish: 'Unnamed Culture', zhTW: '未命名文化', approval: 'approved' },
	// The subclass panel's own frame. The page a panel is on stays the canonical 'overview',
	// 'features' or 'abilities'; the labels below are only how those pages read. The subclass's
	// name, description, features and abilities are element data and stay canonical.
	{ kind: 'ui', key: 'subclass-panel.page.overview', canonicalEnglish: 'Overview', zhTW: '概述', approval: 'approved' },
	{ kind: 'ui', key: 'subclass-panel.page.features', canonicalEnglish: 'Features', zhTW: '特性', approval: 'approved' },
	// This tab and the headings below it name abilities a hero can use, which is the '招式'
	// reading of ability rather than the '能力' reading used for capabilities in general.
	{ kind: 'ui', key: 'subclass-panel.page.abilities', canonicalEnglish: 'Abilities', zhTW: '招式', approval: 'approved' },
	{ kind: 'ui', key: 'subclass-panel.signature-abilities', canonicalEnglish: 'Signature Abilities', zhTW: '招牌招式', approval: 'approved' },
	{ kind: 'ui', key: 'subclass-panel.unnamed', canonicalEnglish: 'Unnamed Subclass', zhTW: '未命名子範型', approval: 'approved' },
	// One entry per heading rather than one per level or per cost: the number is interpolated,
	// so it reaches the screen as the canonical number the subclass and the ability carry.
	{ kind: 'message', key: 'subclass-panel.level', canonicalEnglish: 'Level {level}', zhTW: '{level} 級', placeholders: [ 'level' ], approval: 'approved' },
	// '費' is the ability's heroic resource cost; the cost itself stays the number it was.
	{ kind: 'message', key: 'subclass-panel.cost-abilities', canonicalEnglish: '{cost}pt Abilities', zhTW: '{cost} 費招式', placeholders: [ 'cost' ], approval: 'approved' }
];
