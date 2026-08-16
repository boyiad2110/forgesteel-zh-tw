---
name: forge-steel-reviewer
description: Use when reviewing, scoping, planning, handing off, or closing implementation, localization, testing, documentation, Git, or release batches in the boyiad2110/forgesteel-zh-tw project.
metadata:
  author: Forge Steel 中文版開發
  version: "0.5.2"
---

# Forge Steel Reviewer

## Purpose

本 Skill 是 Forge Steel 繁中專案的 **Reviewer 操作 workflow**。

權限、Findings、User Decision、Review limit、Batch 原則與翻譯決策邊界，以 `docs/REVIEWER-PRINCIPLES.md` 為準。本 Skill 不維護第二套政策。

> 先確認 authority 與唯一 Batch，再用與風險相稱的最低足夠證據完成實作、Review 與收尾。

## 1. Load Authority

開始規劃、Review、Agent 任務、PR 收尾或 handoff 前：

1. 讀目前對話中專案負責人的最新明確決定。
2. 讀 `docs/REVIEWER-PRINCIPLES.md`。
3. 依需要讀現行 V1 requirements／decision 文件。
4. 讀本批相關 code、tests、PR、CI、人工驗收 evidence。
5. `docs/PROJECT-STATUS.md` 只作摘要；actual repository state 優先。

Authority 衝突時依 Principles 處理，不自行補規格。

## 2. Fix One Batch Contract

每批開始前固定：

- **Goal**：唯一可驗證結果。
- **Authority**。
- **Base**：branch／起點。
- **In scope**。
- **Out of scope**。
- **Acceptance**。
- **Risk Level**。
- **Git permission**。
- **Report**。
- **Stop**。

Batch 大小依 Principles：優先 coherent、可獨立驗收的 UI／功能 slice。

缺少 Goal、scope、Acceptance 或 Stop，不開始實作。

## 3. V1 Blocker Gate

遇到問題先問：

- 是否直接違反已核准 V1 requirement？
- 是否使實際功能無法使用？
- 是否危及 data、save compatibility、ID、enum、reference 或 canonical data？
- 是否造成明確安全／發布風險？
- 是否直接阻擋本批既定 flow？

只有有實際影響時才升級 blocker。問題來自 upstream 不代表可以降級；文件不漂亮也不代表是 blocker。

## 4. Assign Risk and Evidence

- **Level A**：文件、已核准文案、無 state／data 影響的 display-only change。
- **Level B**：component behavior、state、filtering、lookup、fallback、locale switching。
- **Level C**：delete、import、storage、persistence、migration、schema、data-loss、security。

詳細：`RISK-AND-VERIFICATION.md`

原則：

- 不把所有批次升成 Level C。
- 測 public behavior，不只測 implementation detail。
- critical interaction 不應被 mock 掉。
- 最後一次 code change 後取得 fresh tests／lint／typecheck／build／CI evidence；需要 CI-equivalent local checks 時，依 Contract 以固定且乾淨的 exact HEAD 執行。
- manual smoke 只補自動測試難以證明的 UI／responsive／interaction risk。

### Precedent Gate

在 Reviewer 規劃或判定本批 architecture／risk 前，若涉及既有 shared component、localization presenter、calculated grammar、fallback 或其他重複出現的 architecture pattern，必須先查足以判定本批的**近期相關 merged precedent、現行 code 與 tests**。

不要求無限制考古；只查最近且與本批 extension／risk 有關的前例。precedent 尚未查清前，不得把已存在的 extension point 判成「未知 architecture」，或因此設置不必要的 STOP；查清後再依實際 extension risk 固定 Contract。

## 5. Prepare Agent Task

依 `AGENT-TASK-CONTRACT.md`，任務只寫本批差異與必要 gate，不重複完整專案歷史。穩定 generic rules 應引用本 Skill、`AGENT-TASK-CONTRACT.md`、`GIT-SAFETY.md`、`RISK-AND-VERIFICATION.md` 與 `TRANSLATION-WORKFLOW.md`，不必在每份 handoff 重貼完整 Git 禁止或 Stage workflow；但本批特有 risk、禁止事項、SHA、merge method、scope boundary、acceptance 與 STOP rule 仍須明列。

至少包含 Goal、Authority、Base、In／Out scope、Acceptance、Risk、Git permission、Report、Stop。

### Translation Worksheet Gate

translation batch 若需要 Owner 定稿，Reviewer 先讀 `docs/translation/TRANSLATION-WORKFLOW.md` 的 Worksheet 規格。交付 worksheet 前，必須先依既有 authority 處理 mechanical／derived rows；Owner request 只包含真正的新術語、新譯名、新 prose 或語意取捨。不得因 worksheet 有 N rows 就要求 Owner 逐筆 finalize N rows；handoff 必須告知真正需要決定的 row count。若 Reviewer 無法判斷某 row 是否 mechanical，先依現行 authority 判斷；只有真的涉及語意選擇才交 Owner。

交付 translation implementation 前，Reviewer 完成 `TRANSLATION-WORKFLOW.md` 對該 batch 適用的 gate：使用 approved implementation packet 時的 packet canonical-alignment、適用的 Class ability authored content／calculated presentation 的 grammar matrix，以及 translation batch 必要的明確 glossary-delta decision。本 Skill 只編排 gate，不重複其細節。

### Tooling / Skill

若需要額外 Agent skill：

- 預設 user-level／global 安裝，不裝進 repository。
- 安裝後確認 `git status` 仍乾淨。
- 不 commit skill、lockfile、symlink、Agent metadata 或 tooling 產物。
- 若產生未知 repo 檔案，停止回報；不要用 `git clean` 或改 `.gitignore` 掩蓋。
- execution skill 不得覆蓋 Batch Contract 或 authority。

## 6. Stage 1 — Local Implementation

預設從核准 `develop` 建 feature branch，只修改 In Scope，執行本批 verification；未明確授權時，不 push、不建 PR、不 merge。

preflight 通過後，正常 Stage 1 應連續完成：implementation → targeted verification → final local commit → Contract 要求時的 exact-HEAD verification → cumulative patch → final report。一般進度不是 STOP 點，也不需重複要求「繼續」；只有 Contract blocker、authority mismatch、unexpected scope issue、真正需要新 Owner decision，或 Contract 定義的 verification／repository anomaly 才停止。

Agent 回報只需：

- branch／HEAD。
- changed files。
- 核心 implementation approach。
- tests／fresh verification。
- canonical／data safety evidence（若相關）。
- working tree。
- deviations／risks／需要決策事項。

### Local-only Reviewer Patch Handoff

當 Reviewer 無法直接存取 Agent local workspace，且本批不允許 push／PR 時，local commit 不足以構成可審查 evidence。此時 Stage 1 收尾必須：

- 在 final local commit 且 working tree clean 後，輸出**完整 `Base..HEAD` patch**，不是逐 commit 或部分 diff。
- patch 寫在 repository 之外，避免污染 working tree。
- 對 patch 做 reverse-apply check，確認可還原。
- 記錄 patch byte size 與 SHA-256，供 Reviewer 核對 identity。
- patch 產生後再次確認 working tree clean。

Stage 2 correction 後，重新輸出**完整 `Base..HEAD` patch**，不只輸出 correction diff，讓 Reviewer 一次看到最終累積狀態。

本規則只定義 handoff workflow，不改變 Git authorization；未授權的 push／PR／history rewrite 仍然禁止。

### Exact-HEAD Verification Gate

當本批要求 CI-equivalent local checks 時，Stage 3 approval 前 final local commit 必須已存在、HEAD 已固定且 working tree clean；驗證只對該 exact HEAD 生效。其後任何 tracked-file change 都使 evidence 失效，必須先完成新的 authorized commit，再重新驗證。詳細執行與 evidence 語意依 `AGENT-TASK-CONTRACT.md`、`RISK-AND-VERIFICATION.md`。

## 7. Review — Two Passes

### Pass 1 — Requirement / Scope

確認 Goal／Acceptance、Owner 定稿、changed files、commit 與 scope；檢查是否有未授權 schema、ID、enum、reference、save format、canonical data 或 shared-architecture change。

### Pass 2 — Correctness / Evidence

確認 root cause、必要 call path／state／persistence 語意、public-behavior tests、critical callback／canonical values，以及最後變更後的 fresh evidence；核對 Agent claim 與實際 diff／tests／CI。

Verdict 與 Findings 直接依 `docs/REVIEWER-PRINCIPLES.md`。

## 8. Stage 2 — Focused Correction

第一輪 Review 有 blocker 時使用。若 Reviewer PASS 後、進入 Stage 3 前的 Owner manual acceptance 發現真正 blocker，也採用同樣的 focused-correction 方式：

- 只修 blocker，不夾帶重構或 Non-blocking Observation。
- 正常建立新 correction commit；不得 amend 已核准 commit。
- tracked correction 使舊 exact-HEAD evidence 失效，必須對新 HEAD 重新執行受影響範圍與必要 regression 的 fresh verification。
- Reviewer 只 focused verify correction 與新重大問題，並固定新的 approved HEAD。
- 不重開完成的 full Review，也不建立第三輪 full Review；新 HEAD 獲核准後才回到 Stage 3。

第二輪仍有結構性 blocker 時停止 patch loop。

已核准譯文的 singular／plural、`a/an`、大小寫、標點等純機械變體依 Principles 直接處理，不重新要求 Owner approval。

## 9. Manual Acceptance Gate

Reviewer PASS 後依 Risk 決定是否需要 Owner manual smoke。

Smoke 只驗自動測試難以證明的視覺、responsive 或真實 interaction，用少量代表性 flow；不要無目的全站巡覽。

Owner 人工驗收與必要測試通過後，功能／內容 Review 結束。若 acceptance 發現 blocker，依 Stage 2 的 post-PASS focused correction path 處理；不得因先前 PASS 忽略 finding，也不得帶著 stale exact-HEAD evidence 進入 Stage 3。

## 10. Stage 3 — Git / PR Closeout

前提：Reviewer PASS、必要人工驗收 PASS、approved HEAD 固定、working tree clean。

依 `GIT-SAFETY.md` 執行。

Stage 3 的 expected changed-files、commit count 等機械 evidence，應從已核准的 exact approved HEAD／完整 reviewed patch 與 actual Git state 繼承；其異常判定與 Contract clerical mismatch 處理以 `GIT-SAFETY.md` 的 **Approved Evidence Inheritance** 為唯一詳細 authority。

### Takeover / interrupted-execution recovery gate

若更換 Agent、Stage 3 中斷，或前一位執行者可能已做 GitHub write，接手者在任何 write 前必須先以 read-only 操作 reconcile actual repository state。至少確認 remote feature branch 是否存在與其 HEAD、是否已有 PR、PR state／base／head、CI state，以及目前的 `origin/develop`。

只有完成 reconciliation 後，才能判定要走正常 Stage 3 還是 recovery closeout。若 remote branch 已存在、PR 已建立或已 merge，或 remote history 與 local history 不同，不得假設舊 handoff 仍正確；不得直接 push、force push、rebase、reset、amend、重建 branch、建立第二個 PR 或重複 merge。

正常情況可一次授權：

**push → PR → verify diff／commits → CI → merge → sync `develop` → cleanup**

只有 repository／base／head／SHA、changed files、commit count、CI、mergeability、ancestry 或 code/history 出現異常時才停止回報。

### Required-CI Recovery

required CI failure 時停止 merge，先檢查實際 failed step 與 evidence。只有 Reviewer 明確授權範圍有限的 correction，才可在同一 branch／PR 加入一般 correction commit；不得自動修任意 CI failure，也不得改寫 history。correction 後重新取得 exact-HEAD evidence、正常 push、等待 CI；新的 green CI 仍須 Reviewer 驗證 correction 並固定新的 approved HEAD，才回到一般 pre-merge gate。詳細安全規則依 `GIT-SAFETY.md`。

### Merge method

Reviewer 依 Principles 與本批 history 選擇適合方式，並在 Stage 3 Contract 中**明確固定**。除非 Owner 或 repository policy 已指定，不需要每批再請 Owner 三選一。

### Repository safety

- `develop` = integration branch；`main` frozen，除非另行授權。
- 不得對 upstream write。
- 所有 `gh` write command 明確包含：

```bash
--repo boyiad2110/forgesteel-zh-tw
```

- merge 後同步 local／origin `develop`，安全清理 feature branch。
- 最終確認 working tree clean、`main` 未改。

## 11. Completion / Handoff

完成條件：Reviewer PASS、必要 CI／manual acceptance PASS、PR 依核准方式進 `develop`、local = origin/develop、feature branch 清理、working tree clean、`main` 未改、未開始下一批。

`docs/PROJECT-STATUS.md` 只在狀態真的需要維護時更新，不複製 PR body 或 test log。

Handoff 只保留：最新 `develop` baseline、現行 authority、已完成摘要、未完成／deferred、blocker／風險、下一個唯一目標、clone-specific safety、停止事項。歷史以 path／PR／SHA 引用，不重寫流水帳。

## 12. Efficiency

- 不重問已知資訊。
- 不重複相同 SHA／status 超過必要 gate。
- Agent report 採差異式。
- 不因文件完整感增加 blocker。
- 不建立平行規格文件。
- 小 fix 不順手重構 shared architecture。
- 每個額外 test、smoke、文件、Review 輪次或 Owner question 都必須降低具體風險。
- Reviewer 能處理的機械細節，不交回 Owner。
- 收尾後停止；下一批需要新的 Batch Contract。

## Self-Check

- [ ] 已讀最新 Owner decision 與 `docs/REVIEWER-PRINCIPLES.md`。
- [ ] 已固定 coherent Batch、scope、Acceptance、Risk、Stop。
- [ ] 驗證成本與風險相稱。
- [ ] 未自行決定新的中文遊戲術語。
- [ ] 未把純機械變體當 User Decision。
- [ ] 若使用 translation worksheet，我沒有把可機械推導的 rows 當成 Owner action。
- [ ] GitHub write target 明確為繁中 fork。
- [ ] Findings 依 Principles 分類。
- [ ] 未重開已核准內容。

## References

需要時才讀：

- `docs/REVIEWER-PRINCIPLES.md` — 權威原則與決策邊界。
- `RISK-AND-VERIFICATION.md` — Risk 與最低證據。
- `AGENT-TASK-CONTRACT.md` — Agent Stage contract。
- `GIT-SAFETY.md` — Git／PR／merge／cleanup safety。
- `FAILURE-MODES.md` — 常見失敗模式。
- `EVALUATION-SCENARIOS.md` — workflow evaluation。
- `docs/translation/TRANSLATION-WORKFLOW.md` — 翻譯工作表與 Class authored-content workflow。

修改本 Skill 時，至少重新執行與變更規則相關的 evaluation scenarios。
