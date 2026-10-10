# UI-04 / DISPLAY-04：建角族裔與文化設定盤點

2026-10-10；基底 develop `71be5478bee0fd53200d094605a568d29d64dcb1`；8 筆 UI 與 Wyrmplate 動態模板已由 Marc 核准並寫入 Master Sheet，程式已接入；完整隔離驗證與 6 段瀏覽器回歸通過。Marc 已人工驗收，PR #60 待最新 CI／squash 合併。Master Sheet 線上 Project State / Status / CHG-0085 已確認 PR #59 結案。

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
| details-section（語言） | 無 | Default Language 及語言模板另列後續；已有 UI 外層標籤 |
| details-section（自訂特性） | 無 | 保持自訂文字；僅真正共用 UI 可使用核准模板 |

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
4. 族裔候選／已選／摘要、文化語言選項、Choice 一般／擴充／空清單、龍鱗跨等級／英中切換／未知備援及自訂保護回歸，以及 verify-isolated 均已通過。Marc 已於 2026-10-10 人工驗收通過，PR #60 待最新 CI／squash 合併；不把 13 個已接 Field 重算成新譯文。

## 預設描述附錄

以下 55 筆來自 FeatureLogic.getFeatureTypeDescription，都是程式 UI，尚無精確核准來源；Choice 為本批，其他類型依所在頁面後續成批處理。

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
