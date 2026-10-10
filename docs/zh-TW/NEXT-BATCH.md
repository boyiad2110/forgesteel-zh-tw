# UI-05 / DISPLAY-05：建角詳情與語言 / 技能選擇盤點

2026-10-11；基底 develop `4da55d95`；工作分支 `codex/ui-05-details-inventory`。Marc 已核准 16 筆新 UI；Master Sheet、同次快照、匯出及 mapping 已更新。人工驗收先發現官方技能生成提示的嚴格描述比對造成英文備援，以及技能選擇抽屜尚未呈現已核准的用途描述；同一 PR #61 已修正並重用既有核准規則表，不新增譯文。後續驗收再發現無來源參照的標準通用技能選項未套用核准句型，已補精確守門與瀏覽器回歸案例，並確認顯示「從任意技能類別中選擇 1 項技能。」。本機完整瀏覽器回歸與最新 [CI](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/38073402572) 通過，等待 Marc 驗收；尚未合併。PR #60 的過時記載隨本批校正，不另開結案文件 PR。

## 本批建議範圍與來源

合併建角「詳情」頁的語言 / 技能設定、相連選擇抽屜與擴充項目空值 UI。16 筆新增譯文已由 Marc 核准並寫入 Master Sheet 的 Forge Steel UI；公開文件只記核准來源與程式範圍。

- 開始時已讀 Master Sheet Project State、README、Style Guide、Glossary、TM、Names、Decisions、Status 與近期 Changelog；Status 第 32 列 / Project State / CHG-0086 均確認 PR #60 已合併 `4da55d95`，最新 CI `38064075869` 全綠。核准後新增 UI ID 已確認無重複，寫入 UI 第 176–191 列、Status 第 33 列、CHG-0087，並回讀確認寫入內容。
- 以獨立無頭 Edge 執行四個內建官方來源書（core / orden / beastheart / summoner）、CultureData.bespoke 與 FactoryLogic.createHero 的資料。遞迴遍歷候選特性，再依 DetailsSection 的原參數呼叫 createLanguageChoice / createSkillChoice；不讀使用者 profile，不截圖、不錄影。
- 去重取得 228 個語言 / 技能候選 ID：54 個 LanguageChoice、174 個 SkillChoice，共 35 種重建後描述。包含巢狀選項、未選子職業、領域、專長、稱號及英雄預設；不是單一英雄全部可用的設定，更不是 228 段 DOM 驗收。16 筆 UI 已核准；技能句型透過既有名稱對照填入核准技能 / 類別名稱及上游 count，來源以半形 ` / ` 串接。
- `details-section.tsx` 重建語言與技能設定時保留原特性身份；新的 `official-feature-source.ts` 比對已載入官方來源書中的原始特性資料，略過可變的 selected 值。只有官方來源原文 / 參數一致且所有技能名稱與類別都有核准目標時才呈現中文。預設語言另以固定 ID 與 Common-only 參數辨識；同名 Homebrew、自訂、改寫、未知來源仍使用英文。
- `FeatureConfigPanel`、LanguageSelectModal、SkillSelectModal 與 HeroExtensionsPanel 已接入核准 UI；未改 FactoryLogic、HeroLogic、選取邏輯或存檔。已匯出 UI 共 190 筆，mapping 清冊更新至 618 / 106 / 11。
- 沿用台灣正體中文、Former Life 的既有核准名稱、Project / State 的既有核准 UI；新等級模板使用 `{level} 級`，新組合來源的斜線使用半形 ` / `。不改寫既有 APPROVED 資產。

## 已核准 UI 與既有重用

| 分組 | 新英文來源 | 新 UI 筆數 |
| --- | --- | --- |
| 語言設定標題 / 描述 | Default Language；Languages；Choose a Common language.；`Choose 2  languages.`（雙空格） | 4 |
| 技能生成句型 / 片段 | `Choose a skill from ${source}.`；`Choose ${count} from ${source}.`；`${list} skills`；any list | 4 |
| 語言選擇分類 | Common；Cultural；Regional；Dead | 4 |
| 技能自訂分類 | Custom（固定 UI 分類 / tag，非使用者名稱） | 1 |
| 擴充項目空值 | Unnamed Extension；Unknown；Unnamed Sourcebook | 3 |

合計 16 筆新 UI，已由 Marc 核准並寫入 Master Sheet。另重用 6 筆 APPROVED：Name、Skill、Language、Select、`Choose a  language.`、`Choose a skill from Interpersonal skills.`；五類技能及具體技能名稱重用既有核准 Glossary 對照。TM 沒有完整句子的 Exact Match；書本語言段落只供用詞核對，不能自動核准新 UI。

- Name 的標題 / placeholder 重用既有核准對照；兩個自訂 Select 按鈕已接入核准 UI。
- 語言選擇抽屜的 Common / Cultural / Regional / Dead 分類與技能抽屜的 Custom 類別 / tag 已接入核准 UI。
- HeroExtensionsPanel 的 3 個空值是固定 UI；有值的自製擴充名稱、來源書名稱及內容保留原值。
- 技能模板只使用核准來源片段，保留上游 count、來源順序與可選範圍；實測候選 count 為 1 / 2 / 3 / 5。未知片段、未觀察到的語言限制、count=-1 或非法模板保留完整英文，不輸出半中半英。
- 身份保護須核對官方來源、原 ID、原名稱、原描述與影響生成句型的參數；同名自訂、Homebrew、未知 ID、改名及改寫不因重建成 Skill 而誤用官方描述。
- 本批接入技能選擇抽屜與已選技能的官方用途描述，直接重用相應技能類別規則表中核准的用途文字；變更或自訂技能仍顯示原文。本批不含語言資料描述、內容型特性標題（例如 Gift of Charm / Polyglot）、生涯 / 職業 / 糾葛書本內容、擴充內容或管理編輯器。這些缺口仍未完成，Career 411 NEW、Enhancement 待定。

## 35 種生成描述候選

同一 ID 在多處出現只計一次；下列數量總和為 228。描述來源是 FactoryFeatureLogic，不是 getFeatureTypeDescription。16 筆 UI、SHA-256 與示例已核准；執行時仍須精確核對來源語境與參數，未知來源不使用模板。

| 重建後完整英文 | 候選 ID 數 | 範例 ID |
| --- | --- | --- |
| `Choose 2  languages.` | 8 | `career-agent-feature-4` |
| `Choose 2 from Alertness, Architecture, Blacksmithing, Brag, Culture, Empathize, Fletching, Mechanics, Monsters, Search, Strategy, Exploration skills.` | 1 | `tactician-1-2` |
| `Choose 2 from Crafting skills, Exploration skills, Intrigue skills, Lore skills.` | 1 | `comp-wronglyImprisoned-b` |
| `Choose 2 from Crafting skills, Exploration skills.` | 1 | `laborer-feature-2` |
| `Choose 2 from Crafting skills.` | 1 | `career-artisan-feature-1` |
| `Choose 2 from Exploration skills, Intrigue skills.` | 2 | `fury-1-2` |
| `Choose 2 from Exploration skills.` | 5 | `career-explorer-feature-2` |
| `Choose 2 from Interpersonal skills, Lore skills.` | 4 | `censor-1-1` |
| `Choose 2 from Interpersonal skills.` | 3 | `performer-feature-2` |
| `Choose 2 from Intrigue skills, Lore skills.` | 1 | `summoner-1-1c` |
| `Choose 2 from Intrigue skills.` | 2 | `career-criminal-feature-2` |
| `Choose 2 from Lore skills.` | 3 | `career-disciple-feature-2` |
| `Choose 2 from any list.` | 5 | `shadow-1-1` |
| `Choose 3 from Crafting skills, Lore skills.` | 1 | `elementalist-1-2` |
| `Choose 3 from any list.` | 1 | `comp-ivoryTower-skills` |
| `Choose 5 from Criminal Underworld, Exploration skills, Interpersonal skills, Intrigue skills.` | 1 | `shadow-1-3` |
| `Choose a  language.` | 45 | `culture-devil-language` |
| `Choose a Common language.` | 1 | `default-language` |
| `Choose a skill from Alertness, Criminal Underworld, Eavesdrop, Interrogate, Rumors, Search, Track, Society.` | 1 | `comp-hunter-b1` |
| `Choose a skill from Blacksmithing, Fletching, Climb, Endurance, Ride, Intimidate, Alertness, Track, Monsters, Strategy.` | 1 | `up-martial` |
| `Choose a skill from Blacksmithing, Handle Animals, Exploration skills.` | 1 | `up-labor` |
| `Choose a skill from Crafting skills, Exploration skills.` | 2 | `env-wilderness` |
| `Choose a skill from Crafting skills, Lore skills.` | 1 | `env-rural` |
| `Choose a skill from Crafting skills.` | 4 | `null-sub-2-1-1` |
| `Choose a skill from Exploration skills, Interpersonal skills.` | 1 | `env-nomadic` |
| `Choose a skill from Exploration skills.` | 9 | `career-beggar-feature-2` |
| `Choose a skill from Interpersonal skills, Intrigue skills.` | 3 | `env-urban` |
| `Choose a skill from Interpersonal skills, Lore skills.` | 1 | `env-secluded` |
| `Choose a skill from Interpersonal skills.` | 8 | `devil-feature-1b` |
| `Choose a skill from Intrigue skills, Lore skills.` | 1 | `troubadour-5` |
| `Choose a skill from Intrigue skills.` | 10 | `career-agent-feature-3` |
| `Choose a skill from Lore skills.` | 13 | `up-academic` |
| `Choose a skill from Music, Perform, Crafting skills.` | 1 | `up-creative` |
| `Choose a skill from Music, Perform.` | 1 | `performer-feature-1` |
| `Choose a skill from any list.` | 84 | `career-agent-feature-1` |

## 其他頁面與剩餘 54 種預設描述路由

以下為上述四個官方來源書加 Bespoke Culture 的遞迴候選庫；同頁依 ID 去重，跨頁可重複，族裔來源包含附屬文化，職業包含子職業與巢狀選項。空描述才可能進入 FeatureConfigPanel 的 getFeatureTypeDescription 備援；這不是頁面目前已選狀態或 DOM 覆蓋證據。

| 候選來源 | 可設定 ID | 空描述 ID | 空描述類型 / 下一批 |
| --- | --- | --- | --- |
| 族裔（含附屬文化） | 41 | 15 | Choice 13 / AncestryFeatureChoice 2；後者先確認已核准內容鍵與實際接點 |
| 文化（含 Bespoke） | 30 | 0 | 語言與面向透過原內容或工廠生成提示；UI-05 只補詳情投射 |
| 生涯 | 69 | 18 | Perk；共用 UI 可另核准，411 NEW 內容仍等待 BOOK-01 |
| 職業（含子職業） | 354 | 234 | Domain / Kit / ClassAbility / Perk / Choice / SummonChoice；同職業選擇頁合批 |
| 糾葛 | 32 | 5 | ItemChoice 2 / Choice 1 / Retainer 1 / Toggle 1；與糾葛設定 UI 合批 |

55 種預設描述中 Choice 已有核准譯文，但目前只接 12 個 Purchased Traits ID；其他 Choice 位置仍有覆蓋缺口。其餘 54 種中，本次候選庫的空描述涉及 9 類：AncestryFeatureChoice、Perk、Domain、Kit、ClassAbility、SummonChoice、ItemChoice、Retainer、Toggle；剩餘 45 類未在這五個來源群的可設定候選中遇到空描述，仍須到其他旅程 / 元件盤點，不能標為不適用或完成。完整 55 類英文保留在原批附錄。UI-05 即使完成，也不減少這 54 種預設描述待辦。

## 核准後的執行 / 驗收

1. **完成**：Marc 核准 16 筆 UI、兩個技能句型及來源組合格式；單一寫入者更新 Master Sheet、批次狀態與 CHG-0087。
2. **完成**：同次四頁核准快照 → 匯出 / mapping / UI 守門 → 顯示層接線；不改原資料、計算、可選範圍、搜尋 / 排序或分享碼。
3. **原始版本完整驗證完成；修正版驗證中**：原始版本隔離副本乾淨安裝及 audit 0 漏洞；lint 0 errors、TypeScript 通過、987/987 測試、production build 成功，7 組隔離瀏覽器旅程通過。修正版本機語系守門、型別及相關 10 項測試通過；全套 Vitest 有 866 項通過、2 個 suite 因 sass-embedded 權限失敗，build 與 Edge 瀏覽器回歸亦受本機權限限制。最新修正版需以 PR CI 驗證。
4. **進行中**：[PR #61](https://github.com/boyiad2110/forgesteel-zh-tw/pull/61) 原始 head 的 CI 全綠；Marc 人工驗收發現技能提示漏接，已在本地修正並新增生成描述與核准用途文字回歸，需更新 PR、確認最新 CI，再由 Marc 完成人工驗收；不自行合併。

# UI-04 / DISPLAY-04：已合併批次的原始盤點

2026-10-10；原批基底 develop `71be5478bee0fd53200d094605a568d29d64dcb1`；8 筆 UI 與 Wyrmplate 動態模板已由 Marc 核准並寫入 Master Sheet，程式已接入；完整隔離驗證與 6 段瀏覽器回歸通過。Marc 已人工驗收，PR #60 已 squash 合併至 develop `4da55d95b00cddcb9f7a32b546cb9bfd59c432e9`，最新 CI `38064075869` 全綠；Master Sheet Project State / Status 第 32 列 / CHG-0086 已回讀確認。本次僅校正過時狀態，驗證仍引用原程式版本 `e8920d7b`。

## 本批範圍

合併族裔與文化的右側 FeatureConfigPanel、其 Choice 選項操作、13 個 Bespoke Culture 已選 Field，以及龍鱗動態描述。8 筆新增 UI、既有 Language UI 重用與動態模板已核准；本批已更新 Sheet、同次快照、匯出、mapping、來源依賴檢查點及顯示接線。

- 12 個官方族裔與 27 個官方文化＋Bespoke Culture，共 57 個不重複設定 ID。重複文化與共用面向依 ID 去重；不把出現次數當翻譯數量。
- 已有內容鍵：龍鱗、符文銘刻、昔日人生及 13 個文化面向（名稱／描述）。龍鱗核准動態模板已接入；未辨識改寫仍完整英文備援。
- 共用 UI 缺口：12 個 Purchased Traits、28 個文化語言設定、魔鬼交涉技能設定、Choice 的一般／擴充選項按鈕與空清單提示。8 筆新 UI 已核准及接入；Language 標題重用已有 APPROVED UI。
- 55 種預設描述均為程式 UI；本批實際用到的空描述只有 Choice。其他類型逐項列在附錄，不一併宣稱完成。

## FeatureConfigPanel 呼叫位置

| 頁面 | 外層內容 scope | 目前狀態／後續 |
| --- | --- | --- |
| ancestry-section | 有 ElementScope | 本批：12 個官方 Purchased Traits、魔鬼交涉技能及 Wyrmplate 動態描述已接 |
| culture-section | 有 ElementScope | 本批：28 個官方文化語言欄位標題／描述已接；13 個面向內容已接 |
| career-section | 無 | Career 411 NEW；內容等待 BOOK-01；共用 UI 不代表生涯內容核准 |
| class-section | 無 | 職業內容與動態描述另批；共用 UI 仍依精確來源 |
| complication-section | 無 | 糾葛內容另批；不能以名稱相同自行翻譯 |
| details-section（語言 / 技能） | 無 | UI-05 / DISPLAY-05 已接入 Default Language、Languages、Skill 與核准生成提示；「any list」卡片顯示「從任意技能類別中選擇 1 項技能。」；PR #61 最新 CI 全綠，待 Marc 人工驗收 |
| hero-customize-modal（自訂特性） | 使用 ConfigFeature，不是 FeatureConfigPanel | 校正原盤點：自訂特性設定在英雄自訂視窗；詳情頁僅收集其中的語言 / 技能選項。自訂內容保護維持，管理編輯器另批 |

## 已核准並接入的 8 筆 UI

| 英文原文 | APPROVED 正體中文 | 接點／保護範圍 |
| --- | --- | --- |
| `Purchased Traits` | 自購特性 | 12 個官方族裔 ID，名稱吻合時接入 |
| `This feature allows you to choose from a collection of features.` | 此特性能讓你從一組特性中做出選擇。 | 12 個官方 Purchased Traits 的 Choice 預設描述 |
| `Interpersonal Skill` | 交涉類技能 | 魔鬼 `devil-feature-1b`，名稱及描述吻合時接入 |
| `Choose a skill from Interpersonal skills.` | 從交涉類技能中選擇 1 項技能。 | 魔鬼 `devil-feature-1b` 的程式生成描述 |
| `Choose a  language.` | 選擇 1 種語言。 | 28 個官方／Bespoke Culture LanguageChoice；保留來源雙空格雜湊 |
| `Choose an option` | 選擇 1 個項目 | Choice 一般操作按鈕 |
| `Choose an option (extended)` | 選擇 1 個項目（擴充） | Choice 擴充操作按鈕 |
| `There are no options to choose for this feature.` | 此特性沒有可選的選項。 | Choice／AncestryChoice 空清單提示 |

Choice 操作按鈕及空清單提示是共用 UI。內容名稱與預設描述只對精確列出的官方 ID、原始名稱、類型和英文描述套用；改名、自訂、Homebrew、未知 ID 或來源文字改寫都保留原值。文化 Language 名稱重用既有 APPROVED `Language` → `語言`。

FeatureConfigPanel 本身不建立內容 scope。HeaderText 顯示 feature.name；空名稱 Unnamed Feature、計算提示及 SelectionBox 的詳情／移除已接 APPROVED UI。描述依 Ability description → feature.description → getFeatureTypeDescription，再由上游 getTextEffect 計算。ConfigFeature 依類型選元件；本批檢查 Choice / SkillChoice / LanguageChoice / AncestryChoice 的玩家設定路徑，排除 Edit* 管理編輯器。Choice 的 3 個漏接字串與 AncestryChoice 共用的空清單提示現已接入核准 UI。SkillChoice / LanguageChoice 的玩家按鈕與既有提示已接 UI。

## 57 個內容 ID 與 UI 缺口

| 官方 ID | 原標題 | 標題來源／狀態 | 描述來源／狀態 |
| --- | --- | --- | --- |
| devil-feature-1b | Interpersonal Skill | 程式 UI（APPROVED；本批已接） | 程式 UI：Choose a skill from Interpersonal skills.（APPROVED；本批已接） |
| devil-feature-2 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| dragon-knight-feature-1 | Wyrmplate | heroes.ancestries.dragon-knight.signature.wyrmplate.name（已有接線） | heroes.ancestries.dragon-knight.signature.wyrmplate.effect（核准 Calculation Display；只投射上游數值） |
| dragon-knight-feature-2 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| dwarf-feature-1 | Runic Carving | heroes.ancestries.dwarf.signature.runic-carving.name（已有接線） | heroes.ancestries.dwarf.signature.runic-carving.intro（已有接線） |
| dwarf-feature-2 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| wode-elf-feature-2 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| high-elf-feature-2 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| hakaan-feature-2 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| human-feature-2 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| memonek-feature-3 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| orc-feature-2 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| polder-feature-3 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| revenant-feature-1 | Former Life | heroes.ancestries.revenant.signature.former-life.name（已有接線） | heroes.ancestries.revenant.signature.former-life.effect（已有接線） |
| revenant-feature-4 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| time-raider-feature-2 | Purchased Traits | 程式 UI（APPROVED；本批已接） | 預設 UI：This feature allows you to choose from a collection of features.（APPROVED；本批已接） |
| culture-bespoke-culture-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-artisan-guild-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| env-urban | Urban | heroes.background.culture.environment.urban.name（已有接線） | heroes.background.culture.environment.urban.description（已有接線） |
| org-bureaucratic | Bureaucratic | heroes.background.culture.organization.bureaucratic.name（已有接線） | heroes.background.culture.organization.bureaucratic.description（已有接線） |
| up-creative | Creative | heroes.background.culture.upbringing.creative.name（已有接線） | heroes.background.culture.upbringing.creative.description（已有接線） |
| culture-borderland-homestead-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| env-wilderness | Wilderness | heroes.background.culture.environment.wilderness.name（已有接線） | heroes.background.culture.environment.wilderness.description（已有接線） |
| org-communal | Communal | heroes.background.culture.organization.communal.name（已有接線） | heroes.background.culture.organization.communal.description（已有接線） |
| up-labor | Labor | heroes.background.culture.upbringing.labor.name（已有接線） | heroes.background.culture.upbringing.labor.description（已有接線） |
| culture-college-conclave-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| up-academic | Academic | heroes.background.culture.upbringing.academic.name（已有接線） | heroes.background.culture.upbringing.academic.description（已有接線） |
| culture-criminal-gang-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| up-lawless | Lawless | heroes.background.culture.upbringing.lawless.name（已有接線） | heroes.background.culture.upbringing.lawless.description（已有接線） |
| culture-farming-village-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| env-rural | Rural | heroes.background.culture.environment.rural.name（已有接線） | heroes.background.culture.environment.rural.description（已有接線） |
| culture-herding-community-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| env-nomadic | Nomadic | heroes.background.culture.environment.nomadic.name（已有接線） | heroes.background.culture.environment.nomadic.description（已有接線） |
| culture-knightly-order-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| env-secluded | Secluded | heroes.background.culture.environment.secluded.name（已有接線） | heroes.background.culture.environment.secluded.description（已有接線） |
| up-martial | Martial | heroes.background.culture.upbringing.martial.name（已有接線） | heroes.background.culture.upbringing.martial.description（已有接線） |
| culture-mercenary-band-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-merchant-caravan-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-monastic-order-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-noble-house-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| up-noble | Noble | heroes.background.culture.upbringing.noble.name（已有接線） | heroes.background.culture.upbringing.noble.description（已有接線） |
| culture-outlaw-band-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-pauper-neighborhood-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-pirate-crew-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-telepathic-hive-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-traveling-entertainers-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-devil-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-dragon-knight-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-dwarf-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-wode-elf-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-high-elf-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-hakaan-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-human-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-memonek-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-orc-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-polder-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |
| culture-time-raider-language | Language | ui.hero-builder.language.996aaf3b（APPROVED；本批已接） | 程式 UI：Choose a  language.（APPROVED；本批已接） |

## 13 個 Bespoke Culture Field

實作位於 culture-section.tsx 的 environment / organization / upbringing：ElementScope → PlayerName / Markdown。13 個名稱與網站短描述逐一核對線上 Strings、APPROVED、Basis Hash、mapping enHash 及本機匯出；均吻合。

| ID | 核准名稱 | 名稱 Sheet ID | 描述 Sheet ID | 描述核對 |
| --- | --- | --- | --- | --- |
| env-nomadic | 遊牧 | heroes.background.culture.environment.nomadic.name | heroes.background.culture.environment.nomadic.description | APPROVED；已接；DOM 通過 |
| env-rural | 鄉村 | heroes.background.culture.environment.rural.name | heroes.background.culture.environment.rural.description | APPROVED；已接；DOM 通過 |
| env-secluded | 隱居 | heroes.background.culture.environment.secluded.name | heroes.background.culture.environment.secluded.description | APPROVED；已接；DOM 通過 |
| env-urban | 城市 | heroes.background.culture.environment.urban.name | heroes.background.culture.environment.urban.description | APPROVED；已接；DOM 通過 |
| env-wilderness | 荒野 | heroes.background.culture.environment.wilderness.name | heroes.background.culture.environment.wilderness.description | APPROVED；已接；DOM 通過 |
| org-bureaucratic | 官僚 | heroes.background.culture.organization.bureaucratic.name | heroes.background.culture.organization.bureaucratic.description | APPROVED；已接；DOM 通過 |
| org-communal | 平權 | heroes.background.culture.organization.communal.name | heroes.background.culture.organization.communal.description | APPROVED；已接；DOM 通過 |
| up-academic | 學術 | heroes.background.culture.upbringing.academic.name | heroes.background.culture.upbringing.academic.description | APPROVED；已接；DOM 通過 |
| up-creative | 創作 | heroes.background.culture.upbringing.creative.name | heroes.background.culture.upbringing.creative.description | APPROVED；已接；DOM 通過 |
| up-lawless | 法外 | heroes.background.culture.upbringing.lawless.name | heroes.background.culture.upbringing.lawless.description | APPROVED；已接；DOM 通過 |
| up-labor | 勞動 | heroes.background.culture.upbringing.labor.name | heroes.background.culture.upbringing.labor.description | APPROVED；已接；DOM 通過 |
| up-martial | 尚武 | heroes.background.culture.upbringing.martial.name | heroes.background.culture.upbringing.martial.description | APPROVED；已接；DOM 通過 |
| up-noble | 貴族 | heroes.background.culture.upbringing.noble.name | heroes.background.culture.upbringing.noble.description | APPROVED；已接；DOM 通過 |

2026-10-10 本機獨立 Edge context 掛載實際 CultureSection，每個面向逐一檢查正體中文 → 英文 → 正體中文的已選 Field 名稱與短描述（13/13）。改寫描述、未知 ID、改名名稱 3 組保護通過；沒有 page error。改名名稱保留自訂值，未改寫且仍核准的描述依欄位獨立翻譯；不因改名而推論整張卡都不翻譯。測試 fixture 的原始英雄未變，未使用玩家檔案／瀏覽器 profile；不截圖、不錄影。這是實際元件 DOM 核對，沒有重跑 13 次抽屜選取／儲存／分享碼／列印版面或完整六項 verify，也不代替 Marc 人工驗收。PR #59 的原始完整 CI 證據見 PROGRESS。

## 龍鱗動態描述（已核准並接入）

- key：element:dragon-knight-feature-1:description；Sheet ID：heroes.ancestries.dragon-knight.signature.wyrmplate.effect；Strings 第 109 列書本與網站英文一致，Forge Steel 版原樣保留已核准書本中文。Calculation Display Note 已核准為 target「等於你的等級」、template「為 {value}」。
- 上游 Choice 即使沒有閃電按鈕，getDescription 仍在 autoCalc=true 時呼叫 getTextEffect。閃電按鈕目前只給 Text 類型；本批不改遊戲類型或計算流程，也不先增加控制按鈕。
- 實際執行原上游函式，1 級 → immunity equal to 1 / 3 級 → immunity equal to 3 / 10 級 → immunity equal to 10；核准後分別顯示「免疫值為 1 / 3 / 10」。未知改寫繼續保留完整計算後英文。
- `calculation-bindings.json` 只指定 `your level` 對應「等於你的等級」的 UTF-16 span；模板取自同次核准快照，不更動書本／靜態中文及上游計算。

## 接入與驗收條件

1. 8 筆新增 UI 與 1 個龍鱗動態模板已於 2026-10-10 核准並寫入 Master Sheet；Language 沿用既有核准值。
2. 新增 UI 依既有 Forge Steel UI 管線；只有核對過官方 ID／原文／生成語境的預設文字可替換，不做全域原字串替換。改名、自訂、Homebrew、未知值保持原值。
3. 龍鱗以既有 Calculation Display 機制投射上游值；同列 P–V 保存的 Forge Steel 英文／靜態中文與書本核准版一致，動態 Note 已隨四頁同次擷取；未知輸入完整英文備援。
4. 族裔候選／已選／摘要、文化語言選項、Choice 一般／擴充／空清單、龍鱗跨等級／英中切換／未知備援及自訂保護回歸，以及 verify-isolated 均已通過。Marc 已於 2026-10-10 人工驗收通過，PR #60 已 squash 合併至 develop `4da55d95`，最新 CI 全綠；不把 13 個已接 Field 重算成新譯文。

## 預設描述附錄

以下 55 筆來自 FeatureLogic.getFeatureTypeDescription，都是程式 UI；Choice 已在 UI-04 核准並限定接入 12 個官方 Purchased Traits，其他 54 種仍無精確核准來源，依所在頁面後續成批處理。UI-05 的語言 / 技能生成描述來自 FactoryLogic，與這份清單分開計數。

| FeatureType | 英文原文 | 位置 | 範圍 |
| --- | --- | --- | --- |
| Ability | This feature grants you an ability. | src/logic/feature-logic.ts:1329 | 後續／未完成 |
| AbilityCost | This feature modifies the cost to use an ability. | src/logic/feature-logic.ts:1331 | 後續／未完成 |
| AbilityDamage | This feature modifies the damage of an ability. | src/logic/feature-logic.ts:1333 | 後續／未完成 |
| AbilityDistance | This feature modifies the distance of an ability. | src/logic/feature-logic.ts:1335 | 後續／未完成 |
| AbilityKeyword | This feature modifies the keywords of an ability. | src/logic/feature-logic.ts:1337 | 後續／未完成 |
| AddOn | This feature grants you a monster customization. | src/logic/feature-logic.ts:1339 | 後續／未完成 |
| AncestryChoice | This feature sets the hero's former ancestry. | src/logic/feature-logic.ts:1341 | 後續／未完成 |
| AncestryFeatureChoice | This feature allows you to select a feature from an ancestry. | src/logic/feature-logic.ts:1343 | 後續／未完成 |
| Bonus | This feature modifies a statistic. | src/logic/feature-logic.ts:1345 | 後續／未完成 |
| CharacteristicBonus | This feature modifies a characteristic. | src/logic/feature-logic.ts:1347 | 後續／未完成 |
| Choice | This feature allows you to choose from a collection of features. | src/logic/feature-logic.ts:1349 | 本批：只接官方 Purchased Traits 的精確 ID／標題 |
| ClassAbility | This feature allows you to choose an ability from your class. | src/logic/feature-logic.ts:1351 | 後續／未完成 |
| Companion | This feature grants you a companion or mount. | src/logic/feature-logic.ts:1353 | 後續／未完成 |
| Complication | This feature grants you a complication. | src/logic/feature-logic.ts:1355 | 後續／未完成 |
| ConditionImmunity | This feature grants you immunity to one or more condition types. | src/logic/feature-logic.ts:1357 | 後續／未完成 |
| DamageModifier | This feature grants you an immunity or a weakness. | src/logic/feature-logic.ts:1359 | 後續／未完成 |
| Domain | This feature allows you to choose a domain. | src/logic/feature-logic.ts:1361 | 後續／未完成 |
| DomainFeature | This feature allows you to choose a feature from your domain. | src/logic/feature-logic.ts:1363 | 後續／未完成 |
| Fixture | This feature allows you to summon a fixture. | src/logic/feature-logic.ts:1365 | 後續／未完成 |
| Follower | This feature grants you a follower. | src/logic/feature-logic.ts:1367 | 後續／未完成 |
| ForController | This feature applies a feature to a controlled creature's controller. | src/logic/feature-logic.ts:1369 | 後續／未完成 |
| HeroicResource | This feature grants you a heroic (or epic) resource. | src/logic/feature-logic.ts:1371 | 後續／未完成 |
| HeroicResourceGain | This feature grants you a way to gain your heroic resource. | src/logic/feature-logic.ts:1373 | 後續／未完成 |
| HeroicResourceThreshold | This feature grants you another feature once your heroic resource reaches a given value. | src/logic/feature-logic.ts:1375 | 後續／未完成 |
| ItemChoice | This feature allows you to choose an item. | src/logic/feature-logic.ts:1377 | 後續／未完成 |
| Kit | This feature allows you to choose a kit. | src/logic/feature-logic.ts:1379 | 後續／未完成 |
| Language | This feature grants you a language. | src/logic/feature-logic.ts:1381 | 後續／未完成 |
| LanguageChoice | This feature allows you to choose a language. | src/logic/feature-logic.ts:1383 | 後續／未完成 |
| Malice | This feature grants you a malice effect. | src/logic/feature-logic.ts:1385 | 後續／未完成 |
| MaliceAbility | This feature grants you a malice ability. | src/logic/feature-logic.ts:1387 | 後續／未完成 |
| MovementMode | This feature grants you an additional movement mode. | src/logic/feature-logic.ts:1389 | 後續／未完成 |
| Multiple | This feature grants you a collection of features. | src/logic/feature-logic.ts:1391 | 後續／未完成 |
| Package | This feature collates content from other features. | src/logic/feature-logic.ts:1393 | 後續／未完成 |
| PackageContent | This feature provides content for a Package feature. | src/logic/feature-logic.ts:1395 | 後續／未完成 |
| Perk | This feature allows you to choose a perk. | src/logic/feature-logic.ts:1397 | 後續／未完成 |
| PotencyResistance | This feature treats one or more of your characteristic scores as higher when you resist potencies. | src/logic/feature-logic.ts:1399 | 後續／未完成 |
| Proficiency | This feature grants you proficiency with weapons or armor. | src/logic/feature-logic.ts:1401 | 後續／未完成 |
| Retainer | This feature grants you a retainer. | src/logic/feature-logic.ts:1403 | 後續／未完成 |
| SaveThreshold | This feature modifies your threshold for saves. | src/logic/feature-logic.ts:1405 | 後續／未完成 |
| Size | This feature sets your size. | src/logic/feature-logic.ts:1407 | 後續／未完成 |
| SkillCancelChoice | This feature allows you to lose a skill. | src/logic/feature-logic.ts:1409 | 後續／未完成 |
| SkillChoice | This feature allows you to choose a skill. | src/logic/feature-logic.ts:1411 | 後續／未完成 |
| Speed | This feature sets your base speed. | src/logic/feature-logic.ts:1413 | 後續／未完成 |
| Summon | This feature specifies monsters you can summon. | src/logic/feature-logic.ts:1415 | 後續／未完成 |
| SummonChoice | This feature allows you to choose monsters you can summon. | src/logic/feature-logic.ts:1417 | 後續／未完成 |
| SummonFormation | This feature adds information to your summoned creatures. | src/logic/feature-logic.ts:1419 | 後續／未完成 |
| SurgeGain | This feature grants you a way to gain surges. | src/logic/feature-logic.ts:1421 | 後續／未完成 |
| SwitchOptions | This feature grants one out of a set of features based on a switch value. | src/logic/feature-logic.ts:1423 | 後續／未完成 |
| SwitchValue | This feature specifies a switch value for a 'switch options' feature. | src/logic/feature-logic.ts:1425 | 後續／未完成 |
| TaggedFeature | This feature describes a tagged feature. | src/logic/feature-logic.ts:1427 | 後續／未完成 |
| TaggedFeatureChoice | This feature allows you to select a tagged feature. | src/logic/feature-logic.ts:1429 | 後續／未完成 |
| Text | This feature has no special properties, just a text description. | src/logic/feature-logic.ts:1431 | 後續／未完成 |
| RollModifier | This feature gives you an edge or a bane on certain rolls. | src/logic/feature-logic.ts:1433 | 後續／未完成 |
| TitleChoice | This feature allows you to choose a title. | src/logic/feature-logic.ts:1435 | 後續／未完成 |
| Toggle | This feature allows you to turn a feature on or off. | src/logic/feature-logic.ts:1437 | 後續／未完成 |
