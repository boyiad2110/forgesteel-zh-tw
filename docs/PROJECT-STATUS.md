# Forge Steel 繁體中文化專案進度

> 最後更新：2026-09-02
> 本文件是 handoff 摘要，不取代 GitHub PR／commit、`docs/REVIEWER-PRINCIPLES.md`、V1 requirements、現行 code／tests／CI 或人工驗收 evidence。

## 1. Current Baseline

- Repository：`boyiad2110/forgesteel-zh-tw`
- Active integration branch：`develop`
- Reconciliation snapshot（本文件最後 reconcile 時的 `develop`，僅供對照，**不是 reset target**）：
  `3c52c5690e8045eee541e950c639153ed38e9d4f`
- Frozen `main` / `origin/main`：
  `267ca1a10dcab32a700089fc65dd212dc81f880a`
- 最近已 merge 的工作以 `git log develop` 與 GitHub PR 為準；本文件不維護「最新 PR」欄位，避免每次 merge 後立即 stale。
- Current phase：**已從 denominator foundation 進入 coherent player-facing translation slices，並持續以 manifest／completeness 逐批擴充。** manifest／completeness 是進度的權威 machine evidence，current required／missing／unapproved／unresolved state 一律以 live manifest + catalog + `npm run loc:status` evidence 為準，本文件不保存該數字的 snapshot。目前 `unresolvedDomains` 尚未歸零，`complete = false`；在所有 V1 domains 都完整 enumerate 前，任何已知 denominator 數字都不是完整 V1 翻譯百分比。

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
- 此 milestone 不代表所有 V1 Class Level 1 abilities 完成：在當時，Official Beastheart 與 Summoner 的 Level 1 Class ability-authored-content 尚未 localized。Beastheart 其後的進展見 3.15；Summoner 的該部分內容至今仍未 localized。`official-ability-authored-content` 至今仍為 unresolved domain。

### 3.10 Core／Orden content expansion after the earlier Level 1 milestone（PR #74、#76–#79、#85–#87）

- Orden Ancestry abilities（#74）、Core standard Kits（#76）、Core Domains Level 1–3（#77）已加入 production localization、manifest coverage 與其各自的 representative presentation evidence。
- Core standard Class 的 **base Level 1 remaining（非 Ability）player-facing content** 已完成：Censor Level 1 與其 Orders（#78）、Conduit（#79）、Fury（#85）、Elementalist（#86）、Null（#87）。Conduit 沒有 subclass。
- 本節只涵蓋這個 PR 區間；其餘 Core standard Class 的 base Level 1 remaining 與各 Class 的 Level 1 subclass content 由 3.12 記錄。
- 上述 Class 清單只是 handoff 導覽，不是第二套 denominator——實際 required／missing 一律以 live manifest + catalog + `npm run loc:status` 為準。
- 這些 Core／Orden expansion 不改變 V1 scope：V1 仍包含 Core、Orden、Beastheart 與 Summoner。當時的 sequencing 優先處理 Core／Orden；現行狀態見第 7 節。

### 3.11 Localization workflow／implementation 優化（PR #88–#90）

三批 architecture optimization 的長期成果摘要；逐批細節以 Git history／PR 為準，本節不保存 test count、hash 或 Agent report。

- **Shared verification entry point（#88）：** local CI-equivalent verification 與 GitHub CI 已收斂到 repository 自身定義的單一 verification entry point。後續 workflow 應讀 current `package.json` scripts 與 current CI workflow 決定實際 command，不把 command 細節硬編成永久文件規則。
- **Bounded traversal 去重（#89）：** Conduit／Elementalist／Fury／Null remaining-content 的 production bounded non-Ability traversal 由多份重複實作收斂為單一共用 implementation，既有 bounded semantics、denominator 與 canonical values 不變。這是 implementation precedent，不新增 localization scope，也不是 generic content crawler。
- **Packet preflight 與 permanent regression 分離（#90）：** translation packet canonical alignment 明確定位為 future implementation preflight evidence；已 merge localization 的 permanent regression 不再永久重播 historical packet revision／hash map，改由 independent live canonical evidence 驗證 manifest／catalog／presentation behavior，降低 self-validating false green 風險。對應的永久規則已寫入 `docs/translation/TRANSLATION-WORKFLOW.md` 與 `docs/project-review-skill/RISK-AND-VERIFICATION.md`。

### 3.12 Core standard Class Level 1 player-facing localization milestone

- 九個 Core standard Class 的 **Level 1 player-facing localization 已完成**，涵蓋 base Level 1 non-Ability content、各 Class 適用的 Level 1 subclass content，以及 Fury Stormwight Level 1 Beast Shape 直接可選的 Kit content。Conduit 沒有 subclass。
- 這個 milestone 由 3.9（Level 1 ability-authored-content）、3.10（先行完成的 base Level 1 remaining）與其後的 Shadow／Tactician／Talent／Troubadour base remaining、Null／Elementalist／Fury subclass、Stormwight Kit 各批共同構成；逐批細節以 Git history／GitHub PR 為準。
- **這是 Core standard Class Level 1 的 milestone，不是 V1 完成，也不代表任何 unresolved domain 已收斂。** `official-ability-authored-content` 與 `class-and-subclass-level-content` 仍為 unresolved；Beastheart／Summoner、Level 2–3 content、Hero Sheet、Hero Edit semantic keys、nested Hero creation authored content 等 V1 工作仍未完成。
- 本節是 handoff 導覽，不是第二套 denominator。實際 required／missing／unapproved／unresolved 一律以 live manifest + catalog + `npm run loc:status` evidence 為準。

### 3.13 Reviewer／translation workflow throughput 優化（PR #95–#97、#100）

這一段是這批 workflow 變更的長期成果摘要，不維護 PR-by-PR 流水帳；逐批細節以 Git history／PR 為準。

- **Stage 1 fixed cost 下降：** Class localization presentation test 收斂到共用的 repository test harness，Stage 1 預設只跑 risk-matched minimum sufficient evidence，不預設完整 local `verify:ci` 或 build；Batch Contract 另可明確授權 Stage 1 remote reviewer branch，讓 Reviewer 直接 review exact remote HEAD，取代昂貴的 cumulative patch handoff。
- **Class／Subclass Level 1 non-Ability required identity 已固定：** 該 slice 的 required identities 如何可靠 enumerate（shared bounded walk、不得 class-specific arbitrary exclusion、explicit supplemental fields、不為單一 class 擴張 shared walk）已寫入 `docs/translation/TRANSLATION-WORKFLOW.md`，不再每個 class batch 重新推導。
- **Entry-point routing：** `CLAUDE.md` 與 Reviewer／Agent 文件的入口一律導向現行 authority 文件與現行 repository primitives，避免每份 handoff 重建規格。
- **Reviewer workflow 收斂：** Precedent Gate 增加 scope-equivalence check、packet canonical alignment timing 左移為三層、Batch Cost Checkpoint 取代硬數字門檻、Stage 2／Stage 3 改用 compact delta-only handoff profile。

### 3.14 Core standard Class Level 2 player-facing localization（PR #105–#113）

- Conduit、Censor、Fury、Elementalist、Tactician、Null、Shadow、Talent、Troubadour 九個 Core standard Class 的 Level 2 player-facing content 已逐批完成 localization、manifest coverage 與其各自的 representative presentation evidence。
- 這是 Core standard Class 的 Level 2 milestone，不代表 Level 2 以外的 class／subclass content 或任何 unresolved domain 已收斂。

### 3.15 Beastheart localization milestone（PR #114–#120）

Beastheart 已從先前的 deferred sequencing 進入實際 localization 工作。本節是 milestone 摘要，不是 PR-by-PR 流水帳；逐批細節以 Git history／GitHub PR 為準。

已 merge 的內容：

- **Beastheart Level 1 base ability-authored-content**（#114）：Level 1 可選 base abilities 的 authored-content localization。
- **Beastheart Level 1 base completion**（#115）：Level 1 base class 其餘 player-facing content。
- **Heart of the Beast 修正與 legacy Markdown table 修正**（#116）：修正 Heart of the Beast 譯文，並讓 legacy table shim 尊重真實 fence boundary，使 Rampage table 正常 render。這是 presentation／Markdown 層修正，未改變 canonical data。
- **Wild Nature Level 1 subclass localization**（#117）。
- **共用 AbilityPanel PackageContent localization 修正**（#118）：修正 AbilityPanel package section 的 PackageContent presentation boundary；屬 shared component 修正，效果不限於 Beastheart。
- **Beastheart Level 2**（#119）：base class Level 2 content 與 Guardian／Prowler／Punisher／Spark 的 Level 2 subclass progression，含其 calculated readings 的 presentation projection。
- **Beastheart Level 3 base-class 7pt Ability slice**（#120）。

界線（不得被讀成更大的宣稱）：

- **這不代表 Beastheart Level 1–3 全部內容已完成。** 尚未涵蓋的 Beastheart content（包含 Companion／Summon 相關的 Level 3 工作）仍未完成。
- 不代表 `official-ability-authored-content`、`class-and-subclass-level-content` 或任何其他 unresolved domain 已收斂。
- 不代表 Summoner 的 Level 1–3 Class／Subclass player-facing localization 已完成；本 milestone 未新增 Summoner 進展，其尚未涵蓋的內容仍待後續批次。（Summoner 既有的 Class top-level name／description localization 見 3.6。）
- 本節是 handoff 導覽，不是第二套 denominator；實際 required／missing／unapproved／unresolved 一律以 live manifest + catalog + `npm run loc:status` evidence 為準。

### 3.16 Recent `develop` progress after the prior snapshot

- Summoner Level 1–3 base-class slices、Core V1 perks，以及 Conduit／Censor Level 3 player-facing localization 已合併；各 slice 的 exact coverage 仍以 live manifest、catalog 與 GitHub PR evidence 為準。
- localization workflow 的 packet reconciliation、verification-cost 與 Stage 3 handoff safeguards 已隨實際 merged work 強化；這些是 workflow evidence，不改變 V1 scope 或 canonical-data boundary。

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
- Summoner 的 Class content，Beastheart 尚未涵蓋的部分（含 Companion／Summon 相關 Level 3 工作），以及尚未納入目前 slices 的 Level 2／3、subclass／class-level content，仍待完整 enumerate、取得核准譯文並完成 localized presentation evidence。
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

## 7. Current sequencing / Next Work

目前狀態：

- V1 scope 仍為 Core、Orden、Beastheart、Summoner，未改變。
- **Beastheart 已不再是 deferred**：先前「Core + Orden 優先、Beastheart／Summoner 延後」的 sequencing 已被其後 Owner-directed 的實際工作取代，Beastheart 已完成一系列實質 localization slices（見 3.15）。
- **Core standard Class 的 Level 1（3.12）與 Level 2（3.14）player-facing localization milestone 已達成。**
- **下一個 substantive localization／content milestone 未由本文件固定。** 本文件不建立新的永久優先順序。
- 候選方向仍在剩餘 unresolved domains 與既有 V1 工作之內：Beastheart 尚未涵蓋的內容、Summoner、Core／Orden 的 Level 3 class／subclass content、nested Hero creation authored content、Hero Sheet、Hero Edit semantic keys。實際順序由 Owner 最新 sequencing decision 決定。

任何下一批的 exact slice 都必須在正式 Batch Contract 前，依 live repository code／manifest 與 `docs/project-review-skill/PROJECT-REVIEW-SKILL.md` 的 Precedent Gate 再確認。本節記錄的是現行 sequencing 意圖，不預先固定 slice 內容，也不固定其後所有 batch 的順序，更不建立第二套 denominator。

由 Reviewer 依剩餘 unresolved domains、現行 Owner sequencing 與 `docs/translation/TRANSLATION-WORKFLOW.md` 建立下一個 coherent Batch Contract。開始前先核對 manifest coverage 與 slice 邊界；若 identity、traversal 或 scope 形成 blocker，才依 Reviewer Batch Contract 另開 focused technical denominator batch。

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
