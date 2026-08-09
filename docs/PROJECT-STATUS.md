# Forge Steel 繁體中文化專案進度

> 最後更新：2026-08-09
> 本文件是 handoff 摘要，不取代 GitHub PR／commit、`docs/REVIEWER-PRINCIPLES.md`、V1 requirements、現行 code／tests／CI 或人工驗收 evidence。

## 1. Current Baseline

- Repository：`boyiad2110/forgesteel-zh-tw`
- Active integration branch：`develop`
- Current `develop` / `origin/develop` baseline：
  `d0fdfdfad2a1e39e4604253960340a6ffd72fb75`
- Latest merged substantive PR：`#34 feat: localize power roll distance selector`
- Frozen `main` / `origin/main`：
  `267ca1a10dcab32a700089fc65dd212dc81f880a`
- Current phase：**production localization 已建立，正在以 coherent V1 player-facing slices 逐步擴充 coverage**。

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

### 3.4 已完成 production translation slices

- 第一批 Hero Edit 固定 UI actions。
- 正式 `TRANSLATION-GLOSSARY.csv` baseline 與後續 approved standalone terms。
- Hero Edit navigation labels。
- Hero Edit PageState subtitles。
- Hero Edit shell 與 section-local UI，包括多個 dynamic／composed message call sites。
- PR #19–#25 延續 coherent player-facing localization progression；完成內容包含 Hero Edit 週邊 UI 與 SubclassPanel 自身介面框架。
- PR #26 補足 Stage 3 recovery safeguards / governance；PR #27–#34 形成新的 player-facing localization milestone，而非逐一 PR 流水帳：ClassPanel presentation frame、Hero element header metadata、Feature / Ability metadata 與 basic UI、AbilityInfo core labels / approved action metadata，以及 PowerRoll header / characteristics / Odds、footer damage / DamageType / Potency、multi-distance selector localized labels。
- PowerRoll 的 multi-distance selector 保留 canonical `AbilityDistanceType`，只在 presentation boundary 使用 approved localized labels。

相關歷史：PR #14–#34。

## 4. 現行 translation／decision 規則

- 專案負責人是新中文遊戲術語、正式譯名與語意性中文修改的最終決策者。
- 未核准的新術語保持 canonical English。
- 已核准譯文的 singular／plural、`a/an`、大小寫、不改變語意的標點、英文 plural `s` 與 placeholder 周圍純文法調整，可依 `docs/REVIEWER-PRINCIPLES.md` 由 Reviewer／Agent 機械處理，不需逐項回問 Owner。
- runtime translation coverage 不能決定 Sourcebook allowlist。
- localization 不得寫回 canonical data、Hero data 或 persistence。

## 5. 尚未完成的 V1 工作

依現行 V1 requirements 與截至 PR #34 的 repository evidence，仍需逐步完成：

- Core、Orden、Beastheart、Summoner 的 Level 1–3 Hero player content 與必要 player-facing UI translation coverage。
- Hero creation／Hero Edit 中尚未納入的 shared components、game-content panels、instructional／rules content 與其他實際 V1 player-facing surfaces。
- Level 2／3 level-up player flow 所需 UI／game content localization 與 canonical-safety regression evidence。
- Hero Sheet／Classic Sheet 的 V1 player-facing localization boundary 與必要 translation coverage。
- 正式 V1 player-content manifest／translation completeness gate。
- 依 V1 requirements 完成 save／reopen／original-save compatibility、Official／Homebrew、locale switching、Hero Sheet／output 等剩餘 required verification。
- 已知尚未納入的較小 player-facing surfaces：AbilityPanel warnings / condition messages、keywords presentation、auto-calculate tooltip、resource `pt / pts`、Charge informational message、AbilityInfo 完整 distance formatter，以及 PowerRoll tier-effect / broader game-content translation。
- 專案負責人與團員的封閉 Beta。
- 發布前 dependency/security risk decision、GPL／Draw Steel licensing／legal notice、免費 deployment 與正式發布批准。

未中文化的 GM、Homebrew 與其他 V1 非翻譯門檻內容，可依 requirements 繼續顯示 canonical English。

## 6. 已知 deferred／後續議題

- PDF／PNG／print 的完整中文字型、分頁、DPI 與視覺最佳化屬 V1.1；V1 仍需最低 smoke test 並確保主要內容可讀／可操作。
- 搜尋語言與 presentation-only localized sorting 只有在相應功能真正進入 Batch、現行 authority 無答案時才需要 Owner product decision。
- Warehouse／PWA／cache 等只按實際觸及風險取得 evidence，不預先建立大型驗證工程。
- 不做與 V1 localization 無關的大型 storage／schema／shared architecture refactor。

## 7. Next Work

從最新 `develop` 的剩餘 V1 player-facing scope 做 targeted read-only inventory，再選一個 coherent、可獨立驗收的 Batch。

不要從舊 baseline、單一字串或單一 call site 推導下一個 micro-batch。

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
