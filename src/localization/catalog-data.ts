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
	{ kind: 'ui', key: 'view-selector.notes', canonicalEnglish: 'Notes', zhTW: '筆記', approval: 'approved' }
];
