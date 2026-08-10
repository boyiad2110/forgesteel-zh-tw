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
