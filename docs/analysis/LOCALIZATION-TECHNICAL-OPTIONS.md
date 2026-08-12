# Forge Steel 繁體中文化技術方案比較與現行技術方向

- 文件分類：現行權威（核心架構與安全邊界）＋歷史方案比較
- 初始核准日期：2026-08-06
- 最近對齊日期：2026-08-12
- 核准者：專案負責人
- 原始分析基準：`34890a3b420d3067caa91474c9ca52afc5e39c4d`
- 現行實作 evidence baseline：`develop` @ `712d45cebc3e654ec69f75b1a91d3b9d04afef82`（PR #55 後）
- 需求依據：`docs/requirements/V1-REQUIREMENTS.md`
- 歷史 codebase 盤點：`docs/analysis/CODEBASE-SUMMARY.md`

**文件效力說明：** 本文件中「方案 A 作為 V1 runtime 核心、搭配方案 C 的 build／test-time catalog validation」及第 4、6 節的安全邊界仍為現行核准方向。原始方案比較與 prototype 計畫只保留為決策背景；後續已完成的 repository implementation、tests、PR、CI 與人工驗收 supersede 舊文中的「尚未驗證」「下一步先做 prototype」敘述。

**術語規則：** 新中文遊戲術語、正式譯名與會改變語意的中文措辭仍由專案負責人定稿；已核准譯文的純機械變體依 `docs/REVIEWER-PRINCIPLES.md` 處理。

## 1. 文件目的與目前狀態

本文件最初用來比較 V1 localization 技術方案。該比較已完成，核心方向已核准且已進入 production implementation，因此本文件現在有兩個用途：

1. 保存已核准的架構與不可變安全邊界。
2. 記錄原方案比較為何採用 A、只採用 C 的 validation 能力，以及哪些早期未驗證事項已被實作證據解決。

**不再成立的舊前提：** 「實作前必須先完成最小 prototype」。最小 prototype 已由 PR #6 完成並通過 Reviewer／人工驗收；後續 production catalog、locale persistence 與多個 Hero Edit localization slices 也已完成。

## 2. V1 架構不變條件

所有後續 localization batch 都必須同時符合：

- 預設顯示繁體中文，並可一鍵切換繁中／英文及記住選擇。
- 切換語言不得改變 Hero data、規則結果、目前路由或頁面狀態，也不得遺失未儲存的編輯內容與 `dirty` 狀態。
- 英文原始資料是唯一 canonical rule data；中文只存在於 presentation boundary。
- 不修改 ID、enum、reference、calculation、parser、Hero save data format 或 import／export format。
- 既有 Hero、LocalForage、Warehouse 與 import JSON 必須保持相容。
- 繁中與英文使用同一、且獨立於 locale 的 `SourcebookType` policy：保留 `Official`／`Homebrew`，排除 `Community`／`ThirdParty`；Official Patreon／Playtest 沿用原版 feature flag。
- Homebrew 與玩家輸入保持 canonical 使用者資料，不自動翻譯或改寫。
- 缺少核准中文時使用 canonical English fallback；V1 必要玩家內容在發布前必須完成翻譯完整性 gate。
- V1 必須做 Hero Sheet、PDF、圖片與列印的最低 smoke test；完整字型與排版最佳化可延至 V1.1。

以上條件是淘汰門檻，不以工程便利性抵銷。

## 3. 原方案比較結論

### 3.1 方案 A — 獨立 catalog + presentation-only resolver

**採用，為 V1 runtime 核心。**

核心理由：

- canonical Sourcebooks、Hero、parser inputs 與 models 不需要產生中文副本。
- UI semantic key、stable element identity／field identity 與 composed message key 可逐步本地化。
- localized label 不必成為 option value、Hero value、ID、sort identity 或 storage payload。
- 英文 fallback 與逐頁導入自然，適合 V1 incremental delivery。
- 與 existing domain models 的耦合面積小於 runtime view-model 重構。

### 3.2 方案 B — Runtime localized View Model

**不作為 V1 核心。**

主要風險是 canonical／view 雙契約、localized view 回流 logic／save、切換時大量 object identity 重建，以及為此擴大 component／model 重構。若未來特定複雜畫面需要窄型 presentation DTO，可另批評估，但不得把完整 localized Hero／Sourcebook 當 domain model。

### 3.3 方案 C — Build-time localized data artifact

**不作為 runtime 中文資料集；只採用 build／test-time validation 能力。**

可用於 catalog schema、identity、duplicate、stale canonical English、placeholder、missing translation 等驗證；不得生成可被 logic 當成 canonical Sourcebook 使用的中文資料物件。

### 3.4 明確不採用

- 在 canonical model 加 `nameZh`／`descriptionZh` 等雙語欄位。
- 複製整套中文 Sourcebooks 並切換資料集。
- 以完整 runtime English sentence 作唯一 translation key。
- runtime 全域字串替換。
- 切換 locale 時 reload app、重跑 `DataLoader`、切 locale route 或 remount `HeroEditPage`。

## 4. 現行 production localization architecture

截至 `develop` @ `712d45cebc3e654ec69f75b1a91d3b9d04afef82`，下列不再只是 prototype 候選，而是現行 production evidence：

### 4.1 Locale state

- `AppLocale` 為 `'en' | 'zh-TW'`。
- default locale 為 `zh-TW`。
- locale preference 存在 app `Options.locale`，不屬於 Hero schema。
- locale 切換只應觸發 presentation rerender，不得重建 canonical Hero／Sourcebook data。

### 4.2 Catalog identity

現行 production `LocalizationEntry` exactly 有 5 類 entry：`LocalizationEntry = UIStringEntry | ElementFieldEntry | SkillFieldEntry | LanguageFieldEntry | MessageEntry`（見 `src/localization/catalog.ts`）：

- `ui`：semantic UI key。
- `element-field`：stable canonical element ID + display field。
- `skill-field`：Skill 沒有 stable ID，因此以 canonical English `Skill.name + field` 作 localization identity；Hero／Feature selection、stored selected value 與 canonical Skill object 仍維持 canonical English。
- `language-field`：Language 同樣沒有 stable ID，因此以 canonical English `Language.name + field` 作 localization identity；Hero／Feature selection、相關 reference 與 save state 仍保持 canonical English。
- `message`：semantic message key + structured placeholders。

每筆 entry 保留：

- canonical English snapshot。
- `zhTW` display content。
- approval state。
- 該 entry kind 所需的 stable identity；`message` 另保存 placeholder contract。

這些 metadata 只屬 localization layer，不加入 canonical rule data 或 Hero save data。localized display 不會寫回 canonical Skill／Language name 或任何 selection／save value。

### 4.3 Resolver contract

現行 resolver 提供 presentation-only lookup，例如 UI string、element field、Skill field、Language field、composed message。

只有在下列條件成立時中文才可顯示：

- locale = `zh-TW`。
- identity 唯一。
- entry 為 `approved`。
- canonical English snapshot 仍與 call site 相符。
- 中文內容有效。
- composed message 的 placeholders 與 canonical／zh-TW template 契約一致。

任何 missing、unapproved、stale、ambiguous 或 malformed entry 都 fallback 到 call site 傳入的 canonical English；localized result 不得寫回 Hero、option value、ID、sort key、parser input 或 storage。

### 4.4 Production validation

build／test-time validation 用來阻擋至少下列風險：

- duplicate／ambiguous identity。
- approved-but-empty content。
- stale canonical English。
- malformed entry／invalid approval state。
- composed-message placeholder mismatch。

V1 player-content manifest／completeness foundation 已建立：目前已知 `requiredCount = 1092`，仍有 5 個 unresolved domains，尚未成為完整 V1 denominator。foundation 已建立不等於 V1 completeness 已完成；V1 發布前仍需要完整、涵蓋所有 domain 的 translation completeness gate。

## 5. 已被後續實作證據解決的早期事項

| 原先待驗證事項 | 現況 |
|---|---|
| 最小 localization prototype 是否可行 | **已解決** — PR #6 完成 minimal prototype，證明 display-only localization、fallback、composed message 與 locale switching 可不破壞 Hero working state。 |
| `SourcebookType` runtime policy | **已解決核心 policy** — PR #8 實作保留 Official／Homebrew、排除 Community／Third Party；PR #9／#10 修復 Homebrew delete／import compatibility。 |
| locale preference 儲存位置 | **已解決** — PR #12 將 locale preference 納入 app `Options` persistence。 |
| production catalog／resolver format | **已解決 V1 runtime foundation** — PR #13 建立 production catalog、approval state、resolver 與 validation。 |
| 固定 UI 與 dynamic message 能否逐步導入 | **已由 production slices 證明** — PR #14–#18 已在 Hero Edit UI、navigation、PageState 與 section-local dynamic copy 使用現行 catalog／resolver。 |
| locale switching 是否能保留 canonical Hero data／route／working copy | **已有自動測試與人工驗收 evidence**；後續高風險 batch 仍需按實際 call path 保留 regression coverage。 |
| 無 stable element ID 的 canonical `Language`／`Skill` 如何建立 long-term localization identity | **已由 production evidence 解決** — PR #54／#55：Skill 使用 canonical name scoped `skill-field`，Language 使用 canonical name scoped `language-field`；localized display 不寫回 canonical Skill／Language name 或任何 selection／save value。此策略不因此推廣為所有未來無 stable ID 資料的預設方案。 |

這些事項不應在新 Batch 中再次被當成「尚未開始前置研究」。只有新的反證才重新開啟。

## 6. 已核准的不可變安全條件

1. 英文 canonical data 是唯一規則基準。
2. 中文不得進入 parser、規則計算、identity、ID、enum、selected value、reference 或 storage。
3. Hero schema、import／export format 及既有 save compatibility 不得因 localization 改變。
4. 中文只在 presentation boundary 顯示。
5. 語言切換不得重跑 `DataLoader`、切換 route、remount 編輯頁或遺失 working copy／`dirty`。
6. 繁中與英文使用同一 `SourcebookType` policy：保留 Official／Homebrew，排除 Community／Third Party。
7. 中文搜尋或 localized label 最終必須回到 canonical identity／英文 value。
8. dynamic／composed display text 先以 canonical／structured data 完成規則結果，再於 presentation boundary 組句。
9. 缺漏中文使用 canonical English fallback；V1 必要玩家內容發布前 translation completeness 必須歸零。
10. 新中文遊戲術語、正式譯名與語意性中文修改由專案負責人核准；已核准譯文的純機械變體依 `docs/REVIEWER-PRINCIPLES.md` 處理。
11. localization 不得因方便而擴張成 shared domain-model、storage 或 schema 重構。

## 7. 現行工程控制

下列是目前有效的風險控制方向；只要不放寬第 6 節，可在後續 Batch 以更小或更直接的實作替代：

- resolver API 保持窄型、presentation-only。
- 對每個 resolver call 檢查 localized return value 是否只進可見輸出。
- value／label 分離；callback、route、ID、enum、Class／Subclass／Feature identity 保持 canonical。
- dynamic message 使用 stable key + structured params，不用完成英文句子作唯一 identity。
- fresh tests 針對 public behavior 與 canonical data safety。
- manual smoke 只補 jsdom／unit tests 無法證明的視覺、responsive 與真實 interaction。
- Batch 以 coherent UI／功能 slice 推進，不以單一詞彙或單一 call site 切批。

## 8. 仍需後續 V1 evidence／決策的事項

### 8.1 由實作 evidence 解決，不預先要求 Owner 決定

- Core／Orden／Beastheart／Summoner 大量 game content 的 stable localization identity 與 presentation boundary。
- Hero Sheet／Classic Sheet builder／formatter 的 localization boundary，尤其仍參與英文文字分類／parser 的欄位。
- Warehouse、舊 JSON import／export、Hero Sheet output 等相應高風險 flow 的完整 V1 regression evidence。
- V1 player-content manifest 與 translation completeness release gate。
- 若未來真的引入 catalog lazy-loading，再驗證 PWA／offline／cache 行為；沒有 lazy-loading 需求時不預先建立這套複雜度。

### 8.2 真正產品取捨才交由專案負責人

相應功能實際進入 Batch、既有 requirements／authority 無答案且 technical evidence 不能代替產品選擇時，才提出 User Decision，例如：

- 中文搜尋只查目前 locale，或同時支援中英。
- presentation-only 清單採 canonical English 順序或 localized label 排序。
- 正式發布、授權文字與風險接受。

純機械翻譯變體、一般 merge method、最低足夠 verification 等不屬於此類。

## 9. 後續 Batch 驗證原則

每個 localization slice 依 `docs/project-review-skill/PROJECT-REVIEW-SKILL.md` 與 `docs/project-review-skill/RISK-AND-VERIFICATION.md` 決定最低足夠 evidence。常見 gate：

- locale `zh-TW`／`en` 顯示正確。
- fallback 正確。
- localized label 不成為 canonical value／ID／route／callback argument。
- Hero JSON、Hero options、rule result、save data 在 locale switch 前後不變。
- dynamic placeholders、數字、Markdown、canonical token 與玩家輸入保持正確。
- 需要時驗證窄畫面、clipping、scrolling 與主要操作。
- 最後 code change 後取得 fresh lint／typecheck／tests／build／CI evidence，範圍依風險決定。

不要為已由較早 production evidence 證明且本批未觸及的架構，再建立重複的 prototype gate。

## 10. V1.1／延後事項

- PDF／圖片完整中文排版、DPI、分頁與字型最佳化；V1 仍需最低 smoke test。
- 全面列印 CSS、極端窄畫面與所有卡片長字串的視覺最佳化。
- 圖片資產內嵌英文的全面替換策略。
- RTL、多語言擴充、SEO locale route、TMS、機器翻譯與一般化 multi-locale lazy-loading 架構。
- 為一般化 localization 而重構所有 domain／view models。
- 上游持續同步自動化；V1 維持 frozen upstream baseline。

## 11. 結論

V1 技術方向已從「候選方案」進入「production implementation」。

- **Runtime 核心：方案 A** — independent catalog + presentation-only resolver。
- **Build／test validation：採用方案 C 的驗證能力**，不建立可供 domain logic 使用的中文資料集。
- **方案 B 與完整 localized Sourcebook artifact 不作 V1 核心。**

後續不再以「先完成 prototype」作為 localization 前置 gate；應以現行 production architecture 為基礎，依實際 code boundary 選 coherent V1 slice，保留 canonical data safety，取得與風險相稱的最低足夠 evidence，再逐步擴充 translation coverage。
