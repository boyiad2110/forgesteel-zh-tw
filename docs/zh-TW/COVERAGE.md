# 玩家旅程顯示覆蓋與 P3 前置盤點

2026-10-10 維護順序 4。依本機顯示接線、既有核准決策與測試盤點；上游 `5968ff54` 同步版本的回歸結果另見 [PROGRESS.md](PROGRESS.md)。這份表不是逐條譯文審校或瀏覽器驗收結果，也不以 mapping／Forge Steel 版／英文例外總數當作產品完成率。

Master Sheet 的 **Forge Steel UI** 分頁已有 166 筆由 Marc 定稿的 APPROVED 譯文（UI-01 151 筆、UI-03 15 筆），涵蓋共用介面、建角與角色摘要；快照與顯示層已接入。UI-01／UI-02 完整驗證與瀏覽器回歸通過；UI-03／DISPLAY-03 的文化頁、建角頁及角色摘要經 Marc 人工驗收，PR #59 的 CI 尚有測試基準與瀏覽器回歸待修。Project State 仍有 Career 411 筆 NEW。剩餘文化 Field 覆蓋與龍鱗動態描述分開列在 DISPLAY-03。

## 狀態定義

- **已完成**：該位置已接既有核准對照；只涵蓋表內指定內容。
- **刻意延後**：已有決策保留英文，仍是待完成範圍。
- **缺核准譯文**：Master Sheet 尚無可匯入的核准來源。
- **尚未接線**：已有核准來源，但該位置未使用對應顯示助手。
- **動態顯示未支援**：尚無可靠對應／綁定，保留完整計算後英文；英文備援不算中文化完成。
- **不適用**：該類內容不經過該旅程位置。

## 六個旅程位置

表中路徑均相對於 `src/components/`；細項與共用助手見後文。

| 內容 | 建角候選 | 已選值 | 右側摘要 | 英雄總覽 | 詳情 | 經典表格 |
|---|---|---|---|---|---|---|
| 官方族裔名稱／核准描述 | 已完成：`hero-edit/ancestry-section` → `AncestryPanel` | 已完成：已選族裔卡；昔日族裔下拉 | 刻意延後：Choices 共用 UI；昔日族裔下拉值已完成 | 已完成：`hero/choices` 一般／精簡名稱值 | 已完成：`elements/ancestry-panel` | 已完成：`classic-sheet/hero-header-card`、昔日族裔特性值 |
| 族裔特性名稱／核准描述 | 已完成：`feature-data/choice`／`ancestry-feature-choice` 選項 | 已完成：候選收合名稱、已選 `FeaturePanel` | DISPLAY-02：建角 ancestry `FeatureConfigPanel` 的核准標題／描述已接；動態句型無核准綁定者仍英文。其他共用標題／提示待 UI 核准來源 | 已完成：`hero/features` 一般／精簡 | 已完成：`elements/feature-panel` | 已完成：`classic-sheet/components/feature-component` 核准族裔內容 |
| 官方文化名稱／三面向摘要 | 已完成：27 個官方文化卡 | 已完成：已選 `CulturePanel` | 名稱值已完成：DISPLAY-01 接上自訂文化三面向 Field；官方摘要依 DISPLAY-01 使用中文標點。Bespoke Culture 已選 Field 描述仍待預覽／接線 | 已完成：`hero/choices` 文化與三面向名稱值 | 已完成：`elements/culture-panel`、面向 `FeaturePanel`；DISPLAY-01 的官方三面向摘要改用中文標點 | 已完成：`classic-sheet/culture-card` |
| 語言名稱 | 已完成：語言選擇抽屜 | 已完成：`feature-data/language-choice` | 已完成：Language Field 的名稱值；標籤刻意延後 | 已完成：`hero/sidebar` | 已完成：文化／語言特性名稱值；描述刻意延後 | 已完成：`culture-card`／`feature-component`／隨從卡 |
| 技能名稱／類別 | 已完成：技能抽屜名稱／類別 | 已完成：`feature-data/skill-choice` | 已完成：Skill Field 名稱值；標籤刻意延後 | 已完成：`hero/sidebar`；組合分組標題刻意延後 | 已完成：技能名稱／類別；描述刻意延後 | 已完成：`skills-card`／`feature-component`／隨從與同伴卡 |
| 條件名稱／規則、條件免疫值 | 不適用：不是獨立建角候選步驟 | 已完成：已選特性詳情中的條件免疫值 | 刻意延後：共用 UI；不可由詳情完成推論所有摘要完成 | 已完成：`hero/sidebar` 條件及免疫一般／精簡 | 已完成：`condition-panel`、`feature-data/condition-immunity` | 已完成：`conditions-card` 名稱與 `feature-component` 免疫值；標籤刻意延後 |
| 五個屬性名稱 | 刻意延後：建角陣列／程式組句另屬 P3 清冊 | 刻意延後：建角陣列／程式組句 | 刻意延後：Characteristic 等標籤 | 已完成：`hero/stats` | 已完成：`roll-modal` 已接屬性名稱 | 已完成：`stats-resources-card`／`characteristics-component` |
| 基本動作／族裔招式名稱與核准段落 | 已完成：已接候選共用招式卡；非核准段落見下表 | 已完成：已接 `AbilityPanel` | 刻意延後：共用選擇提示／類型標籤 | 已完成：`hero/abilities` 名稱、sidebar Triggers 名稱 | 已完成：`elements/ability-panel` 核准 description／section | 已完成：`ability-card` 核准名稱／description／section；tier 等未完成 |
| 生涯、職業、套組、領域、專長及其他內容 | 刻意延後 P4／缺核准譯文 | 刻意延後 P4／缺核准譯文 | 刻意延後 P4／缺核准譯文 | 刻意延後 P4／缺核准譯文 | 刻意延後 P4／缺核准譯文 | 刻意延後 P4／缺核准譯文 |
| UI 標籤、分頁、提示、按鈕、組合句 | UI-01 的 151 筆已核准並接線；瀏覽器回歸與 Marc 人工驗收通過 | 僅涵蓋清冊所列建角共用 UI；其他位置待盤點 | 僅涵蓋清冊所列建角共用 UI；其他位置待盤點 | 其他位置待盤點 | 其他位置待盤點 | 其他位置待盤點 |

### 具體接點與範圍限制

| 接點／內容 | 狀態與證據 | 限制／下一個動作 |
|---|---|---|
| 建角自訂文化三面向 Field | DISPLAY-01：`pages/heroes/hero-edit/culture-section/culture-section.tsx` 的三個名稱改用 `PlayerName`；DISPLAY-02 為 ancestry／culture Choice 接上核准名稱與描述。Bespoke Culture 中已選面向的 Field 內嵌描述不是該 `FeatureConfigPanel` 接點，仍待 DISPLAY-03 預覽／接線 | Marc 已驗收 DISPLAY-02 的核准選項卡位置；Field 描述尚未驗收／實作。改名、自訂、Homebrew、未知內容須保留原值 |
| 建角共用 Choices 標題／描述 | `panels/feature-config-panel/feature-config-panel.tsx` 的 HeaderText／Markdown 未提供 scope；建角 ancestry／culture section 外層也未提供 scope | Purchased Traits、Language、Choose… 等為 P3；若存在核准資料鍵，另標尚未接線，不能把整欄都稱已完成或都稱缺譯文 |
| 英雄總覽資料值與 UI 標籤 | `panels/hero/choices/choices-panel.tsx` 已用 `PlayerName` 顯示族裔、昔日族裔、文化、三面向 | Ancestry／Culture／Environment 等 UI 標籤仍英文；與建角右側 Field 是不同位置 |
| 玩家名稱保護 | `src/l10n/player-name.tsx`、`element-scope.tsx` | 官方原 ID 與原名吻合才換字；改名、自訂、Homebrew、未知內容保留。高等／幻林精靈族裔與文化各用自己的鍵 |
| 官方文化摘要 | `src/l10n/player-culture-summary.ts`；DISPLAY-01 只在既有官方 ID、原名稱／描述、三面向及摘要格式保護條件吻合時輸出核准三面向中文名稱與「、」「。」 | 英文仍用來源原文；自訂自由描述、改名、Homebrew、未知或不吻合格式保留原值；不影響自訂文化名稱、資料、搜尋、存檔或分享碼 |
| 語言／技能 | `src/l10n/language-text.ts`、`skill-text.ts`；`lookup.test.ts` 相關測試 | 核准名稱及技能類別已接；描述、語言類型、組合分組／擲骰說明仍延後。搜尋排序、編輯器值保持英文 |
| 已核准動態段落 | `calculation-bindings.json`、`calculated-text.ts`；`lookup.test.ts` 的命定末視、Glowing Eyes、Grab／Knockback、跨等級／力量遍歷測試 | 已支援核准位置與句型；上游計算值投射到核准中文，不另算數字；未知改寫完整英文備援 |
| 招式 tier、距離、目標、觸發句 | `src/l10n/ability-text.ts` 對非 text section 不建鍵；既有 DECISIONS 記錄延後 | 刻意延後＋動態顯示未支援／缺核准譯文；需先盤點上游組句與解析用途，不先翻資料 |
| 招式關鍵字與類型標籤 | AbilityPanel／AbilityCard 與選擇抽屜仍使用原值 | 刻意延後 P3 或獨立關鍵字批；現有 Glossary 不是全部關鍵字的專用核准來源 |
| Glowing Eyes／Glamor of Terror description；Escape Grab／Grab／Knockback 非效果段 | `ability-text.ts`、`lookup.test.ts` 的單版限制回歸；DECISIONS 選規則 section | 刻意延後：同 Sheet 列只有一個 Forge Steel 版；不可由 section 完成推論 description 完成。結構方案見 [P4-STRUCTURE.md](P4-STRUCTURE.md) |
| Forge Steel 改寫且未核准的招式段 | DECISIONS 記錄 Draconian Guard、Remember your Oath 等未採用段落 | 刻意延後／缺核准譯文；不自行刪字拼句。職業、套組、領域、專長招式不在目前 `ability-text.ts` 收集範圍 |
| 經典表格 UI 與特殊名稱 | `primary-reference-card`／`reference-cards`、Melee Free Strike／Ranged Free Strike 等程式字串 | 刻意延後；表格資料、排序與排版估算保留英文，須另外驗證實際正體中文版面 |

## P3 前置條件與下一批

1. **核准來源**：UI-01 的 151 筆都有穩定 UI ID、來源位置與來源雜湊，且已由 Marc 定稿為 APPROVED；本分支只納入核准列。
2. **快照與匯出**：UI-02 已把 Forge Steel UI 納入同次擷取、`ui.csv`、`ui.json`、`mapping.ts` 與來源／過期守門；完整隔離驗證通過。
3. **下一批可獨立處理**：建角自訂文化 Field 已核准值補線；先列三面向原值／對照與顯示位置，沿用 `PlayerName`／`ElementScope`，不等待 UI 標籤才能核對，也不在此維護批次先實作。
4. **P3 第一批進行中**：UI-01 已將玩家建角導覽、七個主分頁、Choices／SelectionBox、語言／技能共用提示、來源書／擴充與細節頁接入同批清冊。動態數量依核准模板投射，模板不符時保留完整英文；部分原句只核准片段，其他片段仍保持英文。
5. **後續內容**：生涯 411 NEW 待翻譯／QA，職業與招式先依 P4 結構方案處理多來源依賴及多用途限制。GM 工具、怪物詳情／列印維持另批。

待辦與下一個動作集中於 [TODO.md](TODO.md)；本文件只維護覆蓋證據與限制。

## 可重複瀏覽器驗證清單

本輪 browser-smoke 已執行子集：歐克候選→已選→儲存後總覽、英／正體中文切換、經典表格頁首核准名稱與列印 media 水平溢出、獨立掛載擒抱元件的力量 2→3 及計算開關；結果見 [PROGRESS](PROGRESS.md)。以下是完整後續操作清單，其餘項目未於本輪執行；不截圖、不錄影。每次記錄程式版本、資料版本、實際結果與未執行項目，搭配既有純函式／靜態渲染測試。

- 英文切正體中文再切回；已選內容維持，頁面與詳情名稱同步。
- 還魂屍 Former Life 下拉：候選、收合已選值、英雄總覽、詳情、經典表格一致；自訂／改名／未知值保留。
- 族裔特性：候選、已選卡、一般／精簡總覽、巢狀特性詳情與經典表格一致。
- 官方文化卡三面向摘要；自訂文化依序選三面向，分別記錄已選卡與右側 Field 的預期英文／中文狀態，避免把延後位置誤判完成。
- 語言／技能：抽屜候選、已選值、側欄與經典表格一致；搜尋、排序及資料仍使用原英文。
- 條件免疫：詳情、英雄側欄一般／精簡、經典表格值一致；自訂條件保留；上游新增條件解析行為不被中文化覆蓋。
- 動態段落：命定末視復元值變化、Grab／Knockback 力量變化、Glowing Eyes 等級變化；開關計算、語言切換、未知改寫英文備援與資料不變。
- 經典表格：實際列印預覽檢查頁首、文化／特性／招式卡的截斷、重疊、溢出與分頁；不以英文高度估算或靜態渲染測試當作版面通過證據。
