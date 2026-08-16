# Forge Steel 繁體中文化專案進度

> 最後更新：2026-08-16
> 本文件是 handoff 摘要，不取代 GitHub PR／commit、`docs/REVIEWER-PRINCIPLES.md`、V1 requirements、現行 code／tests／CI 或人工驗收 evidence。

## 1. Current Baseline

- Repository：`boyiad2110/forgesteel-zh-tw`
- Active integration branch：`develop`
- Current integration baseline：
  `6a121f5488331f35a795343e81ccd353ad974e8f`
- Latest substantive merged PR：`#79 feat: localize Core Conduit Level 1 remaining content`
- Frozen `main` / `origin/main`：
  `267ca1a10dcab32a700089fc65dd212dc81f880a`
- Current phase：**已從 denominator foundation 進入 coherent player-facing translation slices，並持續以 manifest／completeness 逐批擴充。** manifest／completeness 是進度的權威 machine evidence；目前沒有 missing、unapproved 或 catalog issues，仍有 5 個 unresolved domains，`complete = false`。在所有 V1 domains 都完整 enumerate 前，任何已知 denominator 數字都不是完整 V1 翻譯百分比。

實際 repository state 永遠優先於本摘要。若 `develop` 已前進，先依 Git／GitHub evidence 更新判斷，不把本文件中的 SHA 當成 reset 目標。

## 2. Source of Truth

依 `docs/REVIEWER-PRINCIPLES.md`：

1. 專案負責人在目前對話中的最新明確決定。
2. repository 現行權威文件。
3. 已核准 requirements／decision records／測試標準。
4. code、tests、PR、CI、人工驗收與歷史文件，作為現況或 evidence。

主要現行文件：

- `docs/REVIEWER-PRINCIPLES.md` — Reviewer 權限與決策邊界。
- `docs/requirements/V1-REQUIREMENTS.md` — V1 產品 scope／完成／發布條件。
- `docs/translation/TRANSLATION-WORKFLOW.md` — V1 翻譯工作的執行方式；不取代 Owner latest decision、Reviewer Principles、Reviewer Skill 或 V1 requirements。
- `docs/analysis/LOCALIZATION-TECHNICAL-OPTIONS.md` — 已核准 localization 核心架構與安全邊界。
- `docs/translation/TRANSLATION-GLOSSARY.csv` — 已核准 standalone terminology／UI glossary evidence。
- `docs/PROJECT-SCOPE.md` — 快速摘要；不建立第二套 scope。
- `docs/UPSTREAM-BASELINE.md` — frozen upstream baseline。
- `docs/analysis/CODEBASE-SUMMARY.md` — 固定舊 commit 的稽核／歷史 codebase map，不是現行 implementation status。

## 3. 已完成的主要 milestones

### 3.1 Repository／governance foundation

- `develop` 作為 integration branch；`main` 維持 frozen upstream baseline。
- CI、Reviewer Principles、V1 requirements、localization technical direction 與 Sourcebook policy 已建立。
- 每批以獨立 feature branch／PR、Batch Contract、risk-matched evidence 與明確 stop condition 執行。

相關歷史：PR #1–#5、#7、#11。

### 3.2 Sourcebook／Homebrew V1 blocker work

- Runtime 保留 Official／Homebrew，排除 Community／Third Party，且 policy 與 locale 無關。
- Official Patreon／Playtest 保留原版 feature-flag behavior。
- Homebrew unreferenced deletion regression 已修復。
- 缺少 `languages`／`skills` collection 的 incomplete Homebrew import compatibility 已修復。

相關歷史：PR #8–#10。

### 3.3 Localization architecture

- Minimal localization prototype 已完成並通過 Reviewer／Owner acceptance；不再是待完成前置工作。
- Locale default = `zh-TW`，可切換 `en`／`zh-TW`。
- Locale preference 已持久化於 app `Options`，不進 Hero schema。
- Production localization catalog／resolver／approval state／canonical-English drift 與 placeholder validation 已建立。
- Missing／unapproved／stale translation fallback 到 canonical English。
- 中文只走 presentation boundary，canonical Hero／Sourcebook／ID／enum／parser／save data 不變。

相關歷史：PR #6、#12、#13。

### 3.4 已完成 production translation slices（Hero Edit UI 與周邊）

- 第一批 Hero Edit 固定 UI actions、正式 `TRANSLATION-GLOSSARY.csv` baseline、Hero Edit navigation labels、PageState subtitles、shell 與 section-local UI。
- 延伸至 ClassPanel／SubclassPanel presentation frame、Hero element header metadata、Feature／Ability metadata 與基本 UI、AbilityInfo 核心 labels／approved action metadata。
- PowerRoll header／characteristics／Odds、footer damage／DamageType／Potency、multi-distance selector 已本地化，並維持 canonical `AbilityDistanceType` 不變。
- AbilityPanel 殘餘 UI、static Ability authored-content presentation boundary、共用 Hero choice 設定 UI、Hero management shell（含小螢幕 delete control）已完成。
- 上述 authored-content 與 shared-config 工作維持既有邊界：canonical data／ID／enum 不變，只在 presentation boundary 套用 approved 譯文。

相關歷史：PR #14–#39。

### 3.5 V1 localization manifest／completeness foundation

- 建立 V1 localization manifest 與 completeness foundation，追蹤 required、missing、unapproved、catalog validation issues 與 unresolved domains。
- unresolved domains 仍存在時，completeness 不得被視為完整 V1 翻譯完成；已知 requiredCount／missing 只代表目前已納入的 denominator。
- 建立 Hero creation Element metadata denominator，固定使用 Core、Orden、Beastheart、Summoner 的 Ancestry、Culture、Career、Class 與 Complication，並以穩定的 canonical Element-field identities 追蹤；此 denominator 與 runtime Sourcebook allowlist、feature flag、Patreon loading、Homebrew 與 `SourcebookData` cache 隔離。

相關歷史：PR #41、#42。

### 3.6 Hero Creation top-level content（PR #44–#48）

- Ancestry、Culture、Career、Class、Complication 的 top-level name／description localization。

### 3.7 Hero Creation 巢狀內容／Career content（PR #49–#53）

- Culture Aspect、Ancestry non-Ability 巢狀 Features、Career Inciting Incidents、Career Features 已完成本地化與 manifest 涵蓋。

### 3.8 Skill／Language（PR #54–#55）

- 57 個 Skill／114 個 identity、42 個 Language／84 個 identity 已完成 production `skill-field`、`language-field` 本地化。
- player-facing display／search 使用中文；Hero／Feature selection 與 save data 仍保留 canonical English selection／save values。
- `skills-and-languages` unresolved domain 已移除。

### 3.9 Core standard Class Level 1 ability-authored-content（PR #60、#63–#64、#66–#67、#69–#72）

- Censor、Fury、Conduit、Elementalist、Null、Shadow、Tactician、Talent 與 Troubadour 九個 Core standard Class 的 Level 1 ability-authored-content 已完成 localization slice。
- Class ability calculated presentation 維持 canonical-English-first：canonical calculator 先完成計算，再僅在 presentation boundary 投影可安全證明的 approved zh-TW；中文不進入 calculator、parser 或 canonical data。
- 此 milestone 不代表所有 V1 Class Level 1 abilities 完成：Official Beastheart 與 Summoner 的 Level 1 Class ability-authored-content 尚未完整 enumerate 或 localized，仍屬 `official-ability-authored-content` unresolved domain。

### 3.10 Core／Orden content expansion after the earlier Level 1 milestone（PR #74、#76–#79）

- Orden Ancestry abilities（#74）、Core standard Kits（#76）、Core Domains Level 1–3（#77）、Censor Level 1 與 Orders（#78），以及 Conduit Level 1 remaining non-Ability player-facing content（#79）已加入 production localization、manifest coverage 與其各自的 representative presentation evidence。
- 這些 Core／Orden expansion 不改變 V1 scope：V1 仍包含 Core、Orden、Beastheart 與 Summoner；目前 sequencing 可優先處理 Core／Orden。

## 4. 現行 translation／decision 規則

- 專案負責人是新中文遊戲術語、正式譯名與語意性中文修改的最終決策者。
- 未核准的新術語保持 canonical English。
- 已核准譯文的 singular／plural、`a/an`、大小寫、不改變語意的標點、英文 plural `s` 與 placeholder 周圍純文法調整，可依 `docs/REVIEWER-PRINCIPLES.md` 由 Reviewer／Agent 機械處理，不需逐項回問 Owner。
- runtime translation coverage 不能決定 Sourcebook allowlist。
- localization 不得寫回 canonical data、Hero data 或 persistence。

## 5. Remaining unresolved domains

目前 production manifest（`v1LocalizationManifest`）exact 5 個 unresolved domains：

1. `official-ability-authored-content`
2. `class-and-subclass-level-content`
3. `hero-creation-nested-authored-content`
4. `hero-sheet`
5. `hero-edit-semantic-keys`

每個 domain 需完整、可驗證地 enumerate 其 required identities 後，才能自 unresolved 移除。

其他仍需完成的 V1 工作：

- Level 2／3 level-up player flow 所需 UI／game content localization 與 canonical-safety regression evidence。
- 在所有 V1 domains 已完整 enumerate 前，持續將 completeness 明確報為已納入 denominator 的內容進度，而非完整 V1 翻譯百分比。
- 依 V1 requirements 完成 save／reopen／original-save compatibility、Official／Homebrew、locale switching、Hero Sheet／output 等剩餘 required verification。
- Beastheart／Summoner 的 Level 1 Class ability-authored-content，以及尚未納入目前 slices 的 Level 2／3、subclass／class-level content，仍待完整 enumerate、取得核准譯文並完成 localized presentation evidence。
- 專案負責人與團員的封閉 Beta。
- 發布前 dependency/security risk decision、GPL／Draw Steel licensing／legal notice、免費 deployment 與正式發布批准。

未中文化的 GM、Homebrew 與其他 V1 非翻譯門檻內容，可依 requirements 繼續顯示 canonical English。

### Complication sequencing

Complication top-level localization 已完成。進一步 Complication-related content（例如巢狀 authored content）暫依 Owner 最新 sequencing decision deferred，不視為永久移出 V1 requirements。

## 6. 已知 deferred／後續議題

- PDF／PNG／print 的完整中文字型、分頁、DPI 與視覺最佳化屬 V1.1；V1 仍需最低 smoke test 並確保主要內容可讀／可操作。
- 搜尋語言與 presentation-only localized sorting 只有在相應功能真正進入 Batch、現行 authority 無答案時才需要 Owner product decision。
- Warehouse／PWA／cache 等只按實際觸及風險取得 evidence，不預先建立大型驗證工程。
- 不做與 V1 localization 無關的大型 storage／schema／shared architecture refactor。
- local full-suite 曾觀察到 intermittent timeout；required CI PASS 仍為必要條件。在取得 reproducible evidence 前不視為 localization blocker；若持續出現，另做獨立的 test-stability inventory。

## 7. Next Work

文件 reconciliation 完成後，由 Reviewer 根據剩餘 5 個 unresolved domains、現行 Owner sequencing 與 `docs/translation/TRANSLATION-WORKFLOW.md` 建立下一個 coherent Batch Contract。

開始前先核對 manifest coverage 與 slice 邊界；若 identity、traversal 或 scope 形成 blocker，才依 Reviewer Batch Contract 另開 focused technical denominator batch。

## 8. Update Rules

本文件只在下列情況需要更新：

- substantive milestone 已 merge 至 `develop`，使目前 phase／baseline／剩餘 V1 工作發生實質變化。
- 已核准產品／技術決策改變。
- 新問題正式成為 V1 blocker／deferred item。
- handoff 摘要已明顯無法代表 repository 現況。

更新時：

- 不複製 PR body、完整 CI log、逐日流水帳或每一筆 test count。
- 不把 documentation-only status update 自我加入 completed history，再觸發下一次 status-only PR。
- 不把本機 clone 狀態、credential、token 或個人路徑寫入文件。
- detailed history 以 GitHub PR／commit 與 Git history 為準。
