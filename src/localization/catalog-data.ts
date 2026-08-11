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
	{ kind: 'message', key: 'subclass-panel.cost-abilities', canonicalEnglish: '{cost}pt Abilities', zhTW: '{cost} 費招式', placeholders: [ 'cost' ], approval: 'approved' },
	// The class panel uses canonical page values and ability costs; these entries only read
	// their labels. Its class, subclass, feature and ability data stays canonical.
	{ kind: 'ui', key: 'class-panel.page.overview', canonicalEnglish: 'Overview', zhTW: '概述', approval: 'approved' },
	{ kind: 'ui', key: 'class-panel.page.features', canonicalEnglish: 'Features', zhTW: '特性', approval: 'approved' },
	{ kind: 'ui', key: 'class-panel.page.abilities', canonicalEnglish: 'Abilities', zhTW: '招式', approval: 'approved' },
	{ kind: 'ui', key: 'class-panel.page.subclasses', canonicalEnglish: 'Subclasses', zhTW: '子範型', approval: 'approved' },
	{ kind: 'ui', key: 'class-panel.primary-characteristics', canonicalEnglish: 'Primary Characteristics', zhTW: '主要屬性', approval: 'approved' },
	{ kind: 'ui', key: 'class-panel.signature-abilities', canonicalEnglish: 'Signature Abilities', zhTW: '招牌招式', approval: 'approved' },
	{ kind: 'ui', key: 'class-panel.unnamed', canonicalEnglish: 'Unnamed Class', zhTW: '未命名範型', approval: 'approved' },
	{ kind: 'message', key: 'class-panel.level', canonicalEnglish: 'Level {level}', zhTW: '{level} 級', placeholders: [ 'level' ], approval: 'approved' },
	{ kind: 'message', key: 'class-panel.cost-abilities', canonicalEnglish: '{cost}pt Abilities', zhTW: '{cost} 費招式', placeholders: [ 'cost' ], approval: 'approved' },
	// This tag reads the canonical SourcebookType.Homebrew value only at a hero element's
	// presentation boundary. Every other sourcebook type falls back to its canonical value.
	{ kind: 'ui', key: 'element-header.sourcebook-type.homebrew', canonicalEnglish: 'Homebrew', zhTW: '自製', approval: 'approved' },
	{ kind: 'ui', key: 'complication-panel.unnamed', canonicalEnglish: 'Unnamed Complication', zhTW: '未命名糾葛', approval: 'approved' },
	// Each Signature badge is limited to its own panel header context; neither entry reads
	// the canonical cost sentinel or the standalone word in another player-facing context.
	{ kind: 'ui', key: 'feature-panel.signature-badge', canonicalEnglish: 'Signature', zhTW: '招牌', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.signature-badge', canonicalEnglish: 'Signature', zhTW: '招牌', approval: 'approved' },
	// The HeroicResource feature type and its 'heroic' / 'epic' data stay canonical; only
	// this approved heroic header tag is presented in zh-TW.
	{ kind: 'ui', key: 'feature-panel.heroic-resource', canonicalEnglish: 'Heroic Resource', zhTW: '英雄資源', approval: 'approved' },
	{ kind: 'ui', key: 'feature-panel.unnamed', canonicalEnglish: 'Unnamed Feature', zhTW: '未命名特性', approval: 'approved' },
	{ kind: 'ui', key: 'feature-panel.notes', canonicalEnglish: 'Notes', zhTW: '備註', approval: 'approved' },
	{ kind: 'ui', key: 'feature-panel.copy', canonicalEnglish: 'Copy Feature', zhTW: '複製特性', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.unnamed', canonicalEnglish: 'Unnamed Ability', zhTW: '未命名招式', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.copy', canonicalEnglish: 'Copy Ability', zhTW: '複製招式', approval: 'approved' },
	// AbilityPanel warning labels and messages only change their presentation. Condition values,
	// ability IDs, keywords, and the level used in the warning remain canonical runtime data.
	{ kind: 'ui', key: 'ability-panel.condition.bleeding', canonicalEnglish: 'Bleeding', zhTW: '出血', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.condition.dazed', canonicalEnglish: 'Dazed', zhTW: '暈眩', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.condition.frightened', canonicalEnglish: 'Frightened', zhTW: '畏縮', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.condition.grabbed', canonicalEnglish: 'Grabbed', zhTW: '擒制', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.condition.prone', canonicalEnglish: 'Prone', zhTW: '伏地', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.condition.restrained', canonicalEnglish: 'Restrained', zhTW: '束縛', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.condition.taunted', canonicalEnglish: 'Taunted', zhTW: '嘲諷', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.condition.weakened', canonicalEnglish: 'Weakened', zhTW: '虛弱', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.condition.dying', canonicalEnglish: 'Dying', zhTW: '瀕死', approval: 'approved' },
	{ kind: 'message', key: 'ability-panel.warning.bleeding', canonicalEnglish: 'After using this ability, you lose 1d6 + {level} Stamina.', zhTW: '發動此招式後，你會失去 1d6 + {level} 點體力。', placeholders: [ 'level' ], approval: 'approved' },
	{ kind: 'message', key: 'ability-panel.warning.cannot-use', canonicalEnglish: 'You can’t use this ability.', zhTW: '你不能發動此招式。', placeholders: [], approval: 'approved' },
	{ kind: 'message', key: 'ability-panel.warning.frightened', canonicalEnglish: 'This ability takes a bane if it targets the source of your fear.', zhTW: '若此招式的目標是你的恐懼來源，檢定帶有 1 個劣勢。', placeholders: [], approval: 'approved' },
	{ kind: 'message', key: 'ability-panel.warning.grabbed', canonicalEnglish: 'This ability takes a bane if it doesn’t target the creature grabbing you.', zhTW: '若此招式的目標不是擒抱你的生物，檢定帶有 1 個劣勢。', placeholders: [], approval: 'approved' },
	{ kind: 'message', key: 'ability-panel.warning.bane', canonicalEnglish: 'This ability takes a bane.', zhTW: '此招式的檢定帶有 1 個劣勢。', placeholders: [], approval: 'approved' },
	{ kind: 'message', key: 'ability-panel.warning.taunted', canonicalEnglish: 'This ability takes a double bane if it doesn’t target the creature who taunted you, and you have line of effect to that creature.', zhTW: '若此招式的目標不是嘲諷你的生物，且你與該生物之間有效果線，檢定帶有雙劣勢。', placeholders: [], approval: 'approved' },
	// The leading space is intentional: ResourcePill preserves canonical English adjacency,
	// while the approved zh-TW reading places one half-width space before 費.
	{ kind: 'ui', key: 'ability-panel.cost-unit.pt', canonicalEnglish: 'pt', zhTW: ' 費', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.cost-unit.pts', canonicalEnglish: 'pts', zhTW: ' 費', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.auto-calculate', canonicalEnglish: 'Auto-calculate damage, potency, etc', zhTW: '自動計算傷害、效力等數值', approval: 'approved' },
	{ kind: 'ui', key: 'ability-panel.charge-message', canonicalEnglish: 'This ability can be used in place of a melee free strike when you take the Charge action.', zhTW: '當你進行衝鋒動作時，可以用此招式取代近戰基礎打擊。', approval: 'approved' },
	// The ability info panel's fixed field labels. Only the label is read here: the distance
	// result, the target and the trigger keep whatever they already resolved to.
	{ kind: 'ui', key: 'ability-info.distance', canonicalEnglish: 'Distance', zhTW: '射程', approval: 'approved' },
	{ kind: 'ui', key: 'ability-info.target', canonicalEnglish: 'Target', zhTW: '目標', approval: 'approved' },
	// The combined label the panel shows when the distance is the target; the spacing around
	// the separator is part of the approved reading.
	{ kind: 'ui', key: 'ability-info.distance-target', canonicalEnglish: 'Distance / Target', zhTW: '射程 / 目標', approval: 'approved' },
	{ kind: 'ui', key: 'ability-info.trigger', canonicalEnglish: 'Trigger', zhTW: '觸發', approval: 'approved' },
	// How the approved player-facing action types read. The canonical English of each entry is
	// the AbilityUsage value it stands for; the ability keeps that value, and the usages with
	// no approved reading — Villain Action, Champion Action, Other — are not listed here.
	{ kind: 'ui', key: 'ability-info.usage.main-action', canonicalEnglish: 'Main Action', zhTW: '主要動作', approval: 'approved' },
	{ kind: 'ui', key: 'ability-info.usage.maneuver', canonicalEnglish: 'Maneuver', zhTW: '機動動作', approval: 'approved' },
	{ kind: 'ui', key: 'ability-info.usage.move-action', canonicalEnglish: 'Move Action', zhTW: '移動動作', approval: 'approved' },
	{ kind: 'ui', key: 'ability-info.usage.no-action', canonicalEnglish: 'No Action', zhTW: '無需動作', approval: 'approved' },
	{ kind: 'ui', key: 'ability-info.usage.triggered-action', canonicalEnglish: 'Triggered Action', zhTW: '反應動作', approval: 'approved' },
	// 'Free Strike' is one whole term, not a free version of a strike, so it is read as a term
	// of its own and never takes the free modifier below.
	{ kind: 'ui', key: 'ability-info.usage.free-strike', canonicalEnglish: 'Free Strike', zhTW: '基礎打擊', approval: 'approved' },
	// The free modifier an action type can carry, e.g. a free maneuver. This reading belongs to
	// that modifier alone; the word is not translated this way anywhere else.
	{ kind: 'ui', key: 'ability-info.action-type.free', canonicalEnglish: 'Free', zhTW: '免費', approval: 'approved' },
	// The power roll panel's headers. The roll's characteristics, its bonus and the tier effects
	// beneath the header stay canonical; only the header's own wording is read here.
	{ kind: 'ui', key: 'power-roll.test', canonicalEnglish: 'Test', zhTW: '考驗', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.highest-characteristic', canonicalEnglish: 'Highest Characteristic', zhTW: '最高屬性', approval: 'approved' },
	// The canonical English of each entry is the Characteristic value it stands for; the roll
	// keeps that value, and it is what every calculation continues to read.
	{ kind: 'ui', key: 'power-roll.characteristic.might', canonicalEnglish: 'Might', zhTW: '力量', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.characteristic.agility', canonicalEnglish: 'Agility', zhTW: '敏捷', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.characteristic.reason', canonicalEnglish: 'Reason', zhTW: '理智', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.characteristic.intuition', canonicalEnglish: 'Intuition', zhTW: '直覺', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.characteristic.presence', canonicalEnglish: 'Presence', zhTW: '氣場', approval: 'approved' },
	// How a characteristic list is joined, in this header only. English separates them with a
	// spaced 'or'; zh-TW runs them together with 或, so the spacing belongs to the entry.
	{ kind: 'ui', key: 'power-roll.characteristic-separator', canonicalEnglish: ' or ', zhTW: '或', approval: 'approved' },
	// The characteristics are already read before they reach this template, so the template only
	// carries what sits around them.
	{ kind: 'message', key: 'power-roll.characteristic-test', canonicalEnglish: '{characteristics} Test', zhTW: '{characteristics}考驗', placeholders: [ 'characteristics' ], approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.power-roll', canonicalEnglish: 'Power Roll', zhTW: '檢定', approval: 'approved' },
	// The '+' and the spaces around it are the same in both readings, so they stay in the
	// template rather than being rebuilt around it.
	{ kind: 'message', key: 'power-roll.characteristics', canonicalEnglish: 'Power Roll + {characteristics}', zhTW: '檢定 + {characteristics}', placeholders: [ 'characteristics' ], approval: 'approved' },
	// The control that shows and hides the tier percentages; only its label is read, and the
	// percentages themselves stay the numbers the panel calculated.
	{ kind: 'ui', key: 'power-roll.odds', canonicalEnglish: 'Odds', zhTW: '機率', approval: 'approved' },
	// A kit's damage bonus. Each phrase was approved whole: neither is a reading of the melee or
	// ranged distance terms on their own, which stay canonical wherever else they appear.
	{ kind: 'ui', key: 'power-roll.kit-damage.melee', canonicalEnglish: 'melee damage', zhTW: '近戰傷害', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.kit-damage.ranged', canonicalEnglish: 'ranged damage', zhTW: '遠程傷害', approval: 'approved' },
	// The three tiers read the same way round in both languages; the entry exists so the layout
	// belongs to the locale rather than to the panel, and so the tiers stay structured values.
	{ kind: 'message', key: 'power-roll.kit-damage-bonus', canonicalEnglish: '+{tier1} / +{tier2} / +{tier3} {damage}', zhTW: '+{tier1} / +{tier2} / +{tier3} {damage}', placeholders: [ 'tier1', 'tier2', 'tier3', 'damage' ], approval: 'approved' },
	// A feature's damage bonus. The canonical English of each entry below is the DamageType value
	// it stands for; the feature keeps that value, and it is what every rule still reads.
	{ kind: 'message', key: 'power-roll.feature-damage-bonus', canonicalEnglish: '{value} {damageType}', zhTW: '{value} {damageType}', placeholders: [ 'value', 'damageType' ], approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.damage-type.damage', canonicalEnglish: 'Damage', zhTW: '傷害', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.damage-type.acid', canonicalEnglish: 'Acid', zhTW: '酸蝕', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.damage-type.cold', canonicalEnglish: 'Cold', zhTW: '寒冷', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.damage-type.corruption', canonicalEnglish: 'Corruption', zhTW: '腐朽', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.damage-type.fire', canonicalEnglish: 'Fire', zhTW: '火焰', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.damage-type.holy', canonicalEnglish: 'Holy', zhTW: '神聖', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.damage-type.lightning', canonicalEnglish: 'Lightning', zhTW: '閃電', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.damage-type.poison', canonicalEnglish: 'Poison', zhTW: '劇毒', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.damage-type.psychic', canonicalEnglish: 'Psychic', zhTW: '心靈', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.damage-type.sonic', canonicalEnglish: 'Sonic', zhTW: '音波', approval: 'approved' },
	// The potency line. 弱 / 中 / 強 name the three potency strengths here and nowhere else; the
	// 'weak', 'average' and 'strong' the hero's potency is calculated from keep those names.
	// The full-width commas belong to the zh-TW reading, so the separators live in the template.
	{ kind: 'ui', key: 'power-roll.potency', canonicalEnglish: 'Potency', zhTW: '效力', approval: 'approved' },
	{ kind: 'message', key: 'power-roll.potency-values', canonicalEnglish: 'weak {weak}, average {average}, strong {strong}', zhTW: '弱 {weak}，中 {average}，強 {strong}', placeholders: [ 'weak', 'average', 'strong' ], approval: 'approved' },
	// The distances an ability can be used at, as the power roll panel's selector labels them.
	// The canonical English of each entry is the AbilityDistanceType value it stands for; that
	// value stays the option's value, the selected state and what every calculation reads.
	{ kind: 'ui', key: 'power-roll.distance-type.self', canonicalEnglish: 'Self', zhTW: '自身', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.distance-type.melee', canonicalEnglish: 'Melee', zhTW: '近戰', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.distance-type.ranged', canonicalEnglish: 'Ranged', zhTW: '遠程', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.distance-type.aura', canonicalEnglish: 'Aura', zhTW: '靈光', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.distance-type.burst', canonicalEnglish: 'Burst', zhTW: '爆發', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.distance-type.cube', canonicalEnglish: 'Cube', zhTW: '立方', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.distance-type.line', canonicalEnglish: 'Line', zhTW: '線形', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.distance-type.wall', canonicalEnglish: 'Wall', zhTW: '障壁', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.distance-type.summoner', canonicalEnglish: 'Summoner Range', zhTW: '召喚師射程', approval: 'approved' },
	{ kind: 'ui', key: 'power-roll.distance-type.special', canonicalEnglish: 'Special', zhTW: '特殊', approval: 'approved' },
	// Authored ability content, addressed by the ability's own ID and the canonical path the
	// text sits at (see src/localization/ability-field-path.ts). A section has no ID of its
	// own, so its position in the ability is what identifies it; if a section is ever moved
	// or reworded, the canonical English recorded here stops matching and the entry falls
	// back to English until it is re-approved. The canonicalEnglish below is the English an
	// author wrote, which is also what the panel shows for these two: the parser leaves both
	// of them exactly as they are.
	{ kind: 'element-field', elementID: 'free-strike', field: 'sections.0.text', canonicalEnglish: 'A creature can use this main action to make a free strike.', zhTW: '生物可以使用此主要動作進行基礎打擊。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'escape-grab', field: 'sections.1.roll.tier1', canonicalEnglish: 'No effect.', zhTW: '無效果。', approval: 'approved' },
	// Ancestry top-level name/description, addressed by the ancestry's own ID. Only the
	// name and description are localized here; nested Features stay canonical English
	// until a later batch.
	{ kind: 'element-field', elementID: 'ancestry-devil', field: 'name', canonicalEnglish: 'Devil', zhTW: '魔鬼', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-devil', field: 'description', canonicalEnglish: 'The native ancestry of the Seven Cities of Hell, devils are humanoids with red or blue skin expressed in a wide variety of hues, from bright crimson to deep purple. Each devil is born with some hellmark - horns, a tail, cloven hooves, a forked tongue, fanged incisors, or even wings.', zhTW: '地獄七城的原生族裔。魔鬼是皮膚呈紅色或藍色的類人生物，色澤從鮮豔的深紅到深紫不等。每個魔鬼天生都帶有某種地獄特徵，例如犄角、尾巴、偶蹄、叉舌、尖牙或翅膀。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-dragon-knight', field: 'name', canonicalEnglish: 'Dragon Knight', zhTW: '龍騎士', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-dragon-knight', field: 'description', canonicalEnglish: 'The ritual of Dracogenesis that grants the power to create a generation of dragon knights—also known as draconians or wyrmwights—is obscure and supremely difficult for even an experienced sorcerer to master. Small populations of draconians in Khemhara, Higara, and Khoursir attest to this. Descendants of original generations created millennia ago by powerful wizards, they have never been numerous. A typical clutch yields only a single egg. After only a few generations, these draconians begin to show new adaptations like feathers or frilled ridges.', zhTW: '能夠創造龍騎士（又名為龍人或龍裔）的龍生儀式極為晦澀，即使是經驗豐富的術士也難以掌握。即使在凱姆哈拉、希伽拉和科爾瑟地區也只有少數龍人出沒，證明了這種儀式有多困難。這些龍人源自強大巫師於千年前創造的原始世代，生育率極低，一窩只會產下一顆蛋，因此族群數量一直未能壯大。短短幾代後，這些龍人便開始展現新的適應特徵，例如羽毛或突脊。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-dwarf', field: 'name', canonicalEnglish: 'Dwarf', zhTW: '矮人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-dwarf', field: 'description', canonicalEnglish: 'Possessed of a strength that belies their size, dwarves have flesh infused with stone - a silico-organic hybrid making them physically denser than other humanoids. They enjoy a reputation in Orden as savvy engineers and technologists thanks to the lore they inherited from their elder siblings, the long-extinct steel dwarves.', zhTW: '矮人雖然體型矮小，卻擁有驚人的力量。他們的血肉與岩石融為一體，這種矽基有機混合體讓他們的身軀比其他類人生物更為堅實。矮人在歐爾登因精湛的工程科技和專業知識而聞名，這些寶貴技術源自他們已滅絕的古老親族——鐵矮人。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-wode-elf', field: 'name', canonicalEnglish: 'Elf (wode)', zhTW: '幻林精靈', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-wode-elf', field: 'description', canonicalEnglish: 'Children of the sylvan celestials and masters of the elf-haunted forests called wodes, wode elves see all forests as their domain by birthright. They know and enjoy their reputation among humans for snatching children who wander too far into the woods. Humans should fear the trees.', zhTW: '幻林精靈是幽木天靈的後裔，掌管著妖精盤據的「幻林」，並將所有森林視為他們與生俱來的領地。他們知道自己在人類之間的不良名聲（會擄走深入樹林的孩童），也樂於維持那種恐怖形象。因為在幻林精靈看來，人類理應畏懼樹林。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-high-elf', field: 'name', canonicalEnglish: 'Elf (high)', zhTW: '高等精靈', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-high-elf', field: 'description', canonicalEnglish: 'Children of the solar celestials created to tend their libraries and attend to the true elves as heralds, the high elf history describes a better age, before the coming of humans and war. A time when the celestials were still in the world, and all that mattered was art and beauty.', zhTW: '高等精靈是玄暉天靈後裔，負責管理圖書館並擔任僕從與使者。高等精靈的歷史記載著一個更美好的時代——在人類與戰爭尚未到來、天靈仍在凡間、萬物只追求藝術與美麗的時代。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-human', field: 'name', canonicalEnglish: 'Human', zhTW: '人類', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-human', field: 'description', canonicalEnglish: 'Humans belong to the world in a way the other speaking peoples do not. You can sense the presence of the supernatural—that … oily smell in the air, as I’ve heard it described. And the presence of deathless causes the hairs on the back of your neck to stand up. Or why do you think graveyards affect you so? Whatever magic is, its grip on you is light. Whatever drives the deathless, your nature rebels against it.', zhTW: '人類與這個世界的連結與其他智慧種族截然不同。你可以感知超自然的存在，據說就像空氣中瀰漫著油膩的氣味。不死者一出現，你的後頸就會寒毛直豎，不然墓園怎會讓你覺得毛骨悚然？無論是哪種魔法，都無法完全束縛你；無論是什麼力量在驅使著不死者，你都會本能地抗拒。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-orc', field: 'name', canonicalEnglish: 'Orc', zhTW: '歐克', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-orc', field: 'description', canonicalEnglish: 'An anger that cannot be hidden. A fury that drives them in battle. Orcs are famed throughout the world as consummate warriors - a reputation that the peace-loving orcs find distasteful.', zhTW: '歐克擁有無法掩藏的憤怒，以及驅使他們作戰的狂暴，以稱霸沙場的精銳戰士聞名於世，但這支愛好和平的族裔卻不喜歡承擔這樣的名聲。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-polder', field: 'name', canonicalEnglish: 'Polder', zhTW: '波德人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-polder', field: 'description', canonicalEnglish: 'After humans, polders are the most numerous and diverse ancestry in Orden. They are not humans, but they live in and among humans and share their gods and culture. Almost every human culture in Orden has a polder saint or a human saint venerated by polder.', zhTW: '在歐爾登，波德人的數量與多元性僅次於人類。雖然他們不是人類，卻與人類共同生活，共享同樣的神明與文化。幾乎在每一種人類文化中，都能找到波德人聖者，或是受到波德人敬奉的人類聖者。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-revenant', field: 'name', canonicalEnglish: 'Revenant', zhTW: '還魂屍', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-revenant', field: 'description', canonicalEnglish: 'The dead walk among us. Some of them are happier about it than others. Unlike the necromantic rituals that produce wights and wraiths and zombies, revenants rise from the grave through a combination of an unjust death and a burning desire for vengeance. Creatures sustained on pure will, they have no need of food or water or air - and, unlike their zombified cousins, they retain all their memories and personality from life.', zhTW: '死者行走在我們之間，但不是所有死者都樂於接受這種情況。不同於製造屍妖、怨靈和殭屍的死靈儀式，還魂屍是因為枉死或強烈的復仇心而從墳墓中爬出來。他們之所以能夠存在於世上，不是依靠食物、水或空氣，而是純粹的意志力。與殭屍不同的是，還魂屍保留了生前的所有記憶和個性。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-hakaan', field: 'name', canonicalEnglish: 'Hakaan', zhTW: '哈肯人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-hakaan', field: 'description', canonicalEnglish: 'In spite of their friendly, outgoing nature, the rare presence of a hakaan in human society is considered a harbinger - an omen of dark times. Descended from a tribe of giants in upper Vanigar, the original Haka’an tribe made a bargain with Holkatja the Vanigar trickster god. They traded some of their gigantic size and strength for the ability to see the future.', zhTW: '儘管哈肯人天性友善外向，但只要他們罕見地出現在人類社會中，都會被視為黑暗的預兆。哈肯人源自北方華尼伽的巨人部落，最早的哈肯人部落與華尼伽的詭計之神霍卡提雅達成交易，用部分體型和力量換取了預見未來的能力。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-memonek', field: 'name', canonicalEnglish: 'Memonek', zhTW: '梅莫人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-memonek', field: 'description', canonicalEnglish: 'The native denizens of Axiom, the Plane of Uttermost Law, memonek dwell in a land with lakes and trees and birds and flowers. But on this alien world, the lakes are seas of mercury, the birds glitter with wings of glass stretched gossamer thin, and the flowers’ petals are iridescent metal as flexible and fragile as any earthly rose.', zhTW: '梅莫人是「至律位面」公理界的原生族裔。他們居住的土地一樣有湖泊、樹木、飛鳥和花朵，但在這個異世界中，湖泊是由水銀構成、鳥兒拍打著薄如蟬翼的玻璃翅膀，而花瓣雖然是虹彩金屬，卻如同塵世的玫瑰般柔軟易碎。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-time-raider', field: 'name', canonicalEnglish: 'Time Raider', zhTW: '時空獵手', approval: 'approved' },
	{ kind: 'element-field', elementID: 'ancestry-time-raider', field: 'description', canonicalEnglish: 'The original servitor species of the synliroi — evil psions with near godlike power — the kuran’zoi liberated themselves during the First Psychic War. In the centuries since, they built their own culture and civilization as nomads of the timescape. The exonym “time raiders” was given to them by denizens of the lower worlds who, seeing the advanced technology the kuran’zoi wield, concluded they must be from the future', zhTW: '庫蘭佐伊最初是心語者（擁有近乎神級力量的邪惡靈能者）的奴隸種族，他們在第一次靈能大戰期間成功解放了自己。在之後的數百年間，他們作為時界的遊牧民族，建立了自己的文化和文明。「時空獵手」這個稱呼是下層界域的居民賦予的，因為他們看到庫蘭佐伊所使用的先進科技，認為他們必定來自未來。', approval: 'approved' },
	// Culture top-level name/description, addressed by the culture's own ID. Descriptions are
	// the mechanical zh-TW join of the three approved aspect terms; nested Environment,
	// Organization, Upbringing and Language Features stay canonical English until a later batch.
	{ kind: 'element-field', elementID: 'culture-artisan-guild', field: 'name', canonicalEnglish: 'Artisan Guild', zhTW: '工匠公會', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-artisan-guild', field: 'description', canonicalEnglish: 'Urban, bureaucratic, creative.', zhTW: '城市、官僚、創作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-borderland-homestead', field: 'name', canonicalEnglish: 'Borderland Homestead', zhTW: '邊境家園', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-borderland-homestead', field: 'description', canonicalEnglish: 'Wilderness, communal, labor.', zhTW: '荒野、平權、勞動。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-college-conclave', field: 'name', canonicalEnglish: 'College Conclave', zhTW: '學院集會', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-college-conclave', field: 'description', canonicalEnglish: 'Urban, bureaucratic, academic.', zhTW: '城市、官僚、學術。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-criminal-gang', field: 'name', canonicalEnglish: 'Criminal Gang', zhTW: '犯罪幫派', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-criminal-gang', field: 'description', canonicalEnglish: 'Urban, communal, lawless.', zhTW: '城市、平權、法外。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-farming-village', field: 'name', canonicalEnglish: 'Farming Village', zhTW: '農耕村落', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-farming-village', field: 'description', canonicalEnglish: 'Rural, bureaucratic, labor.', zhTW: '鄉村、官僚、勞動。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-herding-community', field: 'name', canonicalEnglish: 'Herding Community', zhTW: '牧民社群', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-herding-community', field: 'description', canonicalEnglish: 'Nomadic, communal, labor.', zhTW: '遊牧、平權、勞動。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-knightly-order', field: 'name', canonicalEnglish: 'Knightly Order', zhTW: '騎士團', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-knightly-order', field: 'description', canonicalEnglish: 'Secluded, bureaucratic, martial.', zhTW: '隱居、官僚、尚武。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-mercenary-band', field: 'name', canonicalEnglish: 'Mercenary Band', zhTW: '傭兵團', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-mercenary-band', field: 'description', canonicalEnglish: 'Nomadic, bureaucratic, martial.', zhTW: '遊牧、官僚、尚武。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-merchant-caravan', field: 'name', canonicalEnglish: 'Merchant Caravan', zhTW: '行商車隊', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-merchant-caravan', field: 'description', canonicalEnglish: 'Nomadic, bureaucratic, creative.', zhTW: '遊牧、官僚、創作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-monastic-order', field: 'name', canonicalEnglish: 'Monastic Order', zhTW: '修道會', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-monastic-order', field: 'description', canonicalEnglish: 'Secluded, bureaucratic, academic.', zhTW: '隱居、官僚、學術。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-noble-house', field: 'name', canonicalEnglish: 'Noble House', zhTW: '貴族世家', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-noble-house', field: 'description', canonicalEnglish: 'Urban, bureaucratic, noble.', zhTW: '城市、官僚、貴族。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-outlaw-band', field: 'name', canonicalEnglish: 'Outlaw Band', zhTW: '亡命團體', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-outlaw-band', field: 'description', canonicalEnglish: 'Wilderness, communal, lawless.', zhTW: '荒野、平權、法外。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-pauper-neighborhood', field: 'name', canonicalEnglish: 'Pauper Neighborhood', zhTW: '貧民街區', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-pauper-neighborhood', field: 'description', canonicalEnglish: 'Urban, communal, labor.', zhTW: '城市、平權、勞動。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-pirate-crew', field: 'name', canonicalEnglish: 'Pirate Crew', zhTW: '海盜團', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-pirate-crew', field: 'description', canonicalEnglish: 'Nomadic, communal, lawless.', zhTW: '遊牧、平權、法外。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-telepathic-hive', field: 'name', canonicalEnglish: 'Telepathic Hive', zhTW: '心靈之巢', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-telepathic-hive', field: 'description', canonicalEnglish: 'Secluded, communal, creative.', zhTW: '隱居、平權、創作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-traveling-entertainers', field: 'name', canonicalEnglish: 'Traveling Entertainers', zhTW: '巡迴藝人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-traveling-entertainers', field: 'description', canonicalEnglish: 'Nomadic, communal, creative.', zhTW: '遊牧、平權、創作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-devil', field: 'name', canonicalEnglish: 'Devil', zhTW: '魔鬼', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-devil', field: 'description', canonicalEnglish: 'Urban, bureaucratic, academic.', zhTW: '城市、官僚、學術。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-dragon-knight', field: 'name', canonicalEnglish: 'Dragon Knight', zhTW: '龍騎士', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-dragon-knight', field: 'description', canonicalEnglish: 'Secluded, bureaucratic, martial.', zhTW: '隱居、官僚、尚武。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-dwarf', field: 'name', canonicalEnglish: 'Dwarf', zhTW: '矮人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-dwarf', field: 'description', canonicalEnglish: 'Secluded, bureaucratic, creative.', zhTW: '隱居、官僚、創作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-wode-elf', field: 'name', canonicalEnglish: 'Wode Elf', zhTW: '幻林精靈', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-wode-elf', field: 'description', canonicalEnglish: 'Wilderness, bureaucratic, martial.', zhTW: '荒野、官僚、尚武。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-high-elf', field: 'name', canonicalEnglish: 'High Elf', zhTW: '高等精靈', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-high-elf', field: 'description', canonicalEnglish: 'Secluded, bureaucratic, martial.', zhTW: '隱居、官僚、尚武。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-human', field: 'name', canonicalEnglish: 'Human', zhTW: '人類', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-human', field: 'description', canonicalEnglish: 'Urban, communal, labor.', zhTW: '城市、平權、勞動。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-orc', field: 'name', canonicalEnglish: 'Orc', zhTW: '歐克', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-orc', field: 'description', canonicalEnglish: 'Wilderness, communal, creative.', zhTW: '荒野、平權、創作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-polder', field: 'name', canonicalEnglish: 'Polder', zhTW: '波德人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-polder', field: 'description', canonicalEnglish: 'Urban, communal, creative.', zhTW: '城市、平權、創作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-hakaan', field: 'name', canonicalEnglish: 'Hakaan', zhTW: '哈肯人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-hakaan', field: 'description', canonicalEnglish: 'Rural, communal, labor.', zhTW: '鄉村、平權、勞動。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-memonek', field: 'name', canonicalEnglish: 'Memonek', zhTW: '梅莫人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-memonek', field: 'description', canonicalEnglish: 'Nomadic, communal, academic.', zhTW: '遊牧、平權、學術。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-time-raider', field: 'name', canonicalEnglish: 'Time Raider', zhTW: '時空獵手', approval: 'approved' },
	{ kind: 'element-field', elementID: 'culture-time-raider', field: 'description', canonicalEnglish: 'Nomadic, communal, martial.', zhTW: '遊牧、平權、尚武。', approval: 'approved' },
	// Career top-level name/description, addressed by the career's own ID. Career Features,
	// Inciting Incidents and nested authored content stay canonical English until a later batch.
	{ kind: 'element-field', elementID: 'career-agent', field: 'name', canonicalEnglish: 'Agent', zhTW: '特務', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-agent', field: 'description', canonicalEnglish: 'You worked as a spy for a government or organization.', zhTW: '你曾替政府或組織從事間諜工作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-aristocrat', field: 'name', canonicalEnglish: 'Aristocrat', zhTW: '貴族', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-aristocrat', field: 'description', canonicalEnglish: 'Career? Who needs a career when you’re born into money! Or marry into it! Or con your way into it! Whatever the case, you didn’t need to work thanks to (someone’s) generational wealth.', zhTW: '職業？若你含著金湯匙出生、嫁入豪門、或是巧妙地騙取財富，哪需要什麼職業？無論方式如何，多虧了世代傳承的財富，你完全不需要工作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-artisan', field: 'name', canonicalEnglish: 'Artisan', zhTW: '工匠', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-artisan', field: 'description', canonicalEnglish: 'You made and sold useful wares.', zhTW: '你製作並販售各種實用產品。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-beggar', field: 'name', canonicalEnglish: 'Beggar', zhTW: '乞丐', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-beggar', field: 'description', canonicalEnglish: 'You lived by going to a tavern, crossroads, city street, or other busy area and begging passersby for money or food.', zhTW: '你以前在酒館、十字路口、城市街道或其他人潮擁擠的地方，向路人乞討金錢或食物維生。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-criminal', field: 'name', canonicalEnglish: 'Criminal', zhTW: '罪犯', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-criminal', field: 'description', canonicalEnglish: 'You once worked as a bandit, insurgent, smuggler, outlaw, or even as an assassin.', zhTW: '你曾經當過強盜、叛亂分子、走私犯、亡命之徒，甚至是刺客。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-disciple', field: 'name', canonicalEnglish: 'Disciple', zhTW: '門徒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-disciple', field: 'description', canonicalEnglish: 'You worked in a church, temple, or other religious institution as part of the clergy.', zhTW: '你曾經在教會、神殿或其他宗教機構中擔任神職人員。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-explorer', field: 'name', canonicalEnglish: 'Explorer', zhTW: '探險家', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-explorer', field: 'description', canonicalEnglish: 'You ventured into uncharted areas and made your living as a cartographer, researcher, resource seeker, or treasure hunter.', zhTW: '你曾經冒險前往未知區域，靠著繪製地圖、研究、尋找資源或寶藏維生。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-farmer', field: 'name', canonicalEnglish: 'Farmer', zhTW: '農夫', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-farmer', field: 'description', canonicalEnglish: 'You grew crops or cared for livestock.', zhTW: '你曾經以種植農作物或照顧牲畜維生。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-gladiator', field: 'name', canonicalEnglish: 'Gladiator', zhTW: '角鬥士', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-gladiator', field: 'description', canonicalEnglish: 'In the past, you entertained the masses with flashy displays of violence in the arena.', zhTW: '你曾經在競技場中以華麗而暴力的表演娛樂大眾。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-laborer', field: 'name', canonicalEnglish: 'Laborer', zhTW: '勞工', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-laborer', field: 'description', canonicalEnglish: 'You worked as a farmer, builder, clothes washer, forester, miner, or some other profession engaged in hard manual labor.', zhTW: '你曾經當過建築工人、洗衣工、林務員、礦工或其他需要繁重體力勞動的工人。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-mages-apprentice', field: 'name', canonicalEnglish: 'Mage’s Apprentice', zhTW: '法師學徒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-mages-apprentice', field: 'description', canonicalEnglish: 'For long years, you studied magic under the mentorship of a more experienced mage.', zhTW: '你長年在一位經驗豐富的法師指導下學習魔法。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-performer', field: 'name', canonicalEnglish: 'Performer', zhTW: '藝人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-performer', field: 'description', canonicalEnglish: 'You can sing, act, or dance well enough that people actually pay to see you do it. Imagine that!', zhTW: '你擁有出色的歌唱、演戲或舞蹈技巧，讓人們願意為了觀賞你的表演而付錢。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-politician', field: 'name', canonicalEnglish: 'Politician', zhTW: '政治家', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-politician', field: 'description', canonicalEnglish: 'You worked as a leader within a formal, bureaucratic organization or government. You might have been appointed, born, or elected into your position, but getting people to agree and making decisions for the people you serve (or who served you) was your job.', zhTW: '你曾經在正式的官僚組織或政府中擔任領導者。你可能是透過任命、世襲或選舉獲得該職位，你的工作是促使人們達成共識，並為人民做出決策。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-sage', field: 'name', canonicalEnglish: 'Sage', zhTW: '學者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-sage', field: 'description', canonicalEnglish: 'From an early age, you dedicated yourself to learning, whether you shared the knowledge of the world with others or sought out secret lore only for yourself.', zhTW: '你從小就喜歡學習各種知識，無論是與他人分享世界的奧祕，還是純粹為了自己而尋求祕密的學問。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-sailor', field: 'name', canonicalEnglish: 'Sailor', zhTW: '水手', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-sailor', field: 'description', canonicalEnglish: 'You worked on a ship that might have been a merchant cog, a mercenary or military craft, or a pirate vessel. You might have been a deckhand, a mate, or even the captain.', zhTW: '你曾經在船上工作，無論是商船、傭兵船、軍艦，還是海盜船。你可能是甲板水手、大副，甚至是船長。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-soldier', field: 'name', canonicalEnglish: 'Soldier', zhTW: '士兵', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-soldier', field: 'description', canonicalEnglish: 'In your formative years, you fought tirelessly in skirmishes and campaigns against enemy forces.', zhTW: '多年以來，你不知疲倦地參加過無數場衝突與征戰。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-warden', field: 'name', canonicalEnglish: 'Warden', zhTW: '守望者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-warden', field: 'description', canonicalEnglish: 'You protected a wild region from those who sought to harm it, such as poachers and cultists bent on the destruction of the natural world. Knowing your land well, you could also serve as a guide or the leader of a rescue party for those wandering the wilds.', zhTW: '你曾經保護著一片荒野不受他人破壞，包括盜獵者和企圖毀滅大自然的邪教徒。由於你非常熟悉當地環境，你也會承擔嚮導和救援隊長的工作，幫助迷失在荒野中的人們。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-watch-officer', field: 'name', canonicalEnglish: 'Watch Officer', zhTW: '執法者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'career-watch-officer', field: 'description', canonicalEnglish: 'You served as an officer of the law for a local government. You might have been a single person in a much larger city watch or the only constable patrolling a small village.', zhTW: '你曾經當過地方政府的執法人員，可能是大城市警衛的一員，或是小村莊唯一的治安官。', approval: 'approved' },
	// Class top-level name/description, addressed by the class's own ID. Subclasses, Class
	// Features, abilities and other nested authored content stay canonical English until a
	// later batch. Multi-paragraph descriptions here are template literals so the approved
	// text can carry the same paragraph breaks as the canonical English.
	{ kind: 'element-field', elementID: 'class-censor', field: 'name', canonicalEnglish: 'Censor', zhTW: '懲戒者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-censor', field: 'description', canonicalEnglish: `
Demons and deathless fear you. Criminals run from the sight of your shadow. Agents of chaos, blasphemers, and heretics tremble at the sound of your voice. You carry the power of the gods, armed with wrath and sent out into the world first to seek, then censor those whose actions—or even existence—are anathema to your church.

As a censor, you’re at your best against the strongest foes. Your judgment terrifies heretics, stops enemies in their tracks, and even hurls them across the battlefield.`, zhTW: `惡魔與亡靈畏懼你；罪犯見你蹤影就倉皇逃逸；混沌爪牙、瀆神者和異端者聽到你的聲音便不寒而慄。你身負眾神之力，手持神聖怒火，奉命周遊世界，尋找並懲罰那些被教會視為禁忌的邪惡之徒。

身為懲戒者，你面對強敵時能夠大顯神威。你的審判令敵人膽戰心驚、裹足不前，甚至能將他們拋飛至戰場的另一端。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-conduit', field: 'name', canonicalEnglish: 'Conduit', zhTW: '神導士', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-conduit', field: 'description', canonicalEnglish: `
The power of the gods flows through you! As a vessel for divine power, you don’t just keep your allies in the fight. You make those allies more effective, even as you rain divine energy down upon your foes. Though the deity or saint you serve might have other faithful and clergy, you are special among worshippers, receiving your abilities from the highest source.

As a conduit, you heal and buff your allies, and debuff your foes while smiting them with divine magic. The spark of divinity within you shines, filling your enemies with awe and making you more worldly and aware.`, zhTW: `神力在你的體內奔流！身為神聖力量的載體，你不僅能讓盟友繼續奮戰，還能增強他們的力量，同時對敵人降下神聖的制裁。雖然你信奉的神明或聖者擁有眾多信徒和神職人員，但你是所有信眾中最獨特的存在，能夠直接從至高無上的源頭獲得力量。

身為神導士，你可以治療並強化盟友，同時用神聖魔法削弱並制裁敵人。你體內的神性光輝璀璨奪目，不只讓敵人心生敬畏，也讓你更加通曉世事、洞察萬物。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-elementalist', field: 'name', canonicalEnglish: 'Elementalist', zhTW: '元素師', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-elementalist', field: 'description', canonicalEnglish: `
Air for movement. Earth for permanence. Fire for destruction. Water for change. Green for growth. Rot for death. Void for the mystery. Years of study and practice and poring over tomes brought you the revelations that allow you to manipulate these building blocks of reality. Now you use your mastery of the seven elements to destroy, create, and warp the world with magic.

As an elementalist, you can unleash your wrath across a field of foes, put an enemy exactly where you want them, debilitate foes with harmful effects, ward yourself and allies against danger, manipulate terrain, warp space, and more. Your choice of elemental specialization determines which of these things you do best.`, zhTW: `疾風為流動；磐土為永恆；烈火為毀滅；流水為變化；翠息為生長；枯蝕為死亡；虛冥為詭祕。透過多年的學習、實踐，與埋首古籍，你終於領悟如何操縱這些構築現實的根基。如今，你掌握七大元素之力，能夠隨心所欲地改造這個世界。

身為元素師，你能夠向敵群傾瀉火力、削弱對手、庇護盟友、改變地形、扭曲空間等等，而你精通的元素決定了你在哪個領域最為出眾。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-fury', field: 'name', canonicalEnglish: 'Fury', zhTW: '熾怒者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-fury', field: 'description', canonicalEnglish: `
You do not temper the heat of battle within you. You unleash it! Your experience in the wild taught you the secrets of predators, and now, like the raptor, the panther, the wolf, you channel unfettered anger into martial prowess. Primordial Chaos is your ally. Let others use finesse to clean up the wreckage left in your wake.

As a fury, you devastate foes with overwhelming might, hurl yourself and enemies around the battlefield, and grow stronger as your ferocity increases. Nature has no concept of fairness — and neither do you..`, zhTW: `你從不壓抑體內的狂熱戰意，而是將其徹底釋放！在荒野中的歷練讓你領悟了掠食者的祕密。你如同猛禽、獵豹與野狼一般，將純粹的憤怒轉化為致命的戰技。原初混沌與你並肩作戰，就讓其他人去收拾你肆虐過後的殘局吧。

身為熾怒者，你以摧枯拉朽之力粉碎敵人，如旋風般席捲戰場，越戰越勇。大自然從不講求公平，你也一樣。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-null', field: 'name', canonicalEnglish: 'Null', zhTW: '無念者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-null', field: 'description', canonicalEnglish: `
The mind is not separate from the body. Perfection of one requires perfection of the other. You strive for perfect discipline, perfect order, mastery over mind and body becoming an unarmed psionic warrior who dampens and absorbs magic and psionics. You require no weapons, no tools. You suffice.

As a null, you resist the supernatural forces of the universe with composure and confidence. As you strive for perfect order, you are an enemy of the ultimate expression of chaos: the supernatural. Those who break the laws of nature using sorcery or psionics should fear you.

*"Any weapon can be turned against the hand that wields it."* - Ardashir`, zhTW: `心智與身軀本為一體，追求其一的完美，必然要追求另一者的完美。你追求絕對的紀律與秩序，並掌握身心的極致，進而成為一名能夠抑制並吸收魔法與靈能的徒手戰士。你不需要武器或工具，你已足矣。

身為無念者，你以沉著與自信抵抗宇宙的超常力量。在追求完美秩序的道路上，你與混沌的終極體現勢不兩立。那些利用魔法或靈能破壞自然法則的人，都應當畏懼你的存在。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-shadow', field: 'name', canonicalEnglish: 'Shadow', zhTW: '影舞者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-shadow', field: 'description', canonicalEnglish: `
Subtlety is your art, the tip of the blade your brush. You studied at a secret college, specializing in alchemy, illusion, or shadow-magics. Your training and knowledge place you among the elite ranks of assassins, spies, and commandos. But more potent than any weapon or sorcery is your insight into your enemies’ weaknesses.

As a shadow, you possess abilities that deal significant damage, enable you to move swiftly across the battlefield and evade hazards, and allow you to fade from notice even in the midstof the most intense combat encounters. You also possess more skills than any other hero.`, zhTW: `詭詐是你的藝術，刀鋒是你的畫筆。你曾經在一所祕密學院修行，專精於鍊金術、幻術或暗影魔法。你的訓練與知識讓你躋身刺客、間諜和特種部隊的精英之列。然而，比任何武器或法術更為強大的，是你洞察敵人弱點的能力。

身為影舞者，你不僅能造成大量的傷害，還能在戰場上靈活移動、避開危險，甚至在最激烈的戰鬥中消失無蹤。除此之外，你擁有的技能也比其他英雄更多。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-tactician', field: 'name', canonicalEnglish: 'Tactician', zhTW: '戰術家', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-tactician', field: 'description', canonicalEnglish: `
Strategist. Defender. Leader. With sword in hand, you lead allies into the maw of battle, barking out commands that inspire your fellow heroes to move faster and strike more precisely. All the while, you stand between your compatriots and death, taunting the followers of evil to best you if they can.

As a tactician, you have abilities that heal your allies and grant them increased damage, movement, and attacks.`, zhTW: `策略家、守護者、指揮官。你手持武器，率領盟友衝鋒陷陣，發出號令激勵同伴更快速且更精準地行動。你挺身擋在夥伴與死亡之間，向邪惡勢力發出挑戰，挑釁他們放膽來對付你。

身為戰術家，你能夠治療盟友，還能提升他們的傷害、移動能力和攻擊效果，同時讓敵人陷入混亂，難以應戰。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-talent', field: 'name', canonicalEnglish: 'Talent', zhTW: '異能者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-talent', field: 'description', canonicalEnglish: `
A rare few people are born with the potential to harness psionic power, but only those who experience an awakening, a significant event that activates a talent’s abilities, can tap into the mind’s full potential. You are one of those people—a master of psionics and a source of incredible power created through sheer force of will. You can move and change matter, time, gravity, the laws of physics, or another creature’s mind.

As a talent, you are limited only by the strength of your mind. But the ability to wield multiple powers at once and change reality at will involves a gamble. Every manifestation has a chance of harming you, and talents who use too much power too quickly pay a deadly price.`, zhTW: `只有極少數人天生就擁有駕馭靈能的潛力，但若要完全發揮心靈的力量，還必須經歷某個重大的覺醒時刻。你正是其中之一，能夠以純粹的意志力創造不可思議的壯舉。你可以移動並改變物質、時間、重力、物理法則，甚至是他人的心智。

身為異能者，你唯一的限制是自己的心智強度。然而，同時運用多種力量、隨心所欲地改變現實，也是一場危險的賭注。你每次展現能力都可能傷及自身，而在短時間內過度消耗靈能往往會付出致命的代價。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-troubadour', field: 'name', canonicalEnglish: 'Troubadour', zhTW: '遊唱家', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-troubadour', field: 'description', canonicalEnglish: `The whole world’s a stage, and everyone on it, an actor. No one knows this better than the troubadour. You find energy in the drama of everyday life and know how to draw spectacle forth from even the most mundane of situations. You accent highs and deepen lows in service to whoever might witness your performance.

As a troubadour, you chase drama. The insurmountable dangers of the world might cause many a hero to cower. But you take to that world stage not intending to die, but to find out if you are truly alive.

“History is a tale. Each of us is just a story we tell ourselves. Change the story, and you change the world.”
Jackson Bootblack`, zhTW: `整個世界就是一座舞台，每個人都是其中的演員。沒有人比遊唱家更明白這個道理。你能從日常生活的大小事汲取能量，善於將平凡的瞬間轉化為精彩的場面。為了打動觀眾，你將故事的高潮渲染得更加精彩，也讓低谷顯得更加深邃。

身為遊唱家，你時時刻刻追尋著戲劇張力。那些讓英雄們卻步的危險，對你而言是絕佳的機會。你踏上這個世界的舞台，不是為了赴死，而是為了探尋生命的真諦。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-beastheart', field: 'name', canonicalEnglish: 'Beastheart', zhTW: '獸魂者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-beastheart', field: 'description', canonicalEnglish: `
A beastheart never fights alone! You travel with a ferocious beast by your side — no trained pet, but an untamed creature such as a wolf, a basilisk, or even a young dragon. Bound to you by a primordial connection, your companion honors your wishes just as you are guided by their instincts. But beware! As battle rages on, your companion may succumb to a blood-soaked rampage, lashing out at enemies and friends alike.

As a beastheart, you face the world’s dangers alongside your wild companion. With your combined might, you rush into the thick of combat to challenge enemy champions or prowl around the outskirts to pick off vulnerable foes.`, zhTW: `獸魂者從不獨自作戰！你的身旁永遠伴隨著一頭兇猛野獸。牠不是受過訓練的普通寵物，而是狼、蜥怪，甚至幼龍之類的野獸。你與夥伴之間存在著某種原始野性的連結，牠尊重你的意願，你也會受到牠本能的引導，但要小心！隨著戰鬥愈演愈烈，你的夥伴可能會陷入血腥狂暴，不分敵我地發動攻擊。

身為獸魂者，你與野獸夥伴一同面對世界的危險。憑藉彼此的連攜力量，你可以殺入敵陣挑戰強者，也可以在戰場外圍伺機而動，逐一獵殺脆弱的敵人。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-summoner', field: 'name', canonicalEnglish: 'Summoner', zhTW: '召喚師', approval: 'approved' },
	{ kind: 'element-field', elementID: 'class-summoner', field: 'description', canonicalEnglish: `
You are the armada. The kings of old would trade armies for your abilities. You’ve undertaken the tradition that conjures an endless supply of warriors. You are the summoner, the mage who takes their dreams and makes them manifest.

You call forth minions to trudge fearlessly into the fray and provide support, holding the enemy at bay while you and your fellow heroes ready the counteroffensive. Your minions serve unflinchingly, unerringly, to their death or to yours.

You can also take advantage of powerful magic to buff your allies, whittle down your enemies, or enlist the fallen into your ranks. And when push comes to shove, you can call upon your champion to finish the fight.`, zhTW: `你一人就擁有大軍之力。你承襲了一門能召來無盡戰士的魔法流派，古代的國王甚至願意拿整支軍隊交換你的力量。你能夠召喚僕從，命令他們無所畏懼地衝入戰場、提供支援、牽制敵軍，好讓你與其他英雄發動反攻。你的僕從不會退縮、不會遲疑，直到它們或你死去。

你也能夠運用魔法強化盟友、削弱敵人，甚至將死者納入自己的軍隊。當戰況真正陷入危急時，你還能召喚自己麾下的強大勇士，為戰鬥畫下句點。`, approval: 'approved' },
	// Complication top-level name/description, addressed by the complication's own ID.
	// Complication Benefit/Drawback and nested Feature authored content stay canonical
	// English until a later batch. The two multi-line descriptions here are template
	// literals so the approved text can carry the same line break as the canonical English.
	{ kind: 'element-field', elementID: 'comp-advanced-studies', field: 'name', canonicalEnglish: 'Advanced Studies', zhTW: '進階研究', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-advanced-studies', field: 'description', canonicalEnglish: 'You somehow obtained the notebook of a brilliant but eccentric member of your class. The knowledge held within those notes should help you unlock powerful new abilities — if you can ever figure out what the notes mean.', zhTW: '你偶然從一位才華洋溢但行為古怪的同行拿到了一本筆記本。若你能解讀筆記內容，其中蘊藏的知識將會幫助你學會強大的全新招式。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-amnesia', field: 'name', canonicalEnglish: 'Amnesia', zhTW: '失憶', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-amnesia', field: 'description', canonicalEnglish: 'You have no memory of your past before the … incident. Hopefully you’ll regain your memory soon and find out what the incident was. In the meantime, you need friends so you’re not alone when your past catches up to you.', zhTW: '你對那次意外之前的往事毫無記憶。你希望能早日恢復記憶，找出當時究竟發生什麼事。同時，你需要結交朋友，這樣才不會獨自面對過往的人事物。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-animal-form', field: 'name', canonicalEnglish: 'Animal Form', zhTW: '動物形態', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-animal-form', field: 'description', canonicalEnglish: 'Due to a magical accident, your being has fused with a small, harmless animal. You turn into this animal when it’s convenient - and sometimes when it’s inconvenient as well.', zhTW: '由於一場魔法意外，你的靈魂與一隻無害的動物融合在一起。你可以在情況適合時變成那隻動物，但偶爾也會在不便的時候不自主地變身。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-antihero', field: 'name', canonicalEnglish: 'Antihero', zhTW: '反英雄', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-antihero', field: 'description', canonicalEnglish: 'You used to be a villain. You’re (mostly) reformed now, but in desperate moments, you sometimes draw on the rage and hatred that fueled your old life. In those moments, even your friends aren’t sure whose side you’re on. They don’t need to worry, though. Once you leave evil behind, you can’t go back. You’ve made too many enemies on the other side.', zhTW: '你曾經是個反派。如今你（大致上）已經改過自新，但在走投無路時，你仍然會重拾過往的憤怒與仇恨。每逢這種時候，連你的朋友都不確定你到底是邪是正。不過他們不必擔心，在你拋棄邪惡之後，你就無法回頭了，因為你已經樹立了太多敵人。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-artifactBonded', field: 'name', canonicalEnglish: 'Artifact Bonded', zhTW: '法寶連結', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-artifactBonded', field: 'description', canonicalEnglish: 'A powerful artifact has bonded to you. You might be destined to wield the artifact or to destroy it. You’re not powerful enough to use it at the moment, although you might be some day. For now, though, the artifact has no effect beyond getting you in trouble.', zhTW: '一件強大的法寶與你建立了連結，但你不確定自己是註定要使用這件法寶，還是要將其摧毀。你目前還不夠強大，無法使用它。雖然將來或許可以，但就現在而言，這件法寶除了給你惹麻煩之外，沒有任何作用。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-bereaved', field: 'name', canonicalEnglish: 'Bereaved', zhTW: '痛失摯親', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-bereaved', field: 'description', canonicalEnglish: 'The most important person to you - perhaps a family member, mentor, or lover - was killed. The only thing that keeps you going is the faint connection you have with this person’s spirit, and the hope that one day you can tie up their unfinished business and let them rest.', zhTW: '你生命中最重要的人（可能是家人、導師或愛人）慘遭殺害。唯一支持你繼續前進的，是你與他靈魂之間的微弱聯繫。你希望有朝一日能夠了結他未完成的心願，讓他安息。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-betrothed', field: 'name', canonicalEnglish: 'Betrothed', zhTW: '婚約', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-betrothed', field: 'description', canonicalEnglish: 'Your parents made a deal, and as part of that deal, you’re supposed to marry someone - or something - you didn’t choose. But no one is going to tell you what to do! They’ll all be sorry to find that you’ve run away to become a mighty adventurer.', zhTW: '你的雙親做了一筆交易，將你許配給某人（或某種東西）。你沒有選擇的權利，但你絕對不會任人擺佈！當他們發現你早已逃家並成為強大的冒險者時，一定會非常後悔。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-chaosTouched', field: 'name', canonicalEnglish: 'Chaos Touched', zhTW: '混沌浸染', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-chaosTouched', field: 'description', canonicalEnglish: 'You came into contact with a mote of pure chaos energy, or were subjected to a supernatural effect or object that fused chaos into your very being. Now you can sprout and retract limbs in a way that horifies unprepared onlookers.', zhTW: '你曾經接觸到一團純粹的混沌能量，或是遭受某種超自然效果或物品的影響，讓混沌之力融入你的靈魂。如今，你可以隨意地生長或收回你的肢體，讓沒有心理準備的旁觀者感到驚恐萬分。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-chosenOne', field: 'name', canonicalEnglish: 'Chosen One', zhTW: '天選之人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-chosenOne', field: 'description', canonicalEnglish: 'Perhaps the stars marked you out at birth, or maybe your name appears in an ancient prophecy. In any case, a sinister cult has decided that you’re important to their plans — though you don’t particularly like the fate those plans have in store for you.', zhTW: '或許你一出生就受到星辰的眷顧，又或者你的名字早就刻寫在古老的預言中。無論如何，一個邪惡的教團認定你就是完成計畫的關鍵之人，不管你喜不喜歡他們為你安排的宿命。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-consumingInterest', field: 'name', canonicalEnglish: 'Consuming Interest', zhTW: '強烈興趣', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-consumingInterest', field: 'description', canonicalEnglish: 'Ever since you were a kid, you’ve been obsessed with a certain topic. During your travels, you spend your free time gleaning all the information you can on that obsession. You might not be the world’s leading expert quite yet, but people should certainly trust your opinion on the topic.', zhTW: '從小到大，你就非常著迷某個特定的主題。在旅途中，你會將所有閒暇時間都用來蒐集和鑽研這個興趣。你也許還稱不上是這個領域的頂尖專家，但你的見解絕對占有一席之地。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-corruptedMentor', field: 'name', canonicalEnglish: 'Corrupted Mentor', zhTW: '墮落導師', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-corruptedMentor', field: 'description', canonicalEnglish: 'Your mentor taught you everything and you trusted them completely - until they went rogue, betraying you or the organization you both belonged to. Their current whereabouts and activities are unknown, though disturbing rumors are heard from time to time. Even worse, as their former pupil, you’re now under suspicion as well', zhTW: '你的導師教會你一切，你曾經完全信任他，直到他背叛了你或你們所屬的組織。他目前的行蹤無人知曉，但你偶爾會聽到令人不安的傳聞。更糟糕的是，你身為他過去的學生，也因此受到了質疑。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-coward', field: 'name', canonicalEnglish: 'Coward', zhTW: '膽小鬼', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-coward', field: 'description', canonicalEnglish: 'Some call you a coward, just because you shriek and run when you encounter danger. Sure, you might not have the natural bravado of less-imaginative people, and sure, you’re always imagining the many horrible ways you could die, but you’re used to fear. When you run in terror, you run toward the enemy.', zhTW: '有人說你是膽小鬼，因為你一遇到危險就尖叫逃跑。好吧，你也許不像那些遲鈍的人一樣天生大膽，而且你總會想像自己的各種死法，但你早就習慣恐懼了。當你嚇得拔腿狂奔時，你是朝著敵人衝過去。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-crashLanded', field: 'name', canonicalEnglish: 'Crash Landed', zhTW: '失事迫降', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-crashLanded', field: 'description', canonicalEnglish: 'You used to flit around the stars in your own ship. But an ugly run-in with a pirate (or a pirate hunter) has left you marooned on this backwater world. You’re prepared to carve out a life here — at least until you can hitch a ride somewhere else', zhTW: '你曾經開著自己的飛船在群星間穿梭，但你因為某次與海盜（或海盜獵人）的衝突而被困在這個落後的世界。你已經準備好在這裡闖出一條活路，希望哪天能搭上某艘船離開。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-cult-victim', field: 'name', canonicalEnglish: 'Cult Victim', zhTW: '邪教受害者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-cult-victim', field: 'description', canonicalEnglish: 'Cultists captured you while raiding your home, then began an unholy ritual to turn your body into an undead spirit. Though the ritual failed, your body became infused with corrupted magic, turning you partially incorporeal.', zhTW: '邪教徒在洗劫你的家園時俘虜了你，並進行一場邪惡的儀式，企圖將你的肉體轉化為不死的亡靈。雖然儀式失敗了，但你的身體卻被腐朽的魔法所侵蝕，變得有點透明。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-carefulCurse', field: 'name', canonicalEnglish: 'Curse of Caution', zhTW: '謹慎詛咒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-carefulCurse', field: 'description', canonicalEnglish: 'When you were young, you did something reckless and unthinking that endangered a hag or cost them something dear. The hag cursed you to always take your time, forcing you to be cautious and thorough — even to your detriment. The curse has saved you from trouble a few times, but not being able to get away from trouble might be your downfall if you can’t shake it.', zhTW: '你小時候曾做過一件魯莽的事情，讓一名鬼婆身陷險境，或害她失去珍貴寶物。鬼婆詛咒你凡事都得慢慢來，逼你時刻謹慎、面面俱到，即使這會反過來害了你。這道詛咒確實幫你避開了幾次麻煩，但若你無法擺脫它，這種讓你連逃離危險都慢慢來的謹慎，最後可能會害了你。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-curseOfImmortality', field: 'name', canonicalEnglish: 'Curse of Immortality', zhTW: '永生詛咒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-curseOfImmortality', field: 'description', canonicalEnglish: 'For as long as you can remember, you’ve never gotten older. You’ve simply adventured through one age after another. Still, your memory of past events — even those you were involved with — is a little hazy. Apparently, your memory isn’t as long-lived as you are.', zhTW: '從你有記憶以來，你永遠不會衰老，你只是一路冒險，走過一個又一個時代。不過，你過往的記憶全都模糊不清，即使是親身經歷過的也一樣。顯然，你的記憶並沒有像你的生命般長存。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-curseOfMisfortune', field: 'name', canonicalEnglish: 'Curse of Misfortune', zhTW: '厄運詛咒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-curseOfMisfortune', field: 'description', canonicalEnglish: 'You should have never pissed off that mage! Maybe they deserved your ire, or maybe you were just a bully. But whatever the case, they cursed you before skipping town. Now, in moments of pressure that require great skill, you have a tendency to choke, falling and flailing in such a dramatic fashion that you take everyone with you.', zhTW: '你真不該惹毛那個法師！也許對方確實欠教訓，或你單純惹錯人，但不管怎樣，那個法師在溜之大吉前詛咒了你。如今，每當面臨壓力、需要拿出真本事時，你總是容易失手、跌跌撞撞、手忙腳亂，甚至將身邊的所有人一起拖下水。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-curseOfPoverty', field: 'name', canonicalEnglish: 'Curse of Poverty', zhTW: '貧窮詛咒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-curseOfPoverty', field: 'description', canonicalEnglish: 'A soothsayer once predicted you would have a long life, even as they told you you’d never be rich. But you’re determined to prove them wrong. You’ll get rich or die trying!', zhTW: '曾有一名算命師預言你會長命百歲，但你一輩子都是窮鬼。你決定要證明對方是錯的。你就算賠上性命，也一定要發大財！', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-punishment-curse', field: 'name', canonicalEnglish: 'Curse of Punishment', zhTW: '懲罰詛咒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-punishment-curse', field: 'description', canonicalEnglish: 'Through ignorance, fear, spite, or selfishness, you refused to help someone in need. To teach you a lesson, a deity offered you what seemed to be a blessing — extra power to help you heal yourself in times of need, but harsh consequences should your need become excessive. You took the deal, and now benefit from the blessing but also suffer from a curse. ', zhTW: '出於無知、恐懼、惡意或自私，你曾經拒絕幫助一個有需要的人。為了給你一個教訓，一位神明賜予你看似祝福的力量，讓你能在需要時治療自己，但若太依賴這份力量，你將會面臨嚴厲的後果。你接受了這筆交易，如今既享受著祝福，也承受著詛咒。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-stoneCursed', field: 'name', canonicalEnglish: 'Curse of Stone', zhTW: '石化詛咒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-stoneCursed', field: 'description', canonicalEnglish: 'As a child, you met a creature that turns people to stone, such as a medusa. You escaped half-petrified, avoiding the fate of others who stand as statues now.', zhTW: '你小時候曾經遇到一個能將人石化的怪物（例如梅杜莎）。你雖然逃脫了，但身體仍有一半被石化，但至少你不像其他人當場變成了一座雕像。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-cursedWeapon', field: 'name', canonicalEnglish: 'Cursed Weapon', zhTW: '詛咒武器', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-cursedWeapon', field: 'description', canonicalEnglish: 'When you were young, you found or were given a magic weapon. Since then, you’ve carried it always at your side, letting it inspire you to lead the life of a hero — even though the weapon is cursed.', zhTW: '你小時候曾經找到一件魔法武器，或有人將它交給你。從那之後，你始終將它帶在身邊，並因此走上英雄之路，即使這把武器其實受了詛咒。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-disgraced', field: 'name', canonicalEnglish: 'Disgraced', zhTW: '蒙羞', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-disgraced', field: 'description', canonicalEnglish: 'You’re a disgraced member of a powerful family or guild, having been turned out by your relatives or peers. Those you were once close to won’t give you the time of day anymore, much less lend a helping hand, until you clear your name or clean up your act.', zhTW: '你原本是某個權勢家族或公會的一員，如今卻名譽掃地，被親人或同儕逐出門外。在你洗清污名或改過自新之前，昔日親友連搭理你都不願意，遑論伸出援手。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-dragonDreams', field: 'name', canonicalEnglish: 'Dragon Dreams', zhTW: '龍族夢境', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-dragonDreams', field: 'description', canonicalEnglish: 'You sometimes have strange dreams of a raging inferno … a gleaming pile of treasure … spreading your wings and taking flight. You haven’t told anyone about the dreams, except for your one strange relative who seems to know more than they’re letting on.', zhTW: '你有時會做一些奇怪的夢：熊熊燃燒的烈焰……閃閃發亮的寶藏堆……展開雙翼飛上天空。你只有將這些夢告訴那位古怪的親戚，而對方似乎知道些什麼，卻不肯多說。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-elemental-inside', field: 'name', canonicalEnglish: 'Elemental Inside', zhTW: '元素附身', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-elemental-inside', field: 'description', canonicalEnglish: 'When an evil mage threatened someone you loved, you blocked that foe’s summoning of an elemental creature by absorbing their magic with your body. You are now infused with the power of that elemental - who isn’t at all happy about it.', zhTW: '一名邪惡法師威脅了你所愛的人，但你用自己的身體吸收了對方的魔法，阻止法師召喚元素生物。如今，那股元素力量灌注在你的體內，而它對此一點也不高興。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-evanesceria', field: 'name', canonicalEnglish: 'Evanesceria', zhTW: '消隱症', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-evanesceria', field: 'description', canonicalEnglish: 'You have contracted a rare magical disease called evanesceria. From time to time, you’re not quite yourself—or anyone else either. You simply … vanish, then return later with no memory of your absence.', zhTW: '你感染了一種名為「消隱症」的罕見魔法疾病。你偶爾會不太像自己……或者說，根本不像任何人。你就這麼……消失了，過一陣子才會重新出現，而且對自己消失期間發生的事毫無記憶。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-exile', field: 'name', canonicalEnglish: 'Exile', zhTW: '流放', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-exile', field: 'description', canonicalEnglish: 'Whether you’re a convicted criminal, a noble stripped of their title, or a peron who made one too many enemies, you’ve been cast forth from your homeland, never to return. At least not until you’re strong enough to set things right.', zhTW: '無論你是被審判的罪犯、被剝奪頭銜的貴族，還是單純樹敵太多，你都已被逐出故鄉，永遠不得返回。除非你變得強大到足以回去解決一切。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-fallenImmortal', field: 'name', canonicalEnglish: 'Fallen Immortal', zhTW: '神使下凡', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-fallenImmortal', field: 'description', canonicalEnglish: 'You used to be an immortal creature, dispensing justice and doing the bidding of the gods. Now, as a punishment or reward, you have been ordered to set yor true nature aside and become a mortal. Your remaining years will be short, but living aside your fellow mortals gives your life new meaning.', zhTW: '你曾經是不朽的存在，替諸神執行旨意、伸張正義。如今，不知是罰是賞，你奉命捨棄自己的本質，成為凡人。你剩下的歲月將十分短暫，但與其他凡人共同生活，也讓你的生命有了全新的意義。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-famousRelative', field: 'name', canonicalEnglish: 'Famous Relative', zhTW: '名人親戚', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-famousRelative', field: 'description', canonicalEnglish: 'Sure, you’re a promising young hero in your own right - but people always ask you about your famous relative. Will you equal or surpass your relative’s accomplishments, or will you always live in their shadow?', zhTW: '你明明自己也是個前途無量的年輕英雄，但大家總愛問你那位赫赫有名的親戚。你有一天能追上甚至超越對方的成就嗎？還是永遠只能活在對方的光環之下？', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-feytouched', field: 'name', canonicalEnglish: 'Feytouched', zhTW: '妖精之觸', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-feytouched', field: 'description', canonicalEnglish: 'Your birth was attended by faeries. A friendly fairy blessed you, granting you strength so that you could defend yourself. In response, an unfriendly fairy granted you a life full of peril so that you might prove your strength.', zhTW: '你出生時有妖精在旁見證。一位友善的妖精祝福了你，賦予你足以保護自己的力量，但另一位不友善的妖精則賜給你充滿危險的一生，好讓你有機會證明自己的力量。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-fieryIdeal', field: 'name', canonicalEnglish: 'Fiery Ideal', zhTW: '熾熱信念', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-fieryIdeal', field: 'description', canonicalEnglish: 'A spirit beyond your comprehension instilled in you a special purpose, choosing you to be the guardian of a place, a cause, or a philosophy. The flame that now burns in your soul can sear your enemies — or you if you fall short of expectations', zhTW: '一個超越你理解的神靈賦予你一項特殊使命，選中你成為某個地方、某項志業或某種理念的守護者。如今你靈魂中的熊熊火焰能燒灼你的敵人，但若你辜負期待，你自己也會被灼傷。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-fire-and-chaos', field: 'name', canonicalEnglish: 'Fire And Chaos', zhTW: '火焰與混沌', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-fire-and-chaos', field: 'description', canonicalEnglish: 'A great monster who breathed fire burned your home to the ground. While everything around you was consumed, you somehow stood strong amid the inferno, your body adapting to ignore the effects of the flames.', zhTW: '一頭會噴火的巨獸將你的家園燒成灰燼。周遭的一切都被烈焰吞噬，你卻在火海中屹立不倒，身體也逐漸適應，變得不再受到火焰影響。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-followingInTheFootsteps', field: 'name', canonicalEnglish: 'Following in the Footsteps', zhTW: '亦步亦趨', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-followingInTheFootsteps', field: 'description', canonicalEnglish: 'Your personal idol was a mighty hero, and you have modeled yourself after them. From studying the many heroic tales told of them, you hope to someday learn their most famous battle technique.', zhTW: '你將某位傳奇英雄視為偶像，並以對方為榜樣。藉由鑽研無數關於偶像的英勇事蹟，你希望有朝一日能學會他最著名的戰鬥技巧。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-forbiddenRomance', field: 'name', canonicalEnglish: 'Forbidden Romance', zhTW: '禁忌之戀', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-forbiddenRomance', field: 'description', canonicalEnglish: 'You are in love with someone powerful, but tragic circumstances mean you cannot be with them. Whether your lover is from a feuding family, betrothed to another, or has been driven from your side, you are fated to always be apart.', zhTW: '你愛上一位有權有勢的人，但悲劇般的處境讓你們無法相守。無論你的愛人來自與你敵對的家族、早已許配給別人，還是被迫離開你的身邊，你們似乎註定永遠無法在一起。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-frostheart', field: 'name', canonicalEnglish: 'Frostheart', zhTW: '冰霜之心', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-frostheart', field: 'description', canonicalEnglish: 'At the edge of the world, you were lost in a winter storm and presumed dead. But an unknown fate or power kept you alive, bringing you back with frosty skin and pale eyes.', zhTW: '在世界的邊陲，你曾經在一場冬季暴風雪中失蹤，眾人都以為你已經死去，但某種未知的命運或力量保住了你的性命，讓你帶著覆霜的肌膚與蒼白的雙眼歸來。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-gettingTooOldForThis', field: 'name', canonicalEnglish: 'Getting Too Old For This', zhTW: '老骨頭', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-gettingTooOldForThis', field: 'description', canonicalEnglish: 'You used to be a renowned hero, but you’ve been living the last few years in blissful peace. Now you’re coming out of retirement for one last hurrah. Your fighting skills have atrophied to the point where you’re no stronger than a wet-behind-the-ears starting adventurer, but you still remember some of your old tricks.', zhTW: '你曾經是聲名遠播的英雄，但過去幾年都在幸福安穩的生活中度過。如今你決定重出江湖，再拚最後一回。你的戰鬥本領已經生疏到跟乳臭未乾的菜鳥冒險者差不多，但有些老招數你可沒忘。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-gnollMauled', field: 'name', canonicalEnglish: 'Gnoll-Mauled', zhTW: '遭鬣狗人重創', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-gnollMauled', field: 'description', canonicalEnglish: `
As a child, you survived a gnoll attack. But that attack left you with a toothy scar and the occasional fit of bloodlust.

You can’t take this complication if you can’t be made dazed.`, zhTW: `你小時候曾被鬣狗人襲擊。儘管你倖存下來，但你全身滿是齒痕的傷疤，甚至偶爾會陷入嗜血的衝動。

若你不會陷入暈眩，你不能選擇這項糾葛。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-greening', field: 'name', canonicalEnglish: 'Greening', zhTW: '汲取翠息', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-greening', field: 'description', canonicalEnglish: 'You once felt the call of a great tree in the middle of a forest, whose life force was being drained by a parasitic supernatural moss clinging to its roots. As you removed the moss, you felt as if you were being filled with green elemental energy. Sadly, the great tree withered before you could finish the job, but left behind a golden sapling you now carry with you, seeking the perfect place to plant it.', zhTW: '你曾經在森林深處感受到一棵巨大古樹的呼喚。那棵樹的生命力正被某種寄生於樹根的超自然苔蘚所吸取。當你移除這些苔蘚時，一股翠息元素能量湧入你的體內，但遺憾的是，古樹早已枯萎，只留下一株金色的幼苗。如今你帶著這株幼苗，四處尋找最適合栽種它的地方。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-grifter', field: 'name', canonicalEnglish: 'Grifter', zhTW: '騙徒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-grifter', field: 'description', canonicalEnglish: 'You used to be a con artist, but those days are pretty much behind you. Being a hero is an even better racket. After all, if you’re saving the world, who can be mad at you for stealing a couple of coins along the way?', zhTW: '你以前是個騙子，但那種日子早已過去，當英雄好賺多了。畢竟，在拯救世界的路上摸走幾枚硬幣，誰會怪你？', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-grounded', field: 'name', canonicalEnglish: 'Grounded', zhTW: '大地連結', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-grounded', field: 'description', canonicalEnglish: 'Once when you were a child, your settlement was in danger and you called out to the earth for aid. That call was answered by a summoning of protective dirt-and-stone walls, and ever since then, you’ve felt the earth’s presence as a friend and protector.', zhTW: '在你還小的時候，你的家園曾經陷入危機，於是你向大地請求幫助。大地回應了你的呼喚，召起泥土與岩石構成的障壁保護眾人。從那之後，你總能感受到大地的存在，並將它視為朋友與守護者。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-guiltyConscience', field: 'name', canonicalEnglish: 'Guilty Conscience', zhTW: '罪疚感', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-guiltyConscience', field: 'description', canonicalEnglish: 'The world is in trouble - and it’s partly your fault. Maybe you helped a villain rise to power or inadvertently released a demon from imprisonment. Now it’s your mission to repair the damage you caused.', zhTW: '這個世界陷入了危險，而你得負上一部分責任。也許你曾經幫助一名反派獲得力量，又或者不小心讓一隻惡魔脫離囚禁。如今，你的使命就是彌補自己造成的傷害。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-hawkRider', field: 'name', canonicalEnglish: 'Hawk Rider', zhTW: '飛鷹騎士', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-hawkRider', field: 'description', canonicalEnglish: 'You travel with a giant hawk that you stole from the Hawklords. Perhaps you might once have been a Hawklord yourself, or perhaps you escaped their captivity.  Having a giant hawk companion comes with its share of inconveniences and dangers, but those are a small price to pay for the freedom of the open sky.', zhTW: '你與一隻從鷹王那裡偷來的巨鷹一同旅行。你也許曾經就是一名鷹王，或者曾經是他們的囚徒。擁有巨鷹作伴固然少不了麻煩與危險，但與翱翔天際的自由相比，這點代價微乎其微。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-hearsVoices', field: 'name', canonicalEnglish: 'Voice in your Head', zhTW: '腦中傳音', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-hearsVoices', field: 'description', canonicalEnglish: 'You occasionally hear a voice in your head, giving you orders or offering advice. You don’t know who the voice is or why it comes to you, but when you’ve followed the advice, it’s usually proved to be sound.', zhTW: '你偶爾會聽見腦中有個聲音對你下達命令或提供建議。你不知道那是誰的聲音，也不知道對方為什麼找上你，但每當你聽從建議行動時，通常都是明智的選擇。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-hostBody', field: 'name', canonicalEnglish: 'Host Body', zhTW: '宿主軀體', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-hostBody', field: 'description', canonicalEnglish: '“Do not be alarmed! We are not the humanoid we appear to be. We are an intelligent fungal collective, using this body as a host. No, we are doing nothing unsavory! This body was dead when we found it, and we merely gave it another chance at life. We are friendly. Please put down those torches!”', zhTW: '「別緊張！我們不是你眼前的這個類人生物。我們是具有智慧的真菌集群，只是將這具身體當成宿主。不，我們才沒有做什麼見不得人的事！這具身體早就死了，我們只是給它再活一次的機會。我們很友善，請放下那些火把！」', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-hunted', field: 'name', canonicalEnglish: 'Hunted', zhTW: '獵物', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-hunted', field: 'description', canonicalEnglish: 'You’re one step ahead of a pursuer - perhaps a bounty hunter determined to bring you to justice, a revenant, or an assassin intent on your death. Someday, you’ll be strong enough to face your pursuer head to head. But for now, you live your life on the run.', zhTW: '你始終比追捕者快一步。對方可能是決心將你繩之以法的賞金獵人、還魂屍，或一心取你性命的刺客。總有一天，你會強大到足以正面迎戰追捕者，但現在你只能過著四處逃亡的生活。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-hunter', field: 'name', canonicalEnglish: 'Hunter', zhTW: '獵人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-hunter', field: 'description', canonicalEnglish: 'You’re hunting someone or something - perhaps a wanted criminal or someone who wronged you, or perhaps a dangerous monster or beast. You won’t rest until you face off against your quarry!', zhTW: '你正在追捕某個人或某個東西，也許是通緝犯、曾經傷害你的人、危險的怪物或野獸。在親自面對獵物之前，你絕不罷休！', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-indebted', field: 'name', canonicalEnglish: 'Indebted', zhTW: '債台高築', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-indebted', field: 'description', canonicalEnglish: 'A deal you made went south, or you got involved with the wrong people. Now you owe a debt or a ransom that would bankrupt a minor noble. To pay it off, you’ll need to take some dangerous risks.', zhTW: '你做過的一筆交易徹底搞砸了，又或是你招惹了不該招惹的人。如今，你欠下的債務或贖金足以讓小貴族破產。想還清這筆錢，你恐怕得做些危險的工作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-infernalContract', field: 'name', canonicalEnglish: 'Infernal Contract', zhTW: '地獄契約', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-infernalContract', field: 'description', canonicalEnglish: 'You made a deal (perhaps unknowingly) with an archdevil that has tied you to that fiend’s service. When you first learned of this deal, you were taken to the Seven Cities of Hell, where some of the timescape’s best minds taught you the ways of battle. The archdevil allows you to use these gifts as you will … until they require a favor from you.', zhTW: '你曾經與一名大魔鬼達成交易（也許是在不知情的情況下），使你必須為對方效命。當你第一次知道這筆交易時，你被帶到地獄七城，由時界中一些最傑出的人才教導你戰鬥技巧。那名大魔鬼允許你隨意運用這些本領……但你總有一天必須履行契約。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-infernalContractButLikeBad', field: 'name', canonicalEnglish: 'Infernal Contract … But, Like, Bad', zhTW: '糟糕的地獄契約', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-infernalContractButLikeBad', field: 'description', canonicalEnglish: 'You made a deal with a devil. Not a very good deal, because it wasn’t a very good devil. It’s too late for regrets, though, because your soul is forfeit unless you find a loophole or convince the devil to void the deal.', zhTW: '你和一個魔鬼做了交易。那不是什麼好交易，因為那魔鬼也不是什麼好東西，但現在後悔已經太遲了。除非你能找到契約的漏洞，或說服那個魔鬼讓交易作廢，否則你的靈魂就歸它了。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-ivoryTower', field: 'name', canonicalEnglish: 'Ivory Tower', zhTW: '象牙塔', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-ivoryTower', field: 'description', canonicalEnglish: 'You studied in an academy or other educational institution. Your training was thorough and your reading list was wide-ranging.  But when you left school, you discovered that there were serious gaps in your education. Maybe some of those books were a little out of date.', zhTW: '你曾在學院或其他教育機構中求學。你受過完整的訓練，也讀過各種領域的大量書籍，但離開學校之後，你才發現自己的教育有一些嚴重的缺口。也許有些書已經有點過時了。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-lifebonded', field: 'name', canonicalEnglish: 'Lifebonded', zhTW: '生命連結', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-lifebonded', field: 'description', canonicalEnglish: 'In a sinister ritual, your soul has been bound to that of another creature. This might be a companion, a creature you are beholden to, or an enemy. When they die, you die — making you the perfect bodyguard.', zhTW: '在一場邪惡的儀式中，你的靈魂與另一個生物的靈魂連結在一起。對方可能是你的同伴、你的親友，或甚至是你的敵人。只要對方死亡，你也會一起死，這讓你成了最完美的保鑣。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-lightningSoul', field: 'name', canonicalEnglish: 'Lightning Soul', zhTW: '雷霆之魂', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-lightningSoul', field: 'description', canonicalEnglish: 'You were caught in a storm and stuck by lightning - but somthing saved you from death. Perhaps it was a gods-given miracle, a latent psionic gift, or the magic of a helpful elementalist, but you absorbed the lightning into your body. It’s always there now, simmering under the surface.', zhTW: '你曾被捲入一場暴風雨並遭到雷擊，但某種力量救了你一命。也許那是神明賜予的奇蹟、潛藏的靈能天賦，或是好心元素師的魔法。如今，雷霆之力潛伏在你身體深處，蓄勢待發。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-loner', field: 'name', canonicalEnglish: 'Loner', zhTW: '獨行俠', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-loner', field: 'description', canonicalEnglish: 'You’ve always been a lone wolf. With no one else to lean on, you’ve picked up a million survival tricks. Which made it all the more surprising when you joined your current adventuring group and found the family you’d never known you needed.', zhTW: '你一直以來都是匹孤狼。由於從來沒有人可以依靠，你學會了數不清的求生技巧，但在加入現在的冒險團隊後，你才驚訝地發現自己如此需要溫暖的家。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-lostInTime', field: 'name', canonicalEnglish: 'Lost in Time', zhTW: '時光迷途', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-lostInTime', field: 'description', canonicalEnglish: 'In a long-ago age, a cataclysm overtook your city. You weren’t killed, but some arcane accident caused you to be suspended in time until now. Alone, you must navigate the world around you with a head full of outdated memories - and a few ancient secrets.', zhTW: '很久很久以前，一場大災難席捲了你的城市。你沒有死，但某個奧術意外讓你被凍結在時間之中，直到現在才重新出現。孤身一人的你，只能帶著滿腦的過時記憶和幾個古老祕密，設法適應眼前的世界。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-lostYourHead', field: 'name', canonicalEnglish: 'Lost Your Head', zhTW: '身首分離', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-lostYourHead', field: 'description', canonicalEnglish: 'A bredbeddle stole your head! Usually, being beheaded by one of those magical giants is fatal, but your latent psionic ability allows you to survive despite your decapitation.', zhTW: '一名奪首巨人偷走了你的腦袋！通常來說，被那些魔法巨人砍下頭顱是必死無疑，但你潛藏的靈能力量讓你即使掉了腦袋仍活了下來。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-lucky', field: 'name', canonicalEnglish: 'Lucky', zhTW: '幸運兒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-lucky', field: 'description', canonicalEnglish: 'You’ve always had a lucky streak. When you leave things in the hands of fate, you succeed more than you fail. But luck is fickle - when you don’t trust it, it deserts you.', zhTW: '你的運氣一直都很好。每當你將事情交給命運決定時，成功的次數總比失敗還多。不過運氣是反覆無常的，一旦你不相信它，它也會背棄你。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-masterChef', field: 'name', canonicalEnglish: 'Master Chef', zhTW: '大廚', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-masterChef', field: 'description', canonicalEnglish: 'Before you were a hero, you were a chef - and when you retire, you have big plans for your next restaurant or inn. In the meantime, you’re on the lookout for rare ingredients that only a wandering adventurer can find. After all, it’s food that makes the world go round.', zhTW: '在成為英雄之前，你是一名廚師。你相信世界是靠美食運轉的，所以你夢想在退休後開一間餐廳或客棧，但在那之前，你需要四處旅行尋找各種稀有食材。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-meddlingButler', field: 'name', canonicalEnglish: 'Meddling Butler', zhTW: '嘮叨管家', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-meddlingButler', field: 'description', canonicalEnglish: 'You’re not sure what you did to deserve it, but for some reason your family saddled you with an old, trusted, and extremely irritating family servant. They’re supremely competent, of course, but they sometimes seem to forget who’s in charge.', zhTW: '你不確定自己造了什麼孽，但你的家人不知為何派了一名資深、忠誠，但同時也極度惹人厭的僕人跟隨你。當然，他非常稱職，但似乎偶爾會忘記誰才是主人。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-medium', field: 'name', canonicalEnglish: 'Medium', zhTW: '靈媒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-medium', field: 'description', canonicalEnglish: 'You can perceive ghosts and spirits that others sense. These supernatural entities constantly whisper unsettling secrets in your mind - when they’re not trying to kill you.', zhTW: '你能感應到一般人無法察覺的鬼魂與靈體。這些超自然的存在不斷在你的腦海中低語著令人不安的祕密。當然，前提是它們當時沒有試圖殺你。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-medusaBlood', field: 'name', canonicalEnglish: 'Medusa Blood', zhTW: '梅杜莎血脈', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-medusaBlood', field: 'description', canonicalEnglish: 'Your mother and father never saw eye to eye. You know this because your father is still alive and your mother is a medusa. This made your childhood difficult, and now it’s making your adulthood complicated as well.', zhTW: '你的父母從來就看不對眼。你之所以知道這點，是因為你的父親到現在還活著，而你的母親是一隻梅杜莎。這讓你的童年過得非常辛苦，而你成年後的生活也沒有比較順遂。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-misunderstood', field: 'name', canonicalEnglish: 'Misunderstood', zhTW: '遭人誤解', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-misunderstood', field: 'description', canonicalEnglish: 'Your appearance marks you as part of a group that is universally feared. You might be a gentle soul, but you’re not often given a chance to prove it. It’s no wonder that you usually wear a hood.', zhTW: '你的外貌讓所有人都認為你屬於某個可怕的族群。你也許其實心地善良，但通常沒有人願意給你機會證明這一點。難怪你總是戴著兜帽。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-mundane', field: 'name', canonicalEnglish: 'Mundane', zhTW: '凡夫俗子', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-mundane', field: 'description', canonicalEnglish: 'You’re hopelessly nonmagical. When you try to use magical abilities, or even when they’re used on you, they never work right. Even magical devices seem to fizzle in your presence.', zhTW: '你徹徹底底與魔法無緣。無論是你嘗試使用魔法招式，還是別人對你使用魔法，總會出現各種問題。就連魔法物品到了你身邊，似乎也會莫名失靈。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-outlaw', field: 'name', canonicalEnglish: 'Outlaw', zhTW: '亡命之徒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-outlaw', field: 'description', canonicalEnglish: 'You might be a common bandit or an idealistic freedom fighter, but in either case, the authorities don’t approve of your actions. You’ve managed to stay one step ahead of the law so far, but until your name is cleared, you’ve got to keep a low profile.', zhTW: '你可能是個普通的盜匪，也可能是個懷抱理想的自由鬥士，但無論如何，當局並不認可你的行為。到目前為止，你總是能躲過法律的制裁，但在洗刷罪名之前，你最好保持低調。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-pirate', field: 'name', canonicalEnglish: 'Pirate', zhTW: '海盜', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-pirate', field: 'description', canonicalEnglish: 'You have a piratical past (and maybe a piratical present and future as well). Though you’re not well-known ashore, other pirates have a way of recognizing their own.', zhTW: '你曾經當過海盜（搞不好現在還沒金盆洗手）。雖然陸地上的人不太認識你，但海盜之間總有辦法認出自己人。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-preacher', field: 'name', canonicalEnglish: 'Preacher', zhTW: '傳教士', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-preacher', field: 'description', canonicalEnglish: 'When you were young, you almost died in an accident or attack, but a vision of a god or saint showed you the way to save yourself and others you loved. That event drove you into the church and gave you a strong belief in a particular religion or cause — and you can’t wait to tell other people all about it.', zhTW: '年輕時，你曾經因為一場意外或襲擊差點喪命，但神明或聖者的異象指明了讓你拯救自己與所愛之人的方法。這次經歷讓你投身教會，並對某個特定的宗教或信念產生堅定的信仰，而你迫不及待想將它分享給所有人。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-primordial-sickness', field: 'name', canonicalEnglish: 'Primordial Sickness', zhTW: '原初疾病', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-primordial-sickness', field: 'description', canonicalEnglish: 'You once contracted a terrible illness for which no one could find a cure. You sought out a primordial swamp said to be either incredibly poisonous or miraculously salubrious. It turned out to be both, keeping your illness at bay while corrupting your body with its unnatural energy.', zhTW: '你曾經染上一種無人能治的可怕疾病。為了尋求生機，你前往一片傳聞中要麼劇毒無比、要麼具有奇蹟療效的原初沼澤。結果兩種說法都是真的：那片沼澤抑制了你的病情，但你的身體也遭到反常的能量腐化。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-prisonerOfTheSynlirii', field: 'name', canonicalEnglish: 'Prisoner of the Synlirii', zhTW: '心語者的囚徒', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-prisonerOfTheSynlirii', field: 'description', canonicalEnglish: 'You were captured by the psionic beings known as voiceless talkers. You escaped them, but you can’t escape a feeling that’s lingered since then in the back of your mind - the feeling of being watched.', zhTW: '你曾遭到一群被稱為「心語者」的靈能生物俘虜。雖然你成功逃脫，但某種如影隨形的感覺始終盤踞在你的腦海深處，似乎有人無時無刻在監視著你。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-promisingApprentice', field: 'name', canonicalEnglish: 'Promising Apprentice', zhTW: '後生可畏', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-promisingApprentice', field: 'description', canonicalEnglish: 'You were apprenticed to learn a crafting trade. Your mentor said you had a special gift and might well become a master of your craft someday. But before your training was complete, your mentor was killed.', zhTW: '你曾經拜師學習一門技藝。導師說你天賦異稟，總有一天可能會成為這門技藝的大師。然而就在你完成訓練之前，導師遭人殺害了。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-psychicEruption', field: 'name', canonicalEnglish: 'Psychic Eruption', zhTW: '心靈爆發', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-psychicEruption', field: 'description', canonicalEnglish: 'In times of stress, you get headaches. Psionic energy builds up in your mind until you feel as though your head might explode. And if you’re not careful, it actually does explode, radiating psychic waves that harm friends and enemies alike.', zhTW: '每當壓力升高，你就會開始頭痛。異能力量逐漸在你的腦中累積，直到你覺得自己的腦袋快要爆炸。如果你不夠小心，它真的會爆發，釋放出心靈震波，無差別傷害朋友與敵人。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-raisedByBeasts', field: 'name', canonicalEnglish: 'Raised by Beasts', zhTW: '獸群之子', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-raisedByBeasts', field: 'description', canonicalEnglish: 'You were orphaned or lost in the wild, and a friendly animal pack (perhaps apes, bears, or wolves) took you in. Returning to so-called civilization was a shock, but you’re now determined to learn all you can about your own kind.', zhTW: '你從小就失去雙親或在荒野中迷路，後來被一群友善的動物收養（可能是猿猴、熊或狼）。回到所謂的文明社會對你而言是極大的衝擊，但如今你決心盡可能了解自己的同類。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-refugee', field: 'name', canonicalEnglish: 'Refugee', zhTW: '難民', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-refugee', field: 'description', canonicalEnglish: 'A hostile army - perhaps the forces of Ajax, the Iron Saint - conquered your homeland. Your family escaped, but you can’t return home until your oppressors are defeated once and for all.', zhTW: '一支敵軍征服了你的故鄉（可能是『鐵血聖者』艾傑克斯的大軍）。雖然你與家人成功逃了出來，但在徹底擊敗暴君之前，你永遠無法回家。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-rival', field: 'name', canonicalEnglish: 'Rival', zhTW: '勁敵', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-rival', field: 'description', canonicalEnglish: 'Whatever your accomplishments, you’ll forever measure yourself against a former companion who always seemed to be one step ahead of you.', zhTW: '無論你取得多少成就，你永遠會拿自己與昔日的一名同伴做比較，而他似乎總是比你領先一步。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-rogueTalent', field: 'name', canonicalEnglish: 'Rogue Talent', zhTW: '野生異能', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-rogueTalent', field: 'description', canonicalEnglish: 'You are the only survivor of a cataclysmic psionic event - an experiment gone wrong, a voiceless talker attack, or some naturally occurring phenomenon of a far-off part of the timescape. It left you with a psionic talent, but also made you vulnerable to telepathic attacks.', zhTW: '你是一場異能災難中的唯一倖存者，也許是一場失敗的實驗、心語者的襲擊，或發生在時界遙遠角落的某種自然現象。那次事件讓你獲得了異能天賦，但也讓你特別容易受到心靈的攻擊。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-runaway', field: 'name', canonicalEnglish: 'Runaway', zhTW: '離家出走', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-runaway', field: 'description', canonicalEnglish: 'To your embarrassment, no sinister omens attended your birth and your closet contains no skeletons. You’re just an ordinary person raised in a hardworking family. You’re expected to carry on the family business - but who can settle down to a boring job when adventure calls! That’s why you ran away.', zhTW: '說來有點丟臉。你出生時沒有任何不祥預兆，家裡也沒有什麼不可告人的祕密，你就只是一個出生在勤勞家庭的普通人。大家都期望你繼承家業，但你想要冒險，不想做那些無聊的工作！所以你離家出走了。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-searchingForACure', field: 'name', canonicalEnglish: 'Searching for a Cure', zhTW: '尋找解方', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-searchingForACure', field: 'description', canonicalEnglish: 'Your homeland has been corrupted by some terrible curse or plague, and you’re the only one who escaped it. The members of your family still exist, but in changed forms - perhaps as vampire spawn, zombies, or living statues. People tell you the situation is hopeless, but you’re determined to find a cure that can undo your loved ones’ suffering.', zhTW: '你的故鄉遭到某種可怕的詛咒或瘟疫侵蝕，而你是唯一逃出來的人。你的家人還在，但已經變成不同的樣子，可能成為吸血鬼的衍體、殭屍或活石像。所有人都告訴你已經無藥可救，但你決心要找到一個解方，終結所愛之人的痛苦。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-secretIdentity', field: 'name', canonicalEnglish: 'Secret Identity', zhTW: '祕密身分', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-secretIdentity', field: 'description', canonicalEnglish: 'You’re secretly very important - but it’s not safe for your true identity to be known. Perhaps you’re the witness to a crime or a royal family on the run from a usurper. Until you are no longer at risk of being hunted, you’ll maintain the guise of an ordinary adventurer.', zhTW: '你其實是個非常重要的人物，但出於安全考量，你不能讓人知道你的真實身分。你可能是一宗犯罪事件的證人，或是為了躲避篡位者而逃亡的王室成員。除非不再面臨追殺的威脅，否則你必須繼續偽裝成普通的冒險者。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-secretTwin', field: 'name', canonicalEnglish: 'Secret Twin', zhTW: '祕密雙子', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-secretTwin', field: 'description', canonicalEnglish: 'You have an identical twin - either a sibling or someone who looks so much like you that none would ever know the difference. They had a life that you coveted, or they had obligations that couldn’t go unfulfilled. So when they went missing, you stepped in and started living their life. Most folks are none the wiser.', zhTW: '有一個長得跟你一模一樣的人，可能是你的兄弟姊妹，也可能只是單純長得超像。對方過著你夢寐以求的生活，或背負著難以想像的責任。因此當對方失蹤後，你便取而代之，開始過著對方的人生，而大多數人完全沒有察覺。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-selfTaught', field: 'name', canonicalEnglish: 'Self Taught', zhTW: '自學成才', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-selfTaught', field: 'description', canonicalEnglish: 'While your peers were learning their trades in fancy schools, you whoned your capabilities on the mean streets with nothing but your own instinct as a guide. What you lost in polish and tactical acumen, you now make up for in raw power.', zhTW: '當同儕在華麗的學院裡鑽研各自的本領時，你只憑自己的直覺，在龍蛇混雜的街頭磨練能力。你或許缺乏正規訓練帶來的純熟技巧與戰術素養，但如今你以純粹的力量彌補了這些不足。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-sewerFolk', field: 'name', canonicalEnglish: 'Sewer Folk', zhTW: '下水道居民', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-sewerFolk', field: 'description', canonicalEnglish: 'Impoverished or on the run, you spent formative years living in the sewers of a major city. There, you learned lessons that have served you well, although the miasma of the sewers did permanent damage to your health.', zhTW: '由於窮困潦倒或四處逃亡，你從小就生活在某座大城市的下水道。在那裡，你學到許多至今仍受用無窮的生存之道，但下水道裡的瘴氣也永久損害了你的健康。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-shadowBorn', field: 'name', canonicalEnglish: 'Shadow Born', zhTW: '暗影之子', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-shadowBorn', field: 'description', canonicalEnglish: 'You were born in the dusk land ruled by the Queen of Shadows, and its darkness has seeped into your bones.', zhTW: '你出生於暗影女王統治的暮色國度，那裡的黑暗早已滲入你的骨髓。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-sharedSpirit', field: 'name', canonicalEnglish: 'Shared Spirit', zhTW: '共生靈體', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-sharedSpirit', field: 'description', canonicalEnglish: 'A supernatural spirit shares your body, with each of you controlling your body by turn. You and the spirit share the same short-term goals and work equally well with your companions, though you might have different personalities, mannerisms, and long-term goals.', zhTW: '一個超自然靈體進駐了你的身體，導致你們兩人輪流掌控身體。雖然你們可能有著不同的個性、舉止和長期目標，但你們共享著相同的短期目標，也都能與其他同伴好好合作。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-shatteredLegacy', field: 'name', canonicalEnglish: 'Shattered Legacy', zhTW: '破碎遺產', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-shatteredLegacy', field: 'description', canonicalEnglish: 'You’re the heir to a powerful supernatural treasure that has been in your family for generations. One problem, though: the treasure is broken. Some ancestor of yours sundered it while saving the world. Or maybe they tripped and smashed it on a rock. Either way, it’s your job to fix it.', zhTW: '你繼承了一件強大的超自然寶物，這件寶物在你的家族中已經傳承數代，但有個問題：它壞了。或許是你的某位祖先在拯救世界時將它擊碎，又或者只是不小心絆倒而摔壞它。無論如何，修好它是你的責任。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-shipwrecked', field: 'name', canonicalEnglish: 'Shipwrecked', zhTW: '海難餘生', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-shipwrecked', field: 'description', canonicalEnglish: 'You are the sole survivor of a shipwreck that left you stranded on a remote and inhospitable island for years. Your struggle to survive there granted you insight into the natural world but distanced you from who you once were.', zhTW: '你是一場船難中的唯一倖存者，那場災難讓你受困在偏遠又不宜居住的島嶼許多年。為了活下去，你逐漸深入了解自然世界，卻也漸漸遠離曾經的自己。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-siblingsShield', field: 'name', canonicalEnglish: 'Sibling\'s Shield', zhTW: '手足之盾', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-siblingsShield', field: 'description', canonicalEnglish: 'You were tasked with delivering a ceremonial shield to your older sibling, a celebrated warrior, for their years of service. When you arrived at their homestead, you found them dead on their doorstep with their own sword lodged in their back. To find out who did this to them — and why — you decided to step into their shoes. It will take a while to match up to your sibling’s legacy, though.', zhTW: '你奉命將一面榮譽之盾送給你那位聲名顯赫、服役多年的哥哥或姊姊。然而，當你抵達他家時，卻發現他陳屍在門口，背後插著自己的佩劍。為了查明兇手與幕後真相，你決定繼承他的身分，踏上復仇之路。不過，要追上你手足的傳奇事蹟，恐怕還需要一段時間。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-silentSentinel', field: 'name', canonicalEnglish: 'Silent Sentinel', zhTW: '無聲哨兵', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-silentSentinel', field: 'description', canonicalEnglish: 'You were trained by a group of spies, who psionically infused silence into your every step and enhanced your ability to hear distant whispers. But your enhanced hearing has some nasty side effects.', zhTW: '你曾經受過間諜組織的訓練，他們透過靈能將寂靜灌注到你的每個步伐中，並強化你聆聽遙遠低語的能力。然而，這份異常敏銳的聽力也伴隨著一些糟糕的副作用。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-slightCaseOfLycanthropy', field: 'name', canonicalEnglish: 'Slight Case of Lycanthropy', zhTW: '輕微獸化症', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-slightCaseOfLycanthropy', field: 'description', canonicalEnglish: `
Maybe you were bitten as a child, or maybe it’s a family curse. Either way, you have a malady that is best not discussed in public, lest the torches and pitchforks make an appearance.

Note: Stormwight furies can’t take this complication.`, zhTW: `也許你小時候曾被咬傷，又或者這是家族的詛咒。無論如何，你罹患了一種最好別在公共場合提起的病症，免得眾人拿出火把和草叉。

注意：颶魂熾怒者不能選擇這項糾葛。`, approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-stolenFace', field: 'name', canonicalEnglish: 'Stolen Face', zhTW: '遭竊之顏', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-stolenFace', field: 'description', canonicalEnglish: 'An evil fairy cursed you, leaving you with a blank visage instead of a face. Although you’re able to imitate other peoples’ features, you’d like to have your own back.', zhTW: '一名邪惡妖精詛咒了你，奪走你的臉，只留下一片空白。雖然你能模仿其他人的五官，但你真正想要的，還是拿回自己的臉。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-strangeInheritance', field: 'name', canonicalEnglish: 'Strange Inheritance', zhTW: '古怪遺產', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-strangeInheritance', field: 'description', canonicalEnglish: 'Your siblings each inherited money or land, but you received a strange, seemingly useless trinket — along with the advice that maybe you weren’t cut out for an ordinary, peaceful life.', zhTW: '你的兄弟姊妹各自繼承了金錢或土地，但你只分到一件看似毫無用處的古怪小玩意，外加一句忠告：普通又安穩的人生也許根本不適合你。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-strippedOfRank', field: 'name', canonicalEnglish: 'Stripped of Rank', zhTW: '褫奪軍銜', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-strippedOfRank', field: 'description', canonicalEnglish: 'You were trained as an officer, but you no longer serve. Whether you fled from a battle, were dishonorably discharged, or defected from an evil army, you make your own way in the world now — though your military training will never truly leave you.', zhTW: '你曾經受過軍官訓練，但如今已經退役。也許你臨陣脫逃、被開除軍籍，或是從邪惡軍隊叛逃。如今你靠自己在世上闖蕩，而你永遠記得曾經受過的軍事訓練。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-thrillSeeker', field: 'name', canonicalEnglish: 'Thrill Seeker', zhTW: '追求刺激', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-thrillSeeker', field: 'description', canonicalEnglish: 'You live for danger. Whether in battle or mundane peril, you can transcend your usual limits—and once you’ve tasted that excitement, you want more.', zhTW: '你是為了危險而活。無論是在戰鬥中，還是面對日常生活的險境，你總能突破極限，而一旦嚐過那種刺激，你就只會想要更多。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-vampireSire', field: 'name', canonicalEnglish: 'Vampire Sire', zhTW: '吸血鬼後裔', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-vampireSire', field: 'description', canonicalEnglish: 'A vampire has bitten you. You’re not undead - or not yet, anyway - but your connection with your vampire progenitor fills you with urges you fight to control.', zhTW: '一隻吸血鬼咬了你。你並非亡靈（至少目前還不是），但你與這位吸血鬼始祖之間的連結，讓你的內心充滿難以抑制的渴望。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-vowOfDuty', field: 'name', canonicalEnglish: 'Vow of Duty', zhTW: '職責誓約', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-vowOfDuty', field: 'description', canonicalEnglish: 'You have sworn an oath to an organization. The organization is your rock, and as long as your faith in it remains unshaken, you are immovable.', zhTW: '你曾向某個組織立下誓言。這個組織是你的堅實後盾，只要你對組織的信念毫不動搖，你便堅不可摧。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-vowOfHonesty', field: 'name', canonicalEnglish: 'Vow of Honesty', zhTW: '誠實誓約', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-vowOfHonesty', field: 'description', canonicalEnglish: 'You were brought up to a strict standard of behavior. You cannot tell a lie.', zhTW: '你從小就被要求遵守嚴格的行為準則。你無法說謊。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-waking-dreams', field: 'name', canonicalEnglish: 'Waking Dreams', zhTW: '清醒夢境', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-waking-dreams', field: 'description', canonicalEnglish: 'You broke a magic amulet that immersed your mind in weird magic. This magic has given you the power of premonition. However, you struggle to control this new gift.  Whenever you take a respite, make a Reason test.', zhTW: '你曾經弄壞一枚魔法護符，導致自己的心智浸染在詭異的魔法之中。這股魔法賦予你預見未來的能力，但你很難控制這項新的天賦。每當你進行休整時，進行理智考驗。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-warDogCollar', field: 'name', canonicalEnglish: 'War Dog Collar', zhTW: '戰犬項圈', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-warDogCollar', field: 'description', canonicalEnglish: 'You wear a loyalty collar from one Ajax’s War Dogs. You’ve managed to rig the collar so it explodes outward while keeping you safe.', zhTW: '你戴著一個來自艾傑克斯麾下戰犬的忠誠項圈。你成功改造了項圈，讓它只會向外爆炸，而不會傷到自己。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-war-of-assassins', field: 'name', canonicalEnglish: 'War Of Assassins', zhTW: '刺客之戰', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-war-of-assassins', field: 'description', canonicalEnglish: 'Being in the wrong place at the wrong time saw you caught in the middle of a conflict between two warring assassins’ guilds. Whether by choice or by accident, you wound up helping one faction at the expense of the other.', zhTW: '因為在錯誤的時間出現在錯誤的地方，你被捲入兩個互相爭戰的刺客公會之間。無論是自願還是意外，你最後幫助了其中一方，代價則是得罪另一方。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-ward', field: 'name', canonicalEnglish: 'Ward', zhTW: '王室監護人', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-ward', field: 'description', canonicalEnglish: 'Your childhood sweetheart was royalty, and the two of you stayed close throughout the years. When your former sweetheart died, you swore an oath to dedicate your life to become a tutor for their child, advising them in the ways of being a benevolent monarch.', zhTW: '你的青梅竹馬出身王室，而你們多年來一直保持親近的關係。當昔日的摯友去世後，你立誓奉獻自己的人生，成為他孩子的導師，教導對方如何成為仁慈的君主。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-waterborn', field: 'name', canonicalEnglish: 'Waterborn', zhTW: '海洋之子', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-waterborn', field: 'description', canonicalEnglish: 'You nearly lost your life at sea, but then you heard the voice. Someone - or something - in the water called out to you, telling you to swim. The ocean was suddenly no longer your doom but your parent, granting you a fragment of its power. But for what purpose, you can’t be sure', zhTW: '你曾經差點葬身大海，但就在那時，你聽見了一個聲音。水中的某個人（或某個東西）呼喚著你，要你踢水游泳。剎那間，海洋不再是你的墳墓，而是孕育你的地方。你因此獲得大海的一部分力量，儘管你完全不懂箇中道理。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-wodewalker', field: 'name', canonicalEnglish: 'Wodewalker', zhTW: '幻林行者', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-wodewalker', field: 'description', canonicalEnglish: 'You were dying in the wode, collapsing while starving and wounded. When you woke, you discovered that a group of green elementalists had saved your life by infusing the regenerative bark of a tree to your body.', zhTW: '你曾經在幻林中瀕臨死亡，飢餓與傷勢讓你倒地不起。醒來後，你才發現一群翠息元素師救了你，他們將樹木的再生樹皮融入你的身體。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-wrathfulSpirit', field: 'name', canonicalEnglish: 'Wrathful Spirit', zhTW: '憤怒之靈', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-wrathfulSpirit', field: 'description', canonicalEnglish: 'You’re quick to anger, never letting an insult go without slinging one right back. In combat, you fight as if possessed by a literal spirit of wrath. No matter the tactical circumstances, when someone injures you, you feel compelled to answer blood with blood.', zhTW: '你脾氣火爆，受到侮辱絕不忍氣吞聲，總會立刻回嘴。戰鬥時，你就像被憤怒之靈附身一樣，無論戰局如何，只要有人傷了你，你一定要他血債血償。', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-wronglyImprisoned', field: 'name', canonicalEnglish: 'Wrongly Imprisoned', zhTW: '含冤入獄', approval: 'approved' },
	{ kind: 'element-field', elementID: 'comp-wronglyImprisoned', field: 'description', canonicalEnglish: 'You spent many years imprisoned for a crime you didn’t commit. During your long hours of solitary confinement, you honed your skills and you recited the names of those who framed you. Someday you will have your revenge.', zhTW: '你曾經因為一項自己根本沒犯過的罪而坐了多年冤獄。在漫長的監禁中，你不斷磨練自己的本領，一遍又一遍念著那些陷害者的名字。總有一天，你會向他們復仇。', approval: 'approved' },
	// The shared search box. Only the placeholder is read; the term the player types, the
	// state it is held in and everything filtered by it stay exactly as they are.
	{ kind: 'ui', key: 'search-box.placeholder', canonicalEnglish: 'Search', zhTW: '搜尋', approval: 'approved' },
	// The shared selection box's two controls. Its 'Remove' reads as the hero edit sections'
	// 'Remove' does, so it resolves through that entry rather than a second one.
	{ kind: 'ui', key: 'selection-box.show-details', canonicalEnglish: 'Show details', zhTW: '查看詳細資訊', approval: 'approved' },
	// Every hero choice configuration says this the same way when nothing is left to pick.
	{ kind: 'ui', key: 'feature-config.no-options', canonicalEnglish: 'There are no options to choose for this feature.', zhTW: '此特性沒有需要選擇的項目。', approval: 'approved' },
	// Choosing features. The count is a structured value the panel calculates; it is
	// interpolated, never read, and the selected features keep their canonical identity.
	{ kind: 'message', key: 'config-choice.choose-count', canonicalEnglish: 'Choose {count} option(s).', zhTW: '選擇 {count} 個項目。', placeholders: [ 'count' ], approval: 'approved' },
	{ kind: 'message', key: 'config-choice.points-left', canonicalEnglish: 'You have {pointsLeft} point(s) to spend.', zhTW: '你還有 {pointsLeft} 點可以花費。', placeholders: [ 'pointsLeft' ], approval: 'approved' },
	{ kind: 'ui', key: 'config-choice.choose-option', canonicalEnglish: 'Choose an option', zhTW: '選擇 1 個項目', approval: 'approved' },
	{ kind: 'ui', key: 'config-choice.choose-option-extended', canonicalEnglish: 'Choose an option (extended)', zhTW: '選擇 1 個項目（擴充）', approval: 'approved' },
	{ kind: 'ui', key: 'config-choice.any-ancestry', canonicalEnglish: 'Choose a feature from any ancestry', zhTW: '從任意族裔選擇 1 個特性', approval: 'approved' },
	{ kind: 'ui', key: 'config-choice.against-rules', canonicalEnglish: 'This is typically against the rules.', zhTW: '這通常不符合規則。', approval: 'approved' },
	// Choosing a class ability. The canonical line is composed from the ability's cost and
	// the number wanted, so each mechanical variant the call site can produce is its own
	// entry. 'signature' and the numeric cost stay the values every rule and save still read;
	// only the sentence around them is localized, with the approved 費 reading of pt.
	{ kind: 'ui', key: 'config-class-ability.choose-ability', canonicalEnglish: 'Choose an ability', zhTW: '選擇 1 個招式', approval: 'approved' },
	{ kind: 'ui', key: 'config-class-ability.choose-signature-one', canonicalEnglish: 'Choose a signature ability.', zhTW: '選擇 1 個招牌招式。', approval: 'approved' },
	{ kind: 'message', key: 'config-class-ability.choose-signature-many', canonicalEnglish: 'Choose {count} signature abilities.', zhTW: '選擇 {count} 個招牌招式。', placeholders: [ 'count' ], approval: 'approved' },
	{ kind: 'message', key: 'config-class-ability.choose-cost-one', canonicalEnglish: 'Choose a {cost}pt ability.', zhTW: '選擇 1 個 {cost} 費招式。', placeholders: [ 'cost' ], approval: 'approved' },
	{ kind: 'message', key: 'config-class-ability.choose-cost-many', canonicalEnglish: 'Choose {count} {cost}pt abilities.', zhTW: '選擇 {count} 個 {cost} 費招式。', placeholders: [ 'count', 'cost' ], approval: 'approved' },
	// Choosing perks. The counted line names what is being chosen in zh-TW, which the bare
	// English count leaves to the heading above it.
	{ kind: 'ui', key: 'config-perk.choose-perk', canonicalEnglish: 'Choose a perk', zhTW: '選擇 1 個專長', approval: 'approved' },
	{ kind: 'message', key: 'config-perk.choose-count', canonicalEnglish: 'Choose {count}:', zhTW: '選擇 {count} 個專長：', placeholders: [ 'count' ], approval: 'approved' },
	// Choosing skills. The skill names themselves stay canonical: they are what the hero
	// stores, and what every list and calculation matches on.
	{ kind: 'ui', key: 'config-skill-choice.choose-skill', canonicalEnglish: 'Choose a Skill', zhTW: '選擇 1 個技能', approval: 'approved' },
	{ kind: 'ui', key: 'config-skill-choice.duplicated', canonicalEnglish: 'Duplicated', zhTW: '已重複', approval: 'approved' },
	{ kind: 'ui', key: 'config-skill-choice.duplicated-message', canonicalEnglish: 'You already have this skill.', zhTW: '你已經擁有此技能。', approval: 'approved' },
	// Choosing languages; the language names stay canonical for the same reason.
	{ kind: 'ui', key: 'config-language-choice.choose-language', canonicalEnglish: 'Choose a language', zhTW: '選擇 1 種語言', approval: 'approved' },
	// The hero list's management shell. 英雄 names the page, the header and the tab a hero
	// with no folder sits under; a folder the player named is their own text and is shown
	// exactly as they typed it, even when they happen to have typed 英雄.
	{ kind: 'ui', key: 'hero-list.heroes', canonicalEnglish: 'Heroes', zhTW: '英雄', approval: 'approved' },
	{ kind: 'ui', key: 'hero-list.add', canonicalEnglish: 'Add', zhTW: '新增', approval: 'approved' },
	{ kind: 'ui', key: 'hero-list.create-hero', canonicalEnglish: 'Create a New Hero', zhTW: '創建新英雄', approval: 'approved' },
	{ kind: 'ui', key: 'hero-list.import-hero', canonicalEnglish: 'Import a Hero File', zhTW: '匯入英雄檔案', approval: 'approved' },
	{ kind: 'ui', key: 'hero-list.random-hero', canonicalEnglish: 'Generate a Random Hero', zhTW: '隨機生成英雄', approval: 'approved' },
	{ kind: 'ui', key: 'hero-list.premade-example', canonicalEnglish: 'Use a premade example', zhTW: '使用預建範例', approval: 'approved' },
	{ kind: 'ui', key: 'hero-list.party', canonicalEnglish: 'Party', zhTW: '隊伍', approval: 'approved' },
	// How many heroes in a folder are shown. Both numbers are counted from the heroes
	// themselves and interpolated; the reading only changes the word between them.
	{ kind: 'message', key: 'hero-list.active-count', canonicalEnglish: '{active} of {total}', zhTW: '{active} / {total}', placeholders: [ 'active', 'total' ], approval: 'approved' },
	// The hero overview's labels and fallback. The values beside them - the hero's name,
	// folder, ancestry, background, class and complication - are the hero's own data and stay
	// canonical; Ancestry, Class and Complication resolve through their existing entries.
	{ kind: 'ui', key: 'hero-overview.show-hide', canonicalEnglish: 'Show / Hide', zhTW: '顯示 / 隱藏', approval: 'approved' },
	{ kind: 'ui', key: 'hero-overview.unnamed', canonicalEnglish: 'Unnamed Hero', zhTW: '未命名英雄', approval: 'approved' },
	{ kind: 'ui', key: 'hero-overview.background', canonicalEnglish: 'Background', zhTW: '背景', approval: 'approved' },
	// The hero view's management shell. The hero handed to each action, the section and folder
	// each navigation targets, and the export resolutions all stay exactly as they were.
	{ kind: 'ui', key: 'hero-view.hero', canonicalEnglish: 'Hero', zhTW: '英雄', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.not-found', canonicalEnglish: 'This hero could not be found. It may have been deleted, or the link points to a hero that only exists on another device.', zhTW: '找不到英雄。這名英雄可能已被刪除，或此連結指向僅存於其他裝置上的英雄。', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.edit', canonicalEnglish: 'Edit', zhTW: '編輯', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.copy', canonicalEnglish: 'Copy', zhTW: '複製', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.export', canonicalEnglish: 'Export', zhTW: '匯出', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.delete', canonicalEnglish: 'Delete', zhTW: '刪除', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.close', canonicalEnglish: 'Close', zhTW: '關閉', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.pdf-hint', canonicalEnglish: 'If you want to export your hero as a PDF, switch to Classic view.', zhTW: '若要將英雄匯出為 PDF，請切換至經典檢視。', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.classic', canonicalEnglish: 'Classic', zhTW: '經典', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.export-pdf', canonicalEnglish: 'Export as PDF', zhTW: '匯出為 PDF', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.export-pdf-high', canonicalEnglish: 'Export as PDF (high res)', zhTW: '匯出為 PDF（高解析度）', approval: 'approved' },
	{ kind: 'ui', key: 'hero-view.export-data', canonicalEnglish: 'Export as Data', zhTW: '匯出資料', approval: 'approved' },
	// The view selector's mode tooltips. 'modern', 'classic', 'abilities' and 'notes' remain
	// the values the selector reports and the page switches on. 'Print' has no approved
	// reading in this batch and so has no entry: it resolves to its canonical English.
	// 筆記 is this tab's approved reading; the feature panel's own Notes section keeps 備註.
	{ kind: 'ui', key: 'view-selector.modern', canonicalEnglish: 'Interactive View (for on-screen use)', zhTW: '互動檢視（螢幕用）', approval: 'approved' },
	{ kind: 'ui', key: 'view-selector.classic', canonicalEnglish: 'Classic View (for exporting)', zhTW: '經典檢視（匯出用）', approval: 'approved' },
	{ kind: 'ui', key: 'view-selector.abilities', canonicalEnglish: 'Standard Abilities', zhTW: '標準招式', approval: 'approved' },
	{ kind: 'ui', key: 'view-selector.notes', canonicalEnglish: 'Notes', zhTW: '筆記', approval: 'approved' },
	// Culture Aspect name: the Environment, Organization and Upbringing skill-choice Features
	// a Bespoke Culture is built from, addressed by their own Feature ID. Their
	// listOptions/options skill lists stay canonical English; skill names are out of scope.
	//
	// description is deliberately NOT included here. createSkillChoice() in
	// factory-feature-logic.ts has a pre-existing operator-precedence bug ('data.description
	// || count > 1 ? A : B' instead of 'data.description || (count > 1 ? A : B)') that
	// discards the descriptive text passed in and always stores an auto-generated
	// 'Choose N from <skill list>.' sentence as the actual runtime canonicalEnglish. The
	// Owner-approved zh-TW description text was written against the discarded descriptive
	// text, not that generated sentence, so it cannot be attached to these identities without
	// misrepresenting what was approved. See the Stage 1 report for detail; this needs an
	// Owner/Reviewer decision before the description half of this batch can proceed.
	{ kind: 'element-field', elementID: 'env-nomadic', field: 'name', canonicalEnglish: 'Nomadic', zhTW: '遊牧', approval: 'approved' },
	{ kind: 'element-field', elementID: 'env-rural', field: 'name', canonicalEnglish: 'Rural', zhTW: '鄉村', approval: 'approved' },
	{ kind: 'element-field', elementID: 'env-secluded', field: 'name', canonicalEnglish: 'Secluded', zhTW: '隱居', approval: 'approved' },
	{ kind: 'element-field', elementID: 'env-urban', field: 'name', canonicalEnglish: 'Urban', zhTW: '城市', approval: 'approved' },
	{ kind: 'element-field', elementID: 'env-wilderness', field: 'name', canonicalEnglish: 'Wilderness', zhTW: '荒野', approval: 'approved' },
	{ kind: 'element-field', elementID: 'org-bureaucratic', field: 'name', canonicalEnglish: 'Bureaucratic', zhTW: '官僚', approval: 'approved' },
	{ kind: 'element-field', elementID: 'org-communal', field: 'name', canonicalEnglish: 'Communal', zhTW: '平權', approval: 'approved' },
	{ kind: 'element-field', elementID: 'up-academic', field: 'name', canonicalEnglish: 'Academic', zhTW: '學術', approval: 'approved' },
	{ kind: 'element-field', elementID: 'up-creative', field: 'name', canonicalEnglish: 'Creative', zhTW: '創作', approval: 'approved' },
	{ kind: 'element-field', elementID: 'up-lawless', field: 'name', canonicalEnglish: 'Lawless', zhTW: '法外', approval: 'approved' },
	{ kind: 'element-field', elementID: 'up-labor', field: 'name', canonicalEnglish: 'Labor', zhTW: '勞動', approval: 'approved' },
	{ kind: 'element-field', elementID: 'up-martial', field: 'name', canonicalEnglish: 'Martial', zhTW: '尚武', approval: 'approved' },
	{ kind: 'element-field', elementID: 'up-noble', field: 'name', canonicalEnglish: 'Noble', zhTW: '貴族', approval: 'approved' }
];
