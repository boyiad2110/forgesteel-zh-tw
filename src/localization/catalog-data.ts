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
	{ kind: 'message', key: 'hero-edit.class.choose-subclasses', canonicalEnglish: 'Choose {count} {subclassName}s.', zhTW: '選擇 {count} 個 {subclassName}。', placeholders: [ 'count', 'subclassName' ], approval: 'approved' }
];
