# Forge Steel 繁體中文化技術方案比較

- 文件狀態：技術方向已核准
- 核准日期：2026-08-06
- 核准者：專案負責人
- 盤點 commit：`34890a3b420d3067caa91474c9ca52afc5e39c4d`
- 分析範圍：V1 繁中／英文顯示層架構；不包含實作、譯文製作或完整 ADR
- 需求依據：`docs/requirements/V1-REQUIREMENTS.md`
- Codebase 依據：`docs/analysis/CODEBASE-SUMMARY.md` 與本文件列出的代表性原始碼
- 文件分類：現行權威
- 權威用途：記錄已核准的 V1 中文化核心技術方向與不可變安全邊界
- 非核准內容：方案比較分析、可替換實作細節、prototype 候選做法與尚未驗證事項

**核准效力說明：** 已核准方案 A 作為 V1 runtime 核心，搭配方案 C 的 build／test-time catalog 驗證能力；已核准英文 canonical data、規則、parser、ID、enum、引用與存檔格式保持不變。文件中的其餘 library、catalog 格式、檔案位置、無 ID identity、搜尋、排序及工程控制，不因寫在文件中而自動成為唯一正式要求，應由最小 prototype 或後續實作證據決定。因此，本文件並非所有內容皆已核准。

**術語規則：** 在正式術語翻譯獲得專案負責人核准前，本文件對遊戲資料類型、mechanic、UI label 與 model 名稱均使用 canonical English；中文只用於一般工程說明，不代表任何遊戲術語定稿。

## 1. 文件目的與分析基準

本文件比較 Forge Steel 繁體中文版可採用的中文化技術方案。核心技術方向已由 Reviewer 審查，並由專案負責人於 2026-08-06 核准；本文件仍不核定正式譯文、翻譯工作流程、i18n library 或其他可替換的實作細節。實作前仍須先完成並通過最小 prototype。

分析採用下列原則：

1. 先以 V1 需求和 repository 實際資料流限制候選方案，再比較一般 i18n 優缺點。
2. 把「顯示文字」和「規則／存檔值」視為不同責任；任何無法可靠分隔兩者的方案都不適合 V1。
3. 優先保護正確性、相容性、可回復性與逐步交付，而不是追求一次抽象所有文字。
4. 只採代表性證據，不建立完整英文清單，也不把本文件擴張為全 codebase 架構評估。

## 2. V1 架構不變條件

所有候選方案都必須同時符合：

- 預設顯示繁體中文，並可一鍵切換繁中／英文及記住選擇。
- 切換語言不得改變 Hero data、規則結果、目前路由或頁面狀態，也不得遺失未儲存的編輯內容與 `dirty` 狀態。
- 英文原始資料仍是唯一 canonical rule data；中文只存在於顯示層。
- 不修改 ID、enum、引用關係、計算、parser、Hero save data format 或匯入／匯出格式。
- 既有 Hero、LocalForage、Warehouse 與匯入 JSON 必須保持相容。
- 繁中與英文模式使用相同且獨立於 locale 的 `SourcebookType` policy：允許 `SourcebookType.Official` 與 `SourcebookType.Homebrew`，排除 `SourcebookType.ThirdParty` 與 `SourcebookType.Community`。Official Patreon／Playtest 沿用原版 feature flag；localization layer 不得控制 feature flag。Homebrew 保持 canonical 使用者資料，不做自動翻譯或資料改寫。
- 玩家輸入內容保持原樣；正式中文譯文只由專案負責人核准，AI 不得自行覆寫。
- V1 必須做 Hero Sheet、PDF、圖片與列印的最低 smoke test；完整中文排版與字型最佳化可延至 V1.1。

以上條件是淘汰門檻，不以其他質性優點抵銷。

## 3. Repository 證據摘要

| 判斷 | 代表性證據 | 對方案的影響 |
|---|---|---|
| 專案目前沒有 i18n layer | `package.json` 沒有 i18n dependency；`src/models/options.ts:Options` 沒有 locale 欄位 | library 與 catalog 格式尚未決定；不能假設既有整合點 |
| 啟動資料由單一 loader 建立 | `src/index.tsx` 的 `DataLoader → DataManagerProvider → Main`；`src/components/panels/data-loader/data-loader.tsx:loadData()` 同時載入 sourcebooks、heroes、options、session | 語言切換若重跑 `loadData()`，會重建 app state；應避免 |
| Official 與非 Official Sourcebooks 目前混合載入 | `src/data/sourcebook-data.ts:SourcebookData.loadAll()` 固定匯入 Core、Orden、Beastheart、Summoner，也固定匯入 Community／Third Party，並可依 flag 匯入 Playtest | Community／Third Party 必須在 locale 之外排除；Official Sourcebooks 不得被固定 ID list 截斷 |
| 內建與 Homebrew 會合併 | `src/logic/sourcebook-logic.ts:SourcebookLogic.getSourcebooks()` 先取 cached built-ins，再加入 Homebrew | Homebrew 合併是應保留的原版功能；過濾防線必須保證 Homebrew 不被誤刪，Community／Third Party 不得藉由 aggregation 重新進入 runtime |
| 新 Hero 會採所有 Official | `src/components/main/main.tsx:newHero()` 以 `SourcebookType.Official` 產生 `sourcebookIDs` | 這符合現行產品決策；新 Hero 可以使用所有已實際載入的 Official，Patreon／Playtest 在 feature flag 啟用並載入時可自然成為 Official options |
| 規則文字是物件欄位 | `src/models/element.ts:Element` 有 `id`、`name`、`description`；`src/data/sourcebooks/official/beastheart.ts` 有 Markdown `effect`；`src/data/ability-data.ts` 與 `src/data/classes/tactician/tactician.ts` 有 sections | catalog 必須能定位 element 欄位與巢狀 section，而不是只處理 JSX 固定文字 |
| `name` 不是安全的純顯示欄位 | `src/logic/hero-sheet/hero-sheet-builder.ts` 以 `Augmentation`、`Ward`、`Prayer of`、`Enchantment of` 比對名稱；其他名稱也用於排序與 CSS | canonical `name` 必須保持英文；中文名稱只能在顯示邊界取得 |
| `Language` 與 `Skill` 以英文名稱存取 | `src/models/language.ts`、`src/models/skill.ts` 沒有 ID；`src/logic/hero-logic.ts:getLanguages()` 以 `l.name === name` 查找，`getSkills()` 以名稱查找；`src/data/sourcebooks/official/orden.ts` 的 `related` 也是名稱陣列 | 顯示中文不能回寫 `selected`、`related` 或 Hero；無 ID 項目的 catalog identity 需另行治理 |
| 現有搜尋只比對傳入文字 | `src/utils/utils.ts:Utils.textMatches()` 將查詢 `toLowerCase()` 後以半形空白 `split(' ')`，再比對 sources；`src/logic/library-logic.ts` 傳入 canonical `name`、`description` 與 feature names | 若索引只有 canonical 英文，中文關鍵字找不到中文 display text；需要 locale-aware presentation search index，但結果仍須回到 canonical identity |
| 顯示排序與規則排序交錯 | `src/utils/collections.ts:Collections.sort()` 使用 key 的 `localeCompare()`；`src/logic/hero-logic.ts` 與 `src/logic/classic-sheet/sheet-formatter.ts` 也以 canonical 欄位排序 | 影響規則、identity 或輸出的排序須保持 canonical；純顯示清單才可另評估 localized label 排序 |
| 英文規則文字會被解析 | `src/logic/ability-logic.ts` 解析 `damage`／`dmg`、characteristic、potency 等英文；`src/logic/classic-sheet/sheet-formatter.ts` 判斷 `Melee`／`Ranged`／`Self` 與 trigger 字首 | parser 與 builder 必須永遠收到 canonical 英文，不可收到中文投影物件 |
| builder／formatter 會產生可見衍生文字 | `src/logic/hero-sheet/hero-sheet-builder.ts`、`src/logic/classic-sheet/classic-sheet-builder.ts` 與 `sheet-formatter.ts` 會組合名稱、數值、trigger、target、規則結果與格式 | 完成的英文句子不能直接當唯一翻譯 identity；需追蹤可結構化參數化的 presentation boundary |
| Hero creation／level-up 依賴 canonical 結構 | `src/logic/hero-logic.ts:canLevelUp()`、`setLevel()`；`src/components/pages/heroes/hero-edit/class-section/class-section.tsx` 使用 `FeatureLogic.getFeaturesFromClass()` 與 `FeatureConfigPanel` | locale 不能成為 Hero creation 或 level-up data model 的一部分 |
| 編輯頁有未儲存 working copy | `src/components/pages/heroes/hero-edit/hero-edit-page.tsx` 以 `Utils.copy(originalHero)` 建立 local `hero`，並另存 `dirty` | 切換必須只造成文字重新 render，不可 remount `HeroEditPage`、換 route、重建 hero 或 loader |
| 儲存後端直接保存 Hero | `src/services/data-service.ts`；`src/services/storage/local-service.ts`；`src/services/storage/warehouse-service.ts` | locale 與翻譯資料不得混入 Hero；兩個後端應看到完全相同的 Hero schema |
| 匯入／匯出直接處理 JSON | `src/components/pages/heroes/hero-list/hero-list-page.tsx` 以 `JSON.parse` 匯入；`src/components/main/main.tsx:exportHeroData()` 匯出 hero | 中文投影若回寫物件，會直接污染交換格式 |
| Hero Sheet 在顯示前仍執行大量 logic | `src/logic/hero-sheet/hero-sheet-builder.ts:buildHeroSheet()`、`src/logic/classic-sheet/classic-sheet-builder.ts`、`sheet-formatter.ts` | 應先用英文 canonical data 完成規則衍生，再在明確的輸出欄位／component 顯示邊界本地化 |

### 3.1 文字分類補充：derived／composed display messages

除 UI 固定文字與 canonical 規則欄位外，V1 必須獨立識別 **derived／composed display messages**：由 builder、formatter、數值、條件或多個 canonical 欄位在 runtime 組合而成的可見文字。規則計算、parser、分類與 builder input 仍使用 canonical 英文／structured values；可見句子應在 presentation boundary 以 locale message template 加結構化參數組合。完整 runtime 英文句子不得作唯一翻譯 identity，也不得對 builder／parser 已生成的任意英文段落做全域字串替換。數字、插值、Markdown、規則 token 與玩家輸入必須原樣且正確地傳入模板。

### 3.2 仍不能由現有證據直接推定的事項

- `Language`、`Skill` 及某些沒有 element ID 的巢狀項目，最穩定的外部 localization identity 尚待 prototype 驗證；不得使用易受陣列重排影響的裸 index 作為長期 key。
- 尚未逐欄證明所有 `name`、`description`、`effect`、section text 是否純顯示；實作時必須採「未分類即高風險」原則。
- React subtree 在加入 locale provider 後的實際 remount 邊界與渲染成本待 prototype 測量。
- 現有 Hero Sheet 的每個中間 model 哪些欄位適合在 builder 後本地化，待針對代表性輸出追蹤；不能假設整個 sheet model 都是純顯示。
- 若現有 builder 只輸出完成的英文句子，應在哪一層拆出 message identity 與 structured params，仍需逐一追蹤；本文件不先決定重構方式。

## 4. 評估標準

先套用第 2 節淘汰門檻，再以高／中／低做質性比較。優先度只揭露 V1 取捨，不是量測結果，也不核定可替換的實作細節。

| 標準 | 優先度 | 評估問題 |
|---|---|---|
| canonical／規則安全 | 最高 | 中文是否可能進入 parser、名稱比對、計算或引用？ |
| 存檔與交換相容性 | 高 | Hero、LocalForage、Warehouse、匯入／匯出是否保持原 schema？ |
| 切換與 UI state 安全 | 高 | 是否可不重載資料、不換 route、不破壞 working copy／dirty？ |
| UI、規則與輸出涵蓋力 | 高 | 是否能處理固定 UI、巢狀規則文字、搜尋與 Hero Sheet？ |
| 缺漏／漂移可驗證性 | 中 | 能否發現缺漏、多餘、失效 identity 與英文變更？ |
| V1 逐步交付性 | 中 | 是否能以小範圍導入、英文 fallback，再逐步完成？ |
| 修改面積與維護成本 | 中 | 是否避免大規模 model／logic 重構，並利於上游更新？ |

## 5. 方案 A：穩定識別碼／欄位路徑旁掛翻譯表

### 5.1 機制

英文 sourcebooks、Hero 與 models 完全不變。獨立 catalog 保存 UI key 或「canonical identity + 顯示欄位」對應的核准中文；component 在實際呈現文字時呼叫小型 resolver，並把 canonical 英文當 fallback。

概念性 key（不是本文件核定的正式格式）：

- UI 固定文字：語意 key，例如 `hero.actions.save`。
- 有穩定 ID 的規則 element：`element:<id>/name`、`element:<id>/description`。
- 巢狀顯示欄位：由 element ID 錨定，再加受控 field path／slot identity；不能只靠全域英文原文或裸陣列 index。
- 無 ID 的 `Language`／`Skill`：由外部 catalog 維護明確 identity 與 canonical 英文查找映射；實際格式列為待確認。

catalog 至少應能保存 localization identity、canonical 英文快照或 hash、核准中文、狀態與備註，以支援 V1 需求的原文更新檢查。這些 metadata 不加入規則物件或 Hero save data。

### 5.2 UI、規則文字與高風險名稱

- **UI 固定文字：** component 以語意 key 取得文字；同一英文若出現在不同用途，使用不同 UI key，避免不同語境被錯誤綁定。
- **`description`、`effect`、section text：** 以 element ID 加欄位／slot identity 查 catalog；Markdown 內容仍是顯示 payload，不回寫原物件。
- **高風險 `name`：** logic、identity、selected value、CSS token、存檔及任何影響結果的排序繼續使用 canonical 英文 `name`；只有 label、heading、card title 等呈現位置取 `displayName`。純 presentation 清單可評估按 localized label 排序，但不得改變 identity、value、Hero values、Hero options 或存檔。未完成欄位風險分類前，不提供會覆寫整個物件的 helper。
- **`Language` 與 `Skill`：** Hero 的 `selected: string[]`、`Language.related` 與 `HeroLogic.getLanguages()`／`getSkills()` 繼續使用英文。下拉選單應是 `{ value: canonicalEnglishName, label: localizedDisplayName }`；不得以中文 label 當 value。
- **parser 與文字驅動 logic：** `AbilityLogic`、`HeroSheetBuilder`、`ClassicSheetBuilder`、`SheetFormatter` 只接收原英文物件。若 parser 產生顯示結果，先完成英文計算，再對已知顯示 slot 做本地化；不把中文送回 parser。
- **derived／composed display messages：** builder input 與規則結果保持 canonical／structured；在 presentation boundary 用穩定 message key 與結構化參數組句。不得用完整 runtime 英文句子作 key 或對完成段落全域替換；模板必須正確保留數字、插值、Markdown、規則 token 與玩家輸入。
- **搜尋與排序：** 先以 `SourcebookType` policy 限制 canonical 搜尋範圍，再以允許 element 的 localized display text（及依產品決策納入的 canonical 英文）建立 presentation index。中文查詢只查此 index，結果回傳 canonical ID／物件；不得把中文名稱寫入 Hero、selected value、規則資料或存檔。V1 搜尋只查目前語言或同時查中英，以及中文模式純顯示清單採 canonical 或 localized label 排序，均待專案決定。

### 5.3 Hero lifecycle、切換與儲存

- **Hero creation、Level 1→2／3 level-up：** `FactoryLogic`、`HeroLogic.setLevel()`、`FeatureLogic` 與 feature ID／enum 流程不變；Hero options 只替換 label。Hero Sheet builder 先從 canonical data 建出相同規則結果，再在 render boundary 解析顯示文字。
- **安全切換：** locale state 放在 `DataLoader` 完成後仍可穩定存在、但不以 locale 作為 `HeroEditPage` 或 router 的 React `key`。切換只更新 context／store 並重新渲染文字，不呼叫 `DataLoader.loadData()`，不 navigation，不重新建立 sourcebook 或 hero。
- **working copy：** `HeroEditPage` 的 local `hero` 與 `dirty` 不含 locale；切換前後應保持同一份語意資料。需用 integration test 證明 component 沒有 remount。
- **LocalForage／Warehouse／匯入匯出：** locale preference 可存於 app options 或獨立 app preference，但不得放入 Hero。Hero 維持既有 schema，`saveHero`、Warehouse API、`JSON.parse` 匯入與 `exportHeroData` 不需 locale-aware。

### 5.4 `SourcebookType` policy、fallback 與一致性檢查

- **`SourcebookType` policy：** 在 `SourcebookData`／available Sourcebook set 的共同邊界依 `SourcebookType` 保留 Official／Homebrew、排除 Community／Third Party，不由 catalog 是否有翻譯決定。繁中與英文 resolver 共用同一 policy；Official Patreon／Playtest 仍依原版 feature flag 決定是否載入。
- **fallback：** runtime 缺少中文時顯示傳入的 canonical 英文，不能顯示空字串、key 或改動資料。開發環境記錄缺漏；發布 gate 對 V1 玩家範圍視為失敗。GM 未翻譯範圍依需求允許英文 fallback。
- **缺少翻譯：** 由「V1 必要 identity manifest」對 catalog 做差集。
- **多餘翻譯／失效 ID：** catalog identity 對 currently allowed Sourcebooks 與 UI key registry 做反向差集；不存在的 element ID 或 field slot 報錯。
- **英文原文變更：** 比較 catalog 的 canonical snapshot／hash 與當前英文欄位；變更後標為待重新核准，不自動改中文。
- **無 ID 項目：** 驗證明確 identity 映射能唯一命中一個 canonical `Language`／`Skill`；0 或多個命中都失敗。

### 5.5 測試、成本、更新與交付

- **單元測試：** locale fallback、ID／path 命中、錯誤 identity、source hash 漂移、placeholder／Markdown／規則 token／玩家輸入保留，以及 value 英文／label 中文分離。
- **integration test：** 在 `HeroEditPage` 修改未儲存欄位後切換兩次，驗證 route、Hero JSON、dirty、Hero options、計算不變；建立 Hero 並 level-up 至 Level 2、3；存檔重開；匯入舊 JSON、再匯出比較 schema。
- **搜尋、來源與輸出測試：** 中文關鍵字命中中文 display text 後回傳正確 canonical element；英文搜尋仍可運作；Community／Third Party 不進入任何 locale 的 index／結果；搜尋與純顯示排序不改變 Hero JSON 或 Hero options value。兩個 locale 都使用相同的 Official／Homebrew 政策；Hero Sheet 英文／繁中顯示可變但 Hero values 與 Hero options 一致；PDF／圖片最低 smoke test。
- **衍生文字測試：** 至少選一個代表性的 derived／composed message，驗證切換前後規則結果不變、locale template 可切換、所有插值正確，且中文輸出不回流 parser 或 storage。
- **修改面積：** 需要 locale provider、resolver、catalog、顯示呼叫點與驗證工具；models、parser、計算及 Hero schema 不必整體重構。規則 component 數量仍多，需逐步覆蓋。
- **上游更新：** canonical diff 與 snapshot/hash 可直接指出英文變更；穩定 ID 未變時多數翻譯仍可沿用。欄位移動或無 ID 項目變更需人工處理。
- **V1 逐步交付：** 可先建 resolver 與一小段 vertical slice，再按玩家流程擴充 manifest；英文 fallback 讓未覆蓋區可運作，但 V1 發布前玩家範圍缺漏必須歸零。

### 5.6 主要失敗模式與回復方式

| 失敗模式 | 保護／回復 |
|---|---|
| component 把 localized label 當 value 寫回 hero | 型別／測試固定 value 為 canonical；立即回退該顯示呼叫點至英文 |
| field path 因上游結構變動失效 | validator 報 stale／missing；runtime 英文 fallback；重新對應而不改 canonical data |
| locale provider 導致編輯頁 remount | integration test 監測 working copy／dirty；移動 provider 或移除 locale React key |
| catalog 有錯誤或未核准譯文 | 以狀態 gate 排除；回退英文 catalog／關閉繁中顯示，不需遷移 Hero |
| resolver 被 logic 誤用 | 限制 API 位於 presentation layer；測試 parser 輸入仍為 canonical；撤回該呼叫即可 |

## 6. 方案 B：執行時本地化投影／View Model

### 6.1 機制

保留 canonical 英文物件，集中式 localization layer 在 runtime 產生一份本地化 view model，component 主要讀取投影；任何儲存或規則運算仍應回到 canonical model。這是真正的雙模型邊界，不只是方案 A 的單欄位 resolver。

### 6.2 UI、規則文字與高風險名稱

- **UI 固定文字：** 仍需獨立 message catalog；view model 本身不能涵蓋 JSX 固定文字。
- **`description`、`effect`、section text：** projector 可集中替換顯示欄位，對複雜卡片與 Hero Sheet 較一致。
- **高風險 `name`：** view model 必須同時保留 `canonicalName`／canonical identity 與 `displayName`，或建立完全不同的 presentation type。若直接把 `name` 換成中文，現有 component 很容易把它傳回 logic。
- **`Language` 與 `Skill`：** view option 必須明確分開英文 `value` 與中文 `label`。由於現有 models 沒有 `Language`／`Skill` ID，投影層仍需外部 identity 映射，不能解決根本識別問題。
- **parser 與文字驅動 logic：** projector 必須在所有 logic 執行之後，或每個 view model 同時攜帶 canonical object。現有 component 常直接把 `props.sourcebooks` 傳入 `SourcebookLogic`、`FeatureLogic`、builder；若改傳投影，中文會進入 parser／名稱判斷。
- **搜尋、排序與衍生文字：** 可把 display text 與 message params 集中在 view model，但必須先對 canonical data 套 `SourcebookType` policy，index 命中後只回傳 canonical identity。純顯示排序可用 `displayName`，domain 排序仍用 canonical；完成英文句子不得成為投影 identity。這些額外 view 欄位與 mapping 也提高雙模型成本。

### 6.3 Hero lifecycle、切換與儲存

- **Hero creation／level-up／Hero Sheet：** command 必須只接受 canonical IDs、enum 與英文值，再由 projector 產生畫面。要安全達成，可能需把目前混合讀寫的 component 拆成 domain input 與 view input，修改面積大於方案 A。
- **安全切換：** 可在 locale 改變時重算 view model，不必重跑 `DataLoader`；但不可用 locale 替換 provider key 或 remount route。大量新 object identity 可能使 memo、selection 或 component local state 重設，需額外驗證。
- **working copy：** 最安全做法是 `HeroEditPage` 永遠編輯 canonical working copy，投影只供 render。若改成編輯 localized hero view，dirty diff、反向映射與儲存都會變得危險，應禁止。
- **LocalForage／Warehouse／匯入匯出：** projector 必須是單向且不可序列化；save／import／export API 只接受 canonical type。若缺乏強型別邊界，投影被誤存的風險高於方案 A。

### 6.4 `SourcebookType` policy、fallback 與一致性檢查

- **`SourcebookType` policy：** 必須在投影之前先依 `SourcebookType` 篩選 canonical Sourcebooks，並讓兩個 locale 共用；投影不能當安全邊界。
- **fallback：** projector 對缺漏欄位複製 canonical 英文；玩家範圍仍需 release gate，GM 可 fallback。
- **缺漏／多餘／失效／英文變更：** 若 projector 的輸入仍是旁掛 catalog，可以採用與 A 相同的 manifest、反向差集與 snapshot/hash。若投影規則散在 code，則難以完整盤點，應避免。
- **驗證附加項：** 必須驗證每個 view object 可追溯至唯一 canonical identity，且 projector 不修改輸入（deep-freeze／immutability test）。

### 6.5 測試、成本、更新與交付

- **測試：** 除 A 的所有測試外，增加 projector 純函式、輸入不變、canonical/view type 邊界、view object 重建後 selection 不變，以及禁止 view model 進入 save／logic 的測試。
- **修改面積與維護：** 可集中處理複雜顯示，但需要新的 view types、mapping 與大量 component 接線；現有 domain 與 presentation 交錯，使 V1 成本偏高。
- **上游更新：** 明確 projector 可吸收 model 變化，但每次新增欄位都需同步 view type／mapping；若漏掉欄位可能靜默顯示英文。
- **V1 逐步交付：** 可按頁導入，但 canonical component 與 projected component 會在過渡期並存，容易出現兩套呼叫契約。需要嚴格 vertical slice 邊界。

### 6.6 主要失敗模式與回復方式

| 失敗模式 | 保護／回復 |
|---|---|
| localized view 被傳入 `AbilityLogic` 或 builder | distinct types／API；測試阻擋；回退該頁至 canonical + inline resolver |
| localized hero 被儲存 | save API 只接受 canonical `Hero`；禁止 view 含完整可序列化 Hero；從既有英文存檔重開 |
| 切換重建 view 導致 selection／local state 消失 | 使用 canonical ID/value 與穩定 component key；若仍失敗，保留 canonical component 並改用方案 A |
| projector mapping 漏欄位 | manifest coverage + 英文 fallback；補 mapping，不改資料 |
| 雙模型維護負擔超出 V1 | 停止擴張 projector，保留已驗證的 presentation DTO，其他頁改用 A 的欄位 resolver |

## 7. 方案 C：Build-time 產生本地化資料產物

### 7.1 機制

英文資料仍為來源；build job 將 catalog 與 canonical data 結合，產生 zh-TW 顯示資料 chunk／artifact。為支援 runtime 一鍵切換，production bundle 必須同時保留英文 canonical data 與中文 artifact，或能在不中斷頁面狀態下 lazy load 中文 artifact。

### 7.2 UI、規則文字與高風險名稱

- **UI 固定文字：** 仍需 message catalog 或 build-time message bundle；生成規則資料不能處理所有 JSX 固定文字。
- **`description`、`effect`、section text：** build 可先驗證後生成完整中文顯示資料，缺漏較容易在 CI 阻擋。
- **高風險 `name`：** 若 artifact 沿用 canonical model 並把 `name` 改中文，就會偽裝成可供 logic 使用的 Sourcebook／Element，風險極高。較安全的 artifact 必須是 display-only schema，或同時保留 canonicalName；這會接近方案 B 的雙模型成本。
- **`Language` 與 `Skill`：** 不能把生成後中文名稱放入 `selected`、`related` 或 option value。artifact 仍需 canonical identity／英文 value 與中文 label 分離。
- **parser 與文字驅動 logic：** parser 必須只讀英文 bundle。若 component／builder 切到中文 artifact，`damage`、`Melee`、名稱 pattern 等會失效。要安全使用，必須在 build 產生 display-only overlay，runtime 再按 identity 套用；此時核心其實退化為方案 A。
- **搜尋、排序與衍生文字：** build 可預先產生 allowed Sourcebooks 的 display index 或 message template，但 runtime 命中仍須解析為 canonical identity，domain 排序仍不可使用中文。若 artifact 保存完成英文／中文句子而非 template + structured params，上游 drift 與插值正確性會更難驗證。

### 7.3 Hero lifecycle、切換與儲存

- **Hero creation／level-up／Hero Sheet：** canonical bundle 負責所有計算，artifact 只負責最後顯示。若以中文 Sourcebook 取代英文 Sourcebook，ID 雖相同，名稱字串型參照和 parser 仍會破壞。
- **安全切換：** 切換 artifact 不能重跑 `DataLoader` 或替換整個 app tree。若首次切換需 lazy load，載入中也要保留 route、working copy 和 dirty；離線 PWA cache 行為也需驗證。
- **working copy：** Hero 必須留在 canonical state；artifact 只能被 render 讀取。整套資料物件替換更容易改變 object identity 與 key，風險高於 A。
- **LocalForage／Warehouse／匯入匯出：** 只要 artifact 完全隔離，Hero schema 可不變；一旦生成物可被當成 canonical model 寫回，會污染兩個後端和 JSON。

### 7.4 `SourcebookType` policy、fallback 與一致性檢查

- **`SourcebookType` policy：** generator 輸入與 runtime canonical loader 都必須套同一 Official／Homebrew 保留、Community／Third Party 排除 policy；只讓 generator 處理部分 Sourcebooks 不能阻止英文 bundle 載入被排除內容。
- **fallback：** build 可對 V1 玩家 manifest 缺漏直接失敗；若允許 GM 部分缺漏，artifact 需帶 fallback 指示或 runtime 回到 canonical 英文。若整個 artifact 載入失敗，也必須無狀態損失地回到英文。
- **缺漏／多餘／失效／英文變更：** build pipeline 適合執行 manifest 差集、schema 驗證、ID／slot 存在性與 snapshot/hash；這是 C 的主要優點，也可獨立套用到 A。
- **產物驗證：** 必須檢查 artifact 沒有新增／刪除 ID、enum、引用或結構值，且輸出可重現；還要避免把未核准譯文打包。

### 7.5 測試、成本、更新與交付

- **測試：** 除 A 的行為測試外，增加 generator snapshot/schema、deterministic build、雙 bundle parity、lazy-load／offline fallback、bundle size 與 artifact 不可進入 logic／save 的檢查。
- **修改面積與維護：** 新增 generator、artifact schema、build integration、cache／chunk 策略與 runtime 選擇層；`package.json`／Vite／PWA 也可能受影響。對 V1 而言不是最小變更。
- **上游更新：** build 可早期暴露 drift，但 canonical model 或欄位變更同時影響 generator 與 runtime adapter；生成大物件也會增加 diff、cache 與 bundle 成本。
- **V1 逐步交付：** 未完成 catalog 時可只生成部分 overlay，但如果要求完整 localized Sourcebook，逐步交付困難。雙語一鍵切換又使「只發布中文 build」不可行。

### 7.6 主要失敗模式與回復方式

| 失敗模式 | 保護／回復 |
|---|---|
| 中文 artifact 被當成 canonical Sourcebook | 使用不同 schema／module boundary；若做不到則否決此變體，回到 A |
| generator 漏欄位或生成 stale 內容 | build fail + snapshot/hash；移除 artifact 並以英文 runtime fallback |
| lazy chunk／PWA cache 版本不一致 | versioned manifest、atomic deploy、cache smoke test；載入失敗維持現有 locale 與 state |
| bundle 明顯膨脹 | 實測 chunk size；改生成稀疏 overlay，而非整套複製；此時採 A 作核心 |
| build pipeline 阻礙上游更新 | generator 僅保留 validator／catalog 編譯功能，runtime 使用 A |

## 8. 明確不採用的方案

### 8.1 在 canonical model 加雙語欄位

例如在每個規則物件加入 `nameZh`、`descriptionZh`，會修改大量 models 與規則資料，讓 upstream merge、schema 與 Homebrew 相容性變差，也容易讓中文欄位滲入存檔。這違反「英文原始資料唯一基準」及本階段不得重構資料結構的限制，V1 不採用。

### 8.2 複製整套中文 sourcebooks 並切換資料集

即使保留相同 ID，`Language`／`Skill` 名稱、`related`、parser 字句、文字驅動分類與 component value 都可能改成中文；英文與中文兩套資料也會逐漸漂移。它不能可靠保證規則結果與存檔不變，V1 明確不採用。

### 8.3 以英文原文全文當翻譯 key／runtime 全域字串替換

同文異義、標點或上游微調會造成錯配，Markdown 與插值也難以治理；更可能改到 parser 需要的英文。只可把 canonical 英文作 fallback／變更快照，不作唯一 identity。

### 8.4 在切換時 reload app、重跑 `DataLoader` 或切 locale route

這會威脅 `HeroEditPage` working copy、dirty 與目前頁面，直接違反 V1。不論採 A、B、C 都禁止。

## 9. 比較表

### 9.1 質性比較

| 標準 | A：旁掛 catalog | B：runtime view model | C：build-time artifact |
|---|---|---|---|
| canonical／規則安全 | 高 | 中 | 低 |
| 存檔與交換相容性 | 高 | 中高 | 中 |
| 切換與 UI state 安全 | 高 | 中高 | 低 |
| UI、規則、搜尋與輸出涵蓋力 | 中高 | 高 | 中高 |
| 缺漏／漂移可驗證性 | 高 | 中高 | 高 |
| V1 逐步交付性 | 高 | 中 | 低 |
| 修改面積與維護成本 | 中高 | 低 | 低 |
| **整體 V1 適配度** | **高** | **中** | **低** |

評等反映目前 codebase，而非方案的通用優劣：A 的主要代價是顯示 call sites 與 field identity 治理；B 因現有 domain／view 交錯而扣分；C 因 runtime 雙資料、切換、bundle／cache 與 artifact 誤入 logic 的風險扣分。C 的 build validation 仍很有價值，但不必等同於 runtime localized dataset。

### 9.2 關鍵取捨摘要

| 問題 | A | B | C |
|---|---|---|---|
| 中文是否偽裝成 canonical model | 否 | 若型別不嚴格則可能 | 完整中文資料產物時風險最高 |
| 是否適合欄位級逐步導入 | 最適合 | 可行但雙契約較重 | 完整產物不利；稀疏 overlay 才可行 |
| 切換是否需要替換資料物件 | 不需要 | 通常需要重算 view | 通常要換／載入 artifact |
| 對 parser 的隔離 | resolver 只在 render，最直接 | 仰賴嚴格雙模型邊界 | 必須同時保留英文 bundle |
| 缺漏與 drift | catalog validator | 若底層用 catalog則同 A | build gate 最自然 |
| V1 主要風險 | call site 誤把 label 當 value | view 回流 logic／save；重構面積 | 雙資料漂移、bundle/cache、誤用 artifact |

## 10. 已核准技術方向

### 10.1 已核准的核心架構

**已核准採用方案 A：以穩定 element ID／受控欄位 identity 與 UI semantic key 建立獨立 catalog，並只在 presentation boundary 透過窄型 resolver 取得顯示文字；同時採用方案 C 的 build／test-time catalog 驗證能力，但不產生可被當作 canonical Sourcebook 使用的中文資料集。**

此核心技術方向已由 Reviewer 審查並由專案負責人核准。下列理由不代表第 10.2～10.4 節的可替換實作細節已核定：

1. canonical sourcebooks、Hero 與 parser 輸入完全不變；resolver 不需要生成一份看似 canonical 的中文物件。
2. `AbilityLogic`、`HeroSheetBuilder`、`SheetFormatter` 可繼續只讀英文，因此中文不會進入文字解析或規則判斷。
3. locale 與 catalog 不屬於 Hero，LocalForage、Warehouse、匯入／匯出 schema 可保持不變。
4. 切換只更新顯示 context，不需要重跑 `DataLoader`、換 route 或重建 `HeroEditPage` working copy。
5. `SourcebookType` policy、presentation search index 與 canonical identity 可明確分層；中文搜尋／排序不需要改寫規則物件或 Hero value。
6. catalog 與 message templates 可允許英文 fallback 及欄位級增量覆蓋，適合逐步翻譯；同時以 V1 玩家 manifest 在發布前阻擋缺漏。
7. 修改集中在 presentation 呼叫點及少量基礎設施，不要求重寫現有 domain models、builder、parser 或 storage，不構成與 V1 無關的大型重構。

### 10.2 可替換的實作細節

下列細節可在不改變核心架構下替換：

- catalog 使用 TypeScript module、JSON 或其他可驗證的靜態格式。
- UI messages 與 rule translations 是否分 namespace／檔案。
- canonical 英文更新使用完整 snapshot、hash，或兩者並存。
- resolver 是函式、hook 或薄 component；前提是只能用於 presentation。
- locale preference 放入既有 `Options` 或獨立 app preference key；前提是不進入 Hero／sourcebook 且切換不重載。
- validator 在 test、獨立 script 或 CI 執行；前提是能檢查必要 manifest、stale identity 與原文變更。

### 10.3 尚未決定的 library 選擇

本文件不建議或核定任何 library，也不安裝 dependency。現有 React 19／Vite 8 專案可先用 prototype 驗證所需 API，再比較：

- UI message formatting 是否需要 ICU plural／select。
- type-safe keys、missing-key hooks、bundle splitting 與 React 19 相容性。
- library 是否會造成 provider remount、額外資料載入或過度 bundle 成本。

規則 catalog 的 identity／drift validator 即使日後選用通用 i18n library，仍可能需要專案專屬薄層；不應讓 library 決定 canonical data 邊界。

### 10.4 後續驗證邊界

第一個最小 prototype 的唯一必要驗證範圍以第 12.1 節為準。

搜尋索引、搜尋語言政策、純顯示排序、`SourcebookType` policy 完整端到端實作、locale preference 完整持久化、Hero Sheet 全面驗證、Warehouse、PWA／cache，以及無 ID 資料 identity，依第 12.2 與第 13 節分批處理，不阻擋第一個最小 prototype。

上述技術事項應優先由 prototype 或實作證據解決；只有符合第 13.2 節條件的真正產品或流程取捨，才交由專案負責人裁定。

## 11. 已核准安全條件與建議性工程控制

### 11.1 已核准的不可變安全條件

以下條件直接保護已核准的 V1 技術方向，不得由 prototype 或工程替代方案放寬：

1. 英文 canonical data 是唯一規則基準。
2. 中文不得進入 parser、規則計算、identity、ID、enum、selected value、引用或存檔。
3. Hero schema、匯入／匯出格式及既有存檔相容性不得改變。
4. 中文只在 presentation boundary 顯示。
5. 語言切換不得重跑 `DataLoader`、切換 route、remount 編輯頁或遺失 working copy／`dirty`。
6. 繁中與英文使用相同的 `SourcebookType` policy：保留 Official／Homebrew，排除 Community／Third Party。
7. 中文搜尋或 label 最終必須回到 canonical ID／英文 value。
8. 動態組合文字先以 canonical／structured data 完成規則結果，再於顯示層組句。
9. 缺漏中文時使用英文 fallback；V1 玩家必要內容發布前缺漏歸零。
10. 正式中文只能由專案負責人核准。
11. prototype 通過前不得全面展開中文化。

### 11.2 建議性工程控制

下列做法是目前建議的風險控制方式，可由 prototype 證明效果相同的較小或較簡單方案替代，不視為專案負責人已核准的唯一實作。

- **resolver API：** 維持窄型、presentation-only 的 resolver；不得提供會深層翻譯整個 Sourcebook／Hero 的 API。
- **catalog identity 與 metadata：** 優先使用穩定 element ID、受控欄位／slot identity、canonical snapshot 或 hash、核准狀態與備註；具體欄位與格式可由 prototype 替換。
- **validator：** 可在 test、獨立 script 或 CI 執行 required-but-missing、catalog-but-stale、失效 ID／field slot、重複 key 與英文原文變更檢查；具體檔案位置與執行方式不固定。
- **搜尋索引工程：** 先套用既定 `SourcebookType` policy，再讓 display text 命中回傳 canonical identity；搜尋語言與純顯示排序仍依第 13.2 節的產品取捨處理。
- **衍生文字測試：** 以穩定 message key、template、structured params、插值／Markdown／規則 token 保留測試驗證顯示結果；不得以完整 runtime 英文句子作唯一 identity。
- **schema 與 value／label 測試：** 以測試確認 locale、displayName、翻譯 metadata 不進 Hero，中文 label 不取代英文 value，切換前後 Hero JSON 與 canonical identity 不變。
- **切換與回復測試：** 驗證 `HeroEditPage`、route、working copy／`dirty` 與資料載入狀態在切換時保持；若 catalog 或 resolver 發生事故，建議能無 migration 地回退英文顯示。
- **presentation-only code review：** 對每個 resolver call 檢查回傳值是否只進 JSX／可見輸出；若流入 logic、sort identity、selected value 或 storage，應退回該實作。
- **逐頁驗收：** 每個後續 vertical slice 可依實際風險驗證繁中→英文→繁中、數值／JSON 不變、fallback、Sourcebook boundary 及必要的窄畫面狀態；驗收形式可縮小但不得放寬 11.1 的條件。

## 12. 最小驗證性 prototype 建議

此節只定義後續 prototype 計畫，不在本任務實作。

### 12.1 第一個最小 prototype

第一個 prototype 只驗證下列行為。候選規則 element 可用 `src/data/ability-data.ts` 的 `free-melee`，但這只是候選案例，不是已核准的唯一選擇；顯示文字必須是專案負責人提供的核准測試字串或明確 sentinel，不在 prototype 自行定稿翻譯。

1. 一個 UI 固定文字能依 locale 切換。
2. 一個有穩定 ID 的規則顯示欄位能由旁掛 catalog 顯示中文。
3. 一個代表性的 derived／composed message 能使用穩定 key、template 與 structured params。
4. 繁中→英文→繁中切換不重跑 `DataLoader`、不 remount `HeroEditPage`，並保留 route、working copy 與 `dirty`。
5. canonical ID、value、規則結果及 Hero JSON 在切換前後不變。
6. 缺少中文時顯示 canonical 英文 fallback。
7. 只新增直接驗證上述行為的必要測試。

### 12.2 後續批次驗證

下列工作仍屬後續 V1／V1.1 驗證或發布要求，不阻擋第一個最小 prototype，也不因此改變 V1 需求：

- 搜尋索引與搜尋語言政策。
- localized label 排序。
- `SourcebookType` policy 的完整端到端實作。
- Warehouse 完整驗證與完整流程。
- 舊 JSON 匯入／匯出完整相容性。
- 所有 Hero creation 與 level-up flow。
- 全面 Hero Sheet 驗證。
- PDF、PNG、列印與完整中文排版。
- PWA／offline／lazy-load 行為。
- 完整玩家內容 manifest 與發布 gate。

### 12.3 預期修改位置（僅供後續實作估算）

- app-level locale provider：`src/index.tsx` 附近，但位於 `DataLoader` 一次性載入流程之外，不以 locale 重建 `DataManagerProvider`。
- locale preference：`src/models/options.ts`／`src/logic/factory-logic.ts:createOptions()`／`src/logic/update/update-logic.ts:updateOptions()`／`src/services/data-service.ts`，或經評估後使用獨立 preference key。
- 切換入口：代表性全域 component，例如 `src/components/panels/app-header/` 或設定 modal。
- presentation resolver 與 prototype catalog：新增獨立 localization module；不修改 `src/data/` canonical rule records。
- 規則顯示 call site：選一個直接呈現 element `name`／`description`／section 的 component。
- 驗證：對應 component/integration tests，以及 catalog identity validator test。

### 12.4 後續 V1 驗收參考

下列項目保留作為後續 V1 工作的驗收參考，不是第一個最小 prototype 的必要 gate：

- 預設 locale、切換控制、URL、working copy 與 `dirty` 的完整持久化與狀態驗證。
- `HeroEditPage` 不 remount、`DataLoader.loadData()` 不重跑，以及高風險 element 的 canonical name、ID、section、selected value 與 parser input 不變。
- LocalForage、Warehouse、舊版 JSON 匯入／匯出與既有 Hero schema 相容性。
- 兩種 locale 的完整 `SourcebookType` policy、excluded Sourcebooks、搜尋索引與純顯示排序行為。
- 所有 Hero creation、level-up、Hero Sheet、PDF、PNG、列印與窄畫面驗證。
- V1 玩家內容 manifest、缺漏檢查、發布 gate，以及既有 lint、typecheck、test、build。

### 12.5 Prototype 否決條件

若要通過 prototype 必須翻譯／複製整個 Sourcebook、修改 Hero schema、讓 parser 接收中文、重跑 DataLoader，或 remount 編輯頁，則方案 A 的該實作方式應被否決並重新設計；不得以資料 migration 或放寬 V1 條件補救。

## 13. 未驗證事項與延後決策

### 13.1 由 prototype 或實作證據解決

以下屬技術驗證事項，不要求專案負責人現在裁定。Agent 應優先提出最小且可測試的做法。

1. **無 ID 資料 identity：** `Language`、`Skill` 及無 ID 巢狀 sections 的穩定 catalog key／slot 規則。
2. **builder／formatter 顯示邊界：** 哪些欄位可在 builder 後 resolver，哪些仍被 formatter 用於分類；以及 derived／composed message 如何提供 message key + structured params。
3. **locale preference 儲存位置：** 擴充既有 `Options` 或使用獨立 LocalForage key，何者對舊 options migration、provider 穩定性與測試最小。
4. **i18n library 是否必要：** 是否需要 ICU、rich text、typed keys、namespace lazy loading，以及是否造成 provider remount、額外資料載入或過度 bundle 成本。
5. **`SourcebookType` policy 的最小攔截位置：** built-in Sourcebook loading、Homebrew 讀取／合併、匯入、搜尋、隨機與既存 Hero 參照之間，哪個最小共同邊界能滿足既定 Official／Homebrew 保留、Community／Third Party 排除 policy。
6. **Warehouse 測試方法：** 如何在不影響正式資料的環境驗證 locale 不進遠端 Hero schema，以及完整流程的驗證方式。
7. **PWA／cache 行為：** 若後續採用 catalog chunk 或 lazy-load，首次載入、更新後切換與離線狀態的 cache 行為。

### 13.2 實際進入功能實作時才交由專案負責人裁定

只有相應功能已進入實作、現有需求無法決定，且技術證據無法代替產品選擇時，才交由專案負責人裁定。

1. **搜尋語言：** V1 搜尋只查目前 locale，或同時支援中英。
2. **純顯示排序：** 中文模式的 presentation-only 清單使用 canonical 英文順序或中文 label 排序；影響規則／identity 的排序不在此選項內。
3. **正式翻譯核准 metadata 流程：** 核准者、狀態轉移、原文變更後狀態與備註欄位的正式流程形式。

### 13.3 延後至後續 V1／V1.1

以下不屬於第一個最小 prototype 的完整驗證，保留至實際 V1 批次或 V1.1：

- Warehouse 完整流程。
- PWA lazy-load 的完整流程與發布後 cache 驗證。
- PDF／圖片／列印排版與輸出驗證。
- 完整玩家 manifest 與發布 gate。
- 全面 Hero Sheet 與所有 Hero creation／level-up flow。

## 14. 暫緩至 V1.1 的事項

- PDF 與圖片匯出的完整中文排版、DPI、分頁與字型最佳化；V1 只做最低 smoke test，並記錄限制。
- 全面列印 CSS、所有卡片寬度、uppercase、長字串及極端窄畫面的視覺回歸；V1 先保障主要玩家流程可用。
- 圖片資產內嵌英文的全面替換策略。
- RTL、多語言擴充、SEO locale route、TMS、機器翻譯與多 locale lazy-loading 架構；V1 只有繁中與英文，且不得自動翻譯正式內容。
- 為一般化 localization 而重構所有 domain／view models；只有 prototype 證明必要且直接服務 V1 的窄邊界才可另案評估。
- 上游持續同步自動化；V1 已凍結原版基準，僅保留 catalog drift 檢查所需能力。

---

**結論：** 方案 A 作為 V1 runtime 核心、搭配方案 C 的 build／test-time catalog 驗證能力，已由 Reviewer 審查並由專案負責人核准。方案 B 與完整中文資料產物不作為 V1 核心方案。下一步是完成第 12 節的最小 prototype；prototype 通過前不得全面展開中文化實作，也不得放寬英文 canonical data 不變、中文不進入 parser、存檔格式相容及語言切換不破壞頁面與未儲存狀態等既定條件。
