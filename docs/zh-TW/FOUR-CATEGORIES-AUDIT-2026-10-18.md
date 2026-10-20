# 族裔、文化、生涯、專長中文化盤點（2026-10-18）

## 結論與範圍

**仍有缺漏，不能把這四類判定為全畫面、全段落中文化完成。** 主要項目的名稱已有對照；缺漏集中在 Classic／Reference、次級詳情與精簡總覽接線，以及尚無核准網站適配的族裔段落。

- 檢查基準：本機 `develop`，HEAD `2bfed1f4d541a91815f9859a0f5a5ee8ee337c24`，上游資料版本 `14.207.0`。開始時工作樹乾淨。
- 核准依據：Repo 已匯入的雙來源快照；Book 修改時間 `2026-10-17T02:36:52.060Z`、Forge 修改時間 `2026-10-18T06:59:37.794Z`，見 `src/l10n/generated/zh-TW/meta.json`。
- 本次沒有重新讀取線上 Sheet、拉取遠端分支或檢查部署站；「無核准」均指本機快照尚無可直接用於該網站原文／用途的核准版本，不代表書本沒有翻譯。
- 只盤點，沒有修改程式、遊戲資料、翻譯、mapping、快照或 Sheet 核准／進度。本文件不變更既有批次驗收結果。
- 自訂、改名、Homebrew、未知來源與未知動態改寫的英文備援依規則保留，不列為漏譯。

| 類別 | 已確認的主要覆蓋 | 仍有缺漏 |
|---|---|---|
| 族裔 | 12 個官方族裔名稱／簡介；19 個族裔招式名稱有對照 | Classic 一般特性、4 段 Classic 招式效果、前世候選描述；7 段短描述、8 段文字效果及 2 段複合特性外層介紹未有網站對照；共用 UI／招式欄位仍有英文 |
| 文化 | 27 個官方文化名稱與三面向摘要；13 個面向名稱／網站短描述有對照 | Classic 面向技能／語言計數、標題與文化加成；Bespoke 預設卡、文化類型標籤 |
| 生涯 | 18 個名稱／簡介、108 組關鍵事件名稱／描述 | 4 個益處欄位漏接、15 個益處標題、35 個技能特性的次級詳情／Classic 計數、16 個語言計數、10 段單語描述及部分 UI |
| 專長 | Heroes 47 個專長、6 類別；主要詳情／已選／Classic 專長元件掃描通過 | 精簡總覽語言學家子項、來源標籤、Classic 外框與共用操作 UI |

表內各數字的單位不同，且同一內容可能出現在多個位置；不可相加成剩餘翻譯總數或完成率。

## 一、已有核准內容，但顯示漏接

### A1：Classic／Reference 的一般族裔特性（優先）

`FeatureComponent` 沒有一般族裔的 ElementScope／明確描述鍵；其 `OfficialPerkName` 僅對 `perk-` 名稱使用 PlayerName，其他 ID 原樣輸出。上游 SheetFormatter 只做複製、計算與英文清理，沒有先翻成中文。

- 實際 SSR 範例：歐克 `orc-feature-1` 在 PerksCard 顯示 `Relentless` 與 `Whenever a creature deals damage to you that leaves you dying...`。名稱與效果其實都有核准對照（`mapping.ts:95`、`:96`）。
- 對 12 族裔資料向下展開的 161 個唯一特性節點（含巢狀、父節點及附屬文化）逐一渲染 FeatureComponent，**90 個節點至少有一個已核准欄位仍輸出原英文**。其中 **31 個 Text 特性的名稱與完整效果同時仍為英文**。
- 90 是「候選節點直接渲染」的發現數，不是 90 個畫面，也不代表任一英雄同時擁有這些特性；實際選擇、拆分、參照頁分流與縮寫仍須在修補時驗證。
- 其他命中型別包括加值、豁免門檻、速度、傷害修正、條件免疫等；條件值本身可能中文，但特性名稱仍英文。族裔 Ability 特性的 Classic 簡介也存在原文殘留，不可由獨立 AbilityCard 的簡介中文推論完成。

依據：`src/components/panels/classic-sheet/components/feature-component.tsx:56`、`:63`、`:211`、`:574`；`src/components/panels/classic-sheet/perks-card/perks-card.tsx:20`；`src/components/panels/classic-sheet/reference/feature-reference-card.tsx:60`；`src/logic/classic-sheet/sheet-formatter.ts:53`；`src/logic/hero-sheet/hero-sheet-builder.ts:402`。

### A2：4 個 Classic 招式卡的核准效果仍英文

| 招式 | 未接入的鍵 |
|---|---|
| Dragon Breath | `section:dragon-knight-feature-2-10:1` |
| Shadowmeld | `section:polder-feature-1:0` |
| Detonate Sigil | `section:revenant-feature-4-5-2:1` |
| Minor Acceleration | `section:time-raider-feature-2-5-3:0` |

SSR 已逐一確認。AbilityCard 在第一個文字效果前加上 `**Effect:**`，族裔的查鍵分支因原文不符而回退英文；套裝已有專用處理，族裔未套用。Glowing Eyes、Glamor of Terror、Detect the Supernatural 因 `isNotTrueAbility` 不加此前綴，其核准效果正常中文，不屬此項。

依據：`src/components/panels/classic-sheet/ability-card/ability-card.tsx:146`、`:153`、`:162`；`src/l10n/ability-text.ts:324`；`src/l10n/lookup.test.ts:3362` 甚至保留 Shadowmeld Classic 效果英文的斷言。這是既有覆蓋缺口，不是本次測試失敗。

### A3：還魂屍前世特性下拉候選描述

- `revenant-feature-4-1`、`revenant-feature-4-4` 的 1／2 點選項，候選名稱使用 PlayerName，描述卻直接傳入 Field。Field 不會查翻譯，所以像人類 `Can't Take Hold` 的候選效果仍是英文。
- 空清單提示 `There are no options to choose for this feature.` 也未使用既有核准 `ui.hero-builder.no-options.6662aa9c`。
- 此項依元件呼叫核對；本次未在瀏覽器逐一開啟所有前世下拉。

依據：`src/components/features/feature-data/ancestry-feature-choice.tsx:123`、`:134`、`:137`；`src/components/controls/field/field.tsx:57`。

### A4：4 個生涯益處欄位被 ID 前綴誤擋

| 生涯 | 特性 ID | 仍英文的欄位 |
|---|---|---|
| Gladiator | `gladiator-feature-3` | Renown |
| Laborer | `laborer-feature-4` | Project Points |
| Mage’s Apprentice | `mages-apprentice-feature-4` | Renown |
| Performer | `performer-feature-3` | Renown |

`careerBenefitFieldKey` 除了核對官方特性，還要求 ID 以 `career-` 開頭；這 4 個官方 ID 不符合，導致詳情與 Classic 數值後面的欄位名都沒翻。15 個生涯 Bonus 中，其餘 11 個欄位值正常中文。修補應調整顯示識別，不改官方 ID。

此外 **全部 15 個 Bonus 的特性標題仍直接顯示 Renown／Wealth／Project Points**；即使欄位已中文，仍會呈現例如 `Project Points` 標題與 `+240 專案點數` 混用。

依據：`src/l10n/career-benefit-ui.ts:36`；`src/components/panels/elements/feature-panel/feature-panel.tsx:163`；`src/components/panels/classic-sheet/components/feature-component.tsx:183`。已對全部 18 個生涯、84 個頂層特性進行 SSR 核對。

### A5：生涯技能／語言在不同位置覆蓋不一致

| 位置 | 實際結果 |
|---|---|
| 建角右側 FeatureConfigPanel | 已接核准技能／語言提示；本次 18 生涯的設定輸出未發現一般提示漏接，但農夫已選馴獸用途有來源差異，見 B3 |
| CareerPanel 的 Features 內容使用 FeaturePanel | 35 個 SkillChoice 的標題與生成說明仍英文，例如 `Crafting Skills`／`Choose 2 from Crafting skills.`；詳情重建的設定元件是另一條路徑，不能相互代替 |
| 同一 FeaturePanel 語言描述 | 16 個 LanguageChoice 中，10 個單語描述 `Choose a  language.` 仍英文；6 個雙語描述已由現有 adapter 處理 |
| Classic 技能計數 | 35 個 SkillChoice 仍有 `1 Interpersonal Skill`、`2 Crafting or Exploration Skills` 等英文；已選技能名稱本身可中文 |
| Classic 語言計數 | 16 個 LanguageChoice 仍有 `1 Language`／`2 Languagess`；後者是原有組字問題，不應改寫遊戲原始資料來修正 |

依據：`src/components/panels/elements/feature-panel/feature-panel.tsx:159`、`:200`；`src/l10n/perk-list-ui.ts:114`；`src/components/panels/classic-sheet/components/feature-component.tsx:98`、`:151`、`:177`。Classic 技能／語言 adapter 的部分條件限定 `perk-`，因此生涯及文化未受惠。

### A6：專長精簡總覽、來源名稱

- 語言學家拆分子項 `perk-linguist-1` 沒有獨立名稱 mapping；完整卡片使用既有父名稱重用助手，精簡列只使用 PlayerName，因而顯示 `Linguist`。SSR 已重現精簡總覽 `Features / Linguist / Customization`。
- `perk-linguist-2` 的 `Languages` 子項在 All Features 精簡列也走同一個未支援路徑；此開關情境依靜態呼叫核對，未以瀏覽器點選。
- 特性來源 Tag／依來源分組標題只使用 kit 名稱助手，生涯／族裔來源如 `Artisan` 仍英文，雖然該名稱已有核准對照。

依據：`src/components/panels/hero/features/features-panel.tsx:37`、`:106`、`:159`；`src/l10n/player-name.tsx:24`；`src/l10n/perk-list-ui.ts:147`；`src/logic/feature-logic.ts:81`。

### A7：已有 exact 核准 UI，仍硬編碼英文

| 位置 | 未接的文字 |
|---|---|
| AncestryPanel 分頁 | Overview、Signature、Culture |
| 族裔特性 Signature 色帶 | Signature |
| CareerPanel 分頁 | Features |
| Classic CareerCard | Career、Inciting Incident |
| Classic CultureCard | Culture、Environment、Organization、Upbringing、Languages |
| FeaturesPanel 總覽 | Features |
| Bespoke 預設文化卡 | Bespoke Culture（右側設定名稱雖中文，候選／已選卡未接） |

依據：`src/components/panels/elements/ancestry-panel/ancestry-panel.tsx:106`；`src/components/panels/elements/feature-panel/feature-panel.tsx:180`；`src/components/panels/elements/career-panel/career-panel.tsx:95`；`src/components/panels/classic-sheet/career-card/career-card.tsx:21`、`:36`；`src/components/panels/classic-sheet/culture-card/culture-card.tsx:29`；`src/components/panels/hero/features/features-panel.tsx:76`；`src/data/culture-data.ts:181`。

有同字核准來源表示具備修補依據；實作時仍須核對該 UI 的用途、官方來源與自訂保護，不主張無條件全域替換。

## 二、尚缺核准網站版本／適配，應先做預覽

### B1：族裔內容段落

| 欄位 | 尚無網站 mapping 的項目 |
|---|---|
| 7 段招式短描述 | Glowing Eyes `devil-feature-2-3`；Draconian Guard `dragon-knight-feature-2-1`；Glamor of Terror `high-elf-feature-2-0`；The Wode Defends `wode-elf-feature-2-5`；Detect the Supernatural `human-feature-1`；Beyondsight `time-raider-feature-2-1`；Psionic Bolt `time-raider-feature-2-5-2` |
| 8 段招式文字效果 | Draconian Guard `dragon-knight-feature-2-1:0`；Remember your Oath `dragon-knight-feature-2-8:0`；Resist the Unnatural `human-feature-2-3:0`；Determination `human-feature-2-4:0`；Keeper of Order `memonek-feature-3-5:0`；Reactive Tumble `polder-feature-3-4:0`；Beyondsight `time-raider-feature-2-1:0`；Foresight `time-raider-feature-2-2b:0`（鍵均為 `section:` 前綴） |
| 2 段 Multiple 外層介紹 | Wode Elf Glamor `wode-elf-feature-1`；Foresight `time-raider-feature-2-2` |

族裔共有 19 個招式，其中非空短描述 17 段：10 有 mapping、7 無；文字效果 15 段：7 有 mapping、8 無。書本已有較長整段翻譯，不代表網站短句、改寫段落或第二種用途已獲核准；不能直接截取中文或改 hash 掩蓋差異。

依據：`src/data/ancestries/` 實際展開；`src/l10n/mapping.ts`；`src/l10n/lookup.test.ts:3370`；`docs/zh-TW/COVERAGE.md` 的既有延後說明。非文字的 power roll tiers 不含在 15 段中；族裔招式的關鍵字、動作類型、距離、目標、觸發句與 tiers 亦仍有英文，不能由名稱或文字效果完成推論完成。

### B2：文化／共用 UI 與生成資訊

- AncestryPanel：`Purchased`、`Ancestry Points`；前世選項的 `Ancestry Feature` 及預設說明。
- CulturePanel 類型標籤：`Ancestral`／`Professional`／`Bespoke`。不可直接把現有複數文化分類譯文當作單數標籤已核准。
- Bespoke 預設描述：`Choose any Environment, Organization, and Upbringing.`。
- Classic 文化卡：`Culture Name`、`Culture Language`；文化考驗獲得優勢的整段說明。Book `heroes.background.culture.benefits.rules` 有對應內容，但網站只取單一段落，目前沒有獨立核准適配。
- Classic 13 個文化面向的技能計數仍英文，與 A5 的共用 Classic 技能路徑相同。
- Classic 專長卡：`Ancestry Traits and Perks`、`Remaining perks in Reference…`。
- 特性總覽操作：`Feature Options`、`Organize`、`Alphabetical`、`Group by level`、`Group by source`、`All Features`；屬共用介面，並非新增專長效果翻譯。
- 族裔的傷害修正、移動模式、擲骰修正等生成資訊仍可見英文，如 `Fly`、`When interacting with undead creatures`。需另盤實際來源、組句與核准用途。

依據：`src/components/panels/elements/ancestry-panel/ancestry-panel.tsx:62`；`src/components/panels/elements/culture-panel/culture-panel.tsx:26`；`src/data/culture-data.ts:181`；`src/components/panels/classic-sheet/culture-card/culture-card.tsx:31`、`:49`；`src/components/panels/classic-sheet/perks-card/perks-card.tsx:14`；`src/components/panels/hero/features/features-panel.tsx:125`；`src/components/features/feature-data/damage-modifier.tsx:30`、`movement-mode.tsx:22`、`roll-modifier.tsx:32`。

### B3：農夫的已選馴獸用途是不同網站原文

`career-farmer-feature-1` 預選 Handle Animals，設定區顯示 `Interact with animal wildlife that isn’t sapient.`。核准技能規則表的英文為 `Interact with nonsapient animal wildlife`。現有 `resolveSkillDescription` 要求精確吻合，因此保留英文。

這是缺核准適配／原文差異，不是技能名稱漏譯；不應放寬成任意近似字串。依據：`src/data/sourcebooks/official/core.ts:709`；`src/data/careers/farmer.ts:14`；`src/l10n/skill-text.ts:19`。本次 SSR 已重現。

## 三、刻意保留與不計入漏接的項目

- 核准計數模板本身保留量詞 **Perk**，例如「1 項工藝類 Perk」；不能因 Glossary 有「專長」便自行改模板。既有 Perks 按鈕、圖示字及 Auto-calculate damage 等依 PERKS-01 範圍保留英文。
- Career 的 **74 筆背景問題**已在 Book 核准目錄，但網站模型沒有對應欄位，屬不適用；本次不建議為補翻譯新增模型或存檔欄位。
- Heroes 47 個核心專長沒有整項漏列：工藝 6、探索 10、交涉 10、諜報 6、學識 8、超常 7。魔寵父描述為空，走專用召喚物接線；不是少一筆效果。
- Repo 另有 **34 個非 Heroes 專長**：Beastheart 8、社群 6、Age of Secrets 5、Triglav 4、Look Out／Kiln 11。它們沒有本批名稱對照，屬範圍外；不能把它們算成 Heroes 47 項退步。現有 PERKS-01 其他來源清單漏列 Look Out／Kiln 11 項（`src/data/sourcebooks/third-party/look-out.ts:1178`）。
- 舊 COVERAGE／NEXT-BATCH 有歷史延後項；TODO 的早期 BOOK-01 敘述亦保留 3 個專長名稱英文的舊狀態，而後續 PERKS-01 已接入。此次依目前程式與快照判定，不重新把已完成項目列為待翻。

## 四、驗證結果與限制

1. 既有 10 個相關測試檔 **159 項通過**：`career-summary`、`career-incident`、`career-perk-ui`、`career-benefit-ui`、`perk-english-sweep`、`lookup`、`player-name`、`player-culture-summary`、`official-feature-source`、`inventory`。
2. 臨時 SSR 盤點已驗證：18 生涯共 84 頂層特性、精簡總覽 Linguist、47 個無英雄專長詳情、19 個族裔 Classic 招式卡，以及 161 個族裔資料內特性節點。4 個最終盤點測試均通過，含保留原始生涯資料不變的檢查。探針已移除，不新增永久測試。
3. 專長既有英文掃描涵蓋 1／5 級的詳情、已選列、Classic 子元件、招式卡；不涵蓋整個 FeaturesPanel 精簡總覽、來源標籤及 PerksCard 外框，故測試通過不能證明這些位置已中文。
4. 第一次測試因沙箱 TEMP 的 SSR 暫存檔 ENOENT 而未完整執行；`verify.mjs --doctor` 通過後，僅將測試子程序 TEMP／TMP／TMPDIR 指向 `node_modules/.cache/l10n-audit-temp`，再跑同批測試取得上述通過結果，未調整 worker／逾時。
5. 這次是程式、快照與靜態渲染盤點；**未執行完整六項驗證、瀏覽器全旅程操作或列印版面驗收**。沒有截圖或錄影。

既有測試重跑入口：

```powershell
node node_modules/vitest/vitest.mjs run src/l10n/career-summary.test.ts src/l10n/career-incident.test.ts src/l10n/career-perk-ui.test.ts src/l10n/career-benefit-ui.test.ts src/l10n/perk-english-sweep.test.ts src/l10n/lookup.test.ts src/l10n/player-name.test.ts src/l10n/player-culture-summary.test.ts src/l10n/official-feature-source.test.ts src/l10n/inventory.test.ts
```

## 五、建議處理順序

1. **顯示漏接批次**：族裔 A1–A3 已在 `ANCESTRY-DISPLAY-01.md` 修補並待 Marc 人工驗收。後續 A4–A7（生涯益處、技能／語言、專長精簡總覽與共用 UI）仍待後續依類別分批處理；凡需要新適配或改變既有用法核准的部分，移到預覽批次。
2. **族裔內容適配批次**：逐條預覽 B1 的 7 段短描述、8 段效果、2 段外層介紹，核對書本與網站差異後再核准；招式 tiers／欄位另列可驗收範圍。
3. **共用 UI／生成資訊批次**：處理 B2、B3，以及 DISPLAY-DEFAULTS 實際可見的未核准預設說明。避免把全部 FeatureType 或第三方來源一起擴入。

本盤點文件記錄最初發現與建議拆分；族裔 A1–A3 的目前修補狀態以 [ANCESTRY-DISPLAY-01](ANCESTRY-DISPLAY-01.md) 為準。未變更既有核准、快照或驗收狀態。
