# Forge Steel 中文化前 codebase 盤點

- 文件分類：稽核／歷史
- 文件用途：記錄指定基準 commit 的 codebase 現況、資料邊界與風險證據
- 文件效力：不是需求、產品決策或實作規格
- 盤點基準：`93931b420669b05bb1117c9a9aadbf950753afd2`
- 現行需求：`docs/requirements/V1-REQUIREMENTS.md`
- 現行技術方向：`docs/analysis/LOCALIZATION-TECHNICAL-OPTIONS.md`

**文件效力說明：** 本文件只描述盤點基準時的程式現況。文件中的推論、建議或待確認事項不是正式決策；若與後續已批准需求或技術方向不同，以後者為準。

基準：`develop` 的 `93931b420669b05bb1117c9a9aadbf950753afd2`（`chore: establish repository baseline (#1)`）；僅閱讀原始碼，未提取或統計英文清單。此 commit 直接承接 V1 upstream baseline `267ca1a10dcab32a700089fc65dd212dc81f880a`，差異只有 bootstrap 文件與 CI 調整，未帶入上游功能／內容更新。

## 1. 玩家文字

- 介面：`src/components/` 的 `pages/`、`panels/`、`modals/`、`controls/` 與 `main/main.tsx`；文案多直接寫在 JSX 的文字、`label`、`title`、`placeholder`、通知。
- 規則內容：`src/data/` 的共用資料、`data/classes/` 職業、`data/sourcebooks/` 來源書；輸出文字在 `logic/hero-sheet/`、`logic/classic-sheet/` 與 `panels/classic-sheet/`。

## 2. 官方內容

啟動時 `data/sourcebook-data.ts:loadAll()` 動態匯入並快取 Core、Orden、Beastheart、Summoner 來源書，再由 `SourcebookLogic.getSourcebooks()` 與使用者來源書合併。Core 引用共用資料池；其餘三者引用各自職業、祖源、怪物、語言或物品。

## 3. Community、Third Party、Patreon、Playtest、Homebrew

- Community 與 `data/sourcebooks/third-party/` 都在固定匯入清單，預設載入；`communityPrerelease`、`ageOfSecrets` 是額外的本機 feature flag。
- `official/patreon.ts` 是 Playtest 來源書，僅在 `FeatureFlags.playtest` 啟用時匯入；旗標存於 `localStorage.feature_flag_codes`，`FeatureFlags.clear()` 可清除。
- Patreon Warehouse 是儲存後端：`DataLoader` 驗證 Patreon 後設 `usePatreonWarehouse`，`StorageServiceFactory` 選 `WarehouseService`，否則 `LocalService`；它不是另一份內建內容。
- **已確認：** Homebrew 由 `DataService.getHomebrew()` 從 LocalForage 或 Warehouse 讀取（本機鍵 `forgesteel-homebrew-settings`），再與內建來源合併。
- **現行產品決策：** 保留 Official 與 Homebrew，排除 Community 與 Third Party。

來源書「隱藏」只儲存 ID（`forgesteel-hidden-setting-ids`）供部分列表篩選，不會阻止載入或清除角色參照。目前沒有完整全域停用開關；這是現況證據，不在本文件核定具體攔截架構。既存資料仍不得刪除或修改。

**已確認的 codebase 行為：** `Main.newHero()` 使用 `SourcebookType.Official`；這符合現行產品決策。Patreon／Playtest 是否出現仍取決於原版 feature flag 是否載入該 Official sourcebook。

現行技術方向要求來源政策獨立於 locale，並依 `SourcebookType` 保留 Official／Homebrew、排除 Community／Third Party。

## 4. 通常為純顯示的文字

`description`、Markdown `effect`／文字 section、能力 `target`／`trigger`／`time`／`qualifiers`、來源書描述與 modal 按鈕文案通常直接呈現；例如 `official/orden.ts` 的語言描述與 `official/beastheart.ts` 的物品敘述。`name` 雖常被顯示，卻是高風險欄位：必須逐類型確認是否同時作為查找鍵、參照值、排序、CSS class 或存檔值，不能概括視為可直接翻譯。

## 5. 不可直接翻譯的高風險類型

- **ID／存檔鍵：** `Element.id`、`Hero.id`、`sourcebookIDs`、`selectedIDs`、匯入 JSON 與 `SourcebookLogic.getElement()` 用 ID 關聯；`AbilityLogic` 對 `grab`、`knockback`、`null-1-8` 有特例。
- **enum／結構值：** `FeatureType`、`SourcebookType`、規則 enum，及 section `type: 'text' | 'field' | 'roll'`、`'build' | 'respite' | 'play'`，均為程式或存檔值。
- **名稱作為鍵：** 語言／技能選擇存字串，`HeroLogic.getLanguages()` 以 `l.name === name` 查找；Orden `related` 也引用語言名稱。
- **英文 parser：** `logic/ability-logic.ts` 解析 `damage`／`dmg`、`Might`、potency、`equal to your level` 等句式並計算；`logic/format-logic.ts` 解析骰子與數值。
- **文字驅動判斷：** `logic/hero-sheet/hero-sheet-builder.ts` 以 `Augmentation`、`Ward`、`Prayer of`、`Enchantment of` 分類；`logic/classic-sheet/sheet-formatter.ts` 以 `Melee`／`Ranged`／`Self`、trigger 字首選圖示或排序。`utils/utils.ts`、角色建立各 section 與 `logic/monster-logic.ts` 以英文空白分詞／小寫搜尋；多個 classic-sheet 元件再以名稱／enum 產生 CSS class。中文會使英文詞數估計失真。

## 6. 角色建立、升級、儲存與重新開啟

`Main.newHero()` 呼叫 `FactoryLogic.createHero()`，加入 Official `sourcebookIDs`，先儲存再進建立頁。`HeroEditPage` deep copy 後修改祖源、文化、職業與選項，交 `Main.saveHero()`。`DataManager → DataService → StorageService` 寫入 LocalForage 或 Warehouse；匯入及重新開啟時，以 `HeroUpdateLogic.updateHero()` 更新。角色表由 `HeroSheetBuilder`／Classic Sheet builder 導出，PDF／圖片擷取其 DOM。`DataLoader` 重開時平行載入來源書、heroes、options、session、隱藏 ID，再建 React context。

升級入口在 `components/modals/hero-resources/hero-resources-modal.tsx` 的 `HeroLevelUpModal`；它先以 `HeroLogic.canLevelUp()` 檢查 XP／最高等級，接著 `HeroLogic.setLevel()` 改 class level、XP，並同步 Companion、Retainer、Summon／SummonChoice 的等級。Modal 用 `FeatureLogic.getFeaturesFromClass()` 取得新等級 features，經 `FeatureConfigPanel` 完成必選項才接受。`HeroEditPage` 的 class section 亦可改等級，並以同一 `setLevel()` 更新 working copy；已解鎖的 class／subclass choices 以 `featuresByLevel` 和 sourcebooks 重新計算。此流程依賴 feature ID／enum、來源書查找及上述英文名稱／parser 高風險點。

## 7. 既有 i18n

沒有 i18n 資源檔、翻譯函式或 UI 語言設定。`Language`／`LanguageType` 是遊戲內角色語言。僅有 `localeCompare` 與 Patreon 日期硬編碼 `en-US`，不構成 locale 機制。

## 8. 中英切換的主要範圍

會涉及 `components/` JSX、`data/` 內容欄位、`ability-logic.ts`、`classic-sheet/`、`hero-sheet/`，以及 models、儲存、匯入匯出相容性。**已確認的高風險：** 部分英文文字參與 parser、分類、查找或存檔值，不能直接替換成中文。已核准方向要求 canonical 值保持英文，中文只在 presentation boundary 顯示。可供評估的既有設定持久化位置包括 `Options`／`DataManagerProvider` 與 `DataService` 的 LocalForage `forgesteel-options`；`index.tsx` 的 app-level `DataLoader → DataManagerProvider → Main` 是確認切換不重載角色資料的關鍵。路由由 `HashRouter`／`hooks/use-navigation.ts` 管理；`HeroEditPage` 的 local working copy／`dirty` state 必須在切換時保留。須確認切換不呼叫 `DataLoader.loadData()`、不重建 hero，並讓繁中與英文模式均使用相同的 type policy：保留 Official／Homebrew，排除 Community／Third Party。

## 9. 字型與輸出風險

`index.scss` 僅內嵌 PT Sans、Merriweather、Roboto Slab、Draw Steel Glyphs，未見保證繁中字形的字型；Classic Sheet 可能 fallback 或缺字。固定字級、卡片／欄寬、`overflow`、`uppercase` 也可能令中文溢位。PDF／圖片經 `modern-screenshot`／`html2canvas` 轉 PNG，再交 jsPDF；須驗證字型載入、glyph、DPI、分頁與列印 CSS。若圖片資產內嵌英文，則不會隨語言切換。V1 可做最低 smoke test；完整排版最佳化列為 V1.1／已知限制調查，不阻擋下一階段。

## 10. 後續使用方式

- 本文件只作為中文化實作時的 codebase 地圖與高風險位置索引。
- 已核准的中文化架構、保護措施與最小 prototype 範圍，以 `docs/analysis/LOCALIZATION-TECHNICAL-OPTIONS.md` 為準。
- 除非 prototype 發現新的重大證據，不再進行全 codebase 盤點，也不建立完整英文清單。
- 實作時只針對當前 vertical slice 驗證相關欄位、parser、存檔與顯示邊界。
