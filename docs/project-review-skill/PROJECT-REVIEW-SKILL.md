---
name: forge-steel-reviewer
description: Use when reviewing, scoping, planning, handing off, or closing implementation, localization, testing, documentation, Git, or release batches in the boyiad2110/forgesteel-zh-tw project.
metadata:
  author: Forge Steel 中文版開發
  version: "0.8.1"
---

# Forge Steel Reviewer

## Purpose

本 Skill 是 Forge Steel 繁中專案的 **Reviewer 操作 workflow**。

權限、Findings、User Decision、Review limit、Batch 原則與翻譯決策邊界，以 `docs/REVIEWER-PRINCIPLES.md` 為準。本 Skill 不維護第二套政策。

> 先確認 authority 與唯一 Batch，再用與風險相稱的最低足夠證據完成實作、Review 與收尾；正常 handoff 優先在線上完成。

## 1. Load Authority

開始規劃、Review、Agent 任務、PR 收尾或 handoff 前：

1. 讀目前對話中專案負責人的最新明確決定。
2. 讀 `docs/REVIEWER-PRINCIPLES.md`（**mandatory authority loading**，不分 batch 類型）。
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
- **Manual acceptance**：`REQUIRED` 或 `NOT REQUIRED`。
- **Git permission**。
- **Report**。
- **Stop**。

Batch 大小依 Principles：優先 coherent、可獨立驗收的 UI／功能 slice。

固定 Batch Contract 前，translation batch 必須先執行 `docs/translation/TRANSLATION-WORKFLOW.md` 的 **Batch Cost Checkpoint**；其他 batch 在 scope 可比時比照其成本／risk 思考，不引入 identity count、LOC 或 file count 硬門檻。

缺少 Goal、scope、Acceptance 或 Stop，不開始實作。

### Level A Small Batch Fast Path

小型 Level A batch 仍由 Agent 執行 repository mutation；Reviewer 先完成 read-only planning／scope review，若不涉及產品行為、state／data、canonical／schema、翻譯語意或其他需要隔離的風險，優先使用下列 fast path：

- **第一次 write 前先完成 read-only review**：Reviewer 確認 authority、scope、必要 dependency 與預期 changed-file set；scope 尚未收斂時 Agent 不先寫、先開 PR 或先跑 CI。
- **採 surgical edit**：Agent 一次完成 coherent 修改 → self-review → 固定並 push final HEAD → 執行 risk-matched local／docs verification；Reviewer review exact remote HEAD 後才授權。Agent 只在 Stage 3 建立／reconcile PR，並取得該 exact HEAD 的 required CI 後才 merge。預期仍會有 tracked edit 時，不先消耗 final verification。
- **任何追加工作都重新過成本 gate**：若不是本批 Acceptance 必要、不是 blocker，也沒有立即降低具體風險，就列為 Non-blocking Observation／deferred，不因「順手」併入本批。
- **外部等待只是 gate，不是擴 scope 的空檔**：CI／remote wait 期間不另開無關調查；避免反覆輪詢沒有狀態變化的同一 evidence，只在必要 state transition 與 mutable pre-merge gate 重查。
- **Acceptance 達成後立即收斂**：只有 blocker／repository anomaly 才重新打開工作；其餘直接 closeout、STOP。

這個 fast path 不降低 Principles、required CI、Git safety 或 exact-HEAD evidence；它只要求用最低足夠步驟完成低風險小批次。

## 3. Online-first Handoff

正常 collaboration／handoff 依 `ONLINE-HANDOFF.md`：

- translation Owner workspace 預設使用 Google Sheet；
- 需要 Agent 時，Batch Contract／frozen implementation packet 預設使用同一個 GitHub Issue；
- Owner primary clone 可用且乾淨時，Agent 預設在同一 clone 從核准 `develop` 建 feature branch；這讓 Owner 可持續用既有 local dev server live preview。isolated worktree／另一 clone 只在 Owner 明確要求、primary clone 不可用或不乾淨／有衝突 Owner work，或 Contract 有具體 isolation risk 時使用，且必須明示；
- Agent Stage 1／Stage 2 結果預設 push feature branch，Reviewer review exact remote HEAD；
- Reviewer PASS 後，Reviewer 在同一 Issue 明確授權固定的 Stage 3；Agent 執行 GitHub writes，Reviewer 再唯讀複核實際整合結果；
- offline `.xlsx`／`.json`／`.md`／cumulative patch 只在 online path 無法安全完成時使用。

Online-first 只改 transport，不降低 translation canonical alignment、Owner approval、exact-HEAD review、CI 或 Git safety。

私人 Google Drive／Sheet URL 不預設放到 public GitHub Issue／PR；Agent 正常只需要 frozen Issue packet。

所有需要 repository mutation 的 batch（包含小型 Level A）都以同一 GitHub Issue 承載 compact Agent task／report；不因低風險而把 write 交給 Reviewer。

## 4. V1 Blocker Gate

遇到問題先問：

- 是否直接違反已核准 V1 requirement？
- 是否使實際功能無法使用？
- 是否危及 data、save compatibility、ID、enum、reference 或 canonical data？
- 是否造成明確安全／發布風險？
- 是否直接阻擋本批既定 flow？

只有有實際影響時才升級 blocker。問題來自 upstream 不代表可以降級；文件不漂亮也不代表 blocker。

## 5. Assign Risk and Evidence

- **Level A**：文件、已核准文案、無 state／data 影響的 display-only change。
- **Level B**：component behavior、state、filtering、lookup、fallback、locale switching。
- **Level C**：delete、import、storage、persistence、migration、schema、data-loss、security。

詳細：`RISK-AND-VERIFICATION.md`。

原則：

- 不把所有批次升成 Level C。
- 測 public behavior，不只測 implementation detail。
- critical interaction 不應被 mock 掉。
- 最後一次 tracked change 後取得 fresh evidence。
- Stage 1 預設只跑 risk-matched minimum sufficient evidence；目前 CI 已覆蓋的 full suite／build 不為形式重複。
- manual smoke 只補自動測試難以證明的 UI／responsive／interaction risk。

### Precedent Gate

若涉及既有 shared component、localization presenter、calculated grammar、fallback 或其他重複 architecture pattern，先查足以判定本批的近期 merged precedent、現行 code 與 tests。

不要求無限制考古；precedent 尚未查清前，不得把已存在 extension point 判成未知 architecture。

#### Scope-equivalence check

reuse recent precedent 前，先比較本批實際相關 boundary，至少包含適用者：

- base class／subclass；
- Ability／non-Ability；
- identity／traversal contract；
- supplemental fields；
- presenter／calculated extension point。

只重用真正 shared 的 architecture；batch-specific boundary 仍依本批 Contract 與 current authority 判定。

## 6. Prepare Agent Task

Agent 任務依 `AGENT-TASK-CONTRACT.md`，只寫本批差異與必要 gate，不重貼完整專案歷史或 stable rules。

正常 online-first route：

1. Reviewer 建立一個 Batch GitHub Issue；
2. Issue body 保存 Stage 1 full Contract；
3. translation packet 以 frozen revision comment 放在同一 Issue；
4. Agent 實作、驗證、normal commit、push feature branch；
5. Agent 在同一 Issue 回報 exact remote HEAD 後 STOP；
6. Reviewer review actual remote state。

**Stage 1 full task**至少包含 Goal、Authority、Base、In／Out scope、Acceptance、Risk、Manual acceptance、Git permission、Report、Stop。

### Stage 2 compact handoff

第一輪 Review 有 blocker 時，Reviewer 在同一 Issue 留 focused correction instruction，只需：

- original batch／current base／current HEAD；
- blocker；
- allowed files／forbidden collateral；
- focused acceptance／fresh verification；
- Git permission；
- Report／Stop。

Stage 2 不重貼完整 packet 或歷史。Agent 正常新 correction commit、push 同一 feature branch、回報新 exact HEAD 後 STOP。

### Stage 3 Authorization

Agent 在 Reviewer 明確授權前，execution boundary 止於 Stage 1／Stage 2。Batch Contract 必須固定 manual acceptance 為 `REQUIRED` 或 `NOT REQUIRED`：`NOT REQUIRED` 維持 normal Stage 3；`REQUIRED` 則分成 Stage 3A 與 Stage 3B。Reviewer 可先對 fixed HEAD／base 授權 Stage 3A，只建立／reconcile PR 並取得 exact-HEAD required CI，**不得 merge 或 cleanup，完成後 STOP**。Owner 必須在該 exact PR HEAD 完成 manual acceptance，Reviewer 記錄 PASS 後，才可發出綁定 unchanged HEAD／base／merge method 的 Stage 3B merge authorization。manual PASS 後任何 tracked 或 head change 都使該 acceptance 失效，必須依影響範圍重新 review／accept。

### Translation Worksheet Gate

translation batch 若需要 Owner 定稿，先讀 `docs/translation/TRANSLATION-WORKFLOW.md` 的 Worksheet 規格與 `ONLINE-HANDOFF.md`：

- Reviewer 先分類 Owner-required vs Reviewer-derived／mechanical；
- Owner request 只包含真正新術語、新譯名、新 prose 或語意取捨；
- 預設在 Owner 指定 Google Drive folder 建一批一份 native Google Sheet；
- Owner 在同一 Sheet 直接修改 Final zh-TW；
- Owner finalization 後 Reviewer 重新讀取 live exact cells，不從 preview／render 產生 packet；
- Sheet 是 mutable workspace，不是 Agent authority。

交付 implementation 前，Reviewer 完成 `TRANSLATION-WORKFLOW.md` 對該 batch 適用的 gate：

- post-Owner final packet canonical alignment；
- GitHub frozen packet publish 後的 payload read-back；
- Agent final approved zh-TW → production catalog exact reconciliation；
- Calculated Path Discovery Gate／grammar matrix；
- glossary delta decision；
- 其他 batch-specific safety。

frozen implementation packet 依 `ONLINE-HANDOFF.md` 放到 GitHub Issue；Stage 1 開始後若 packet mechanical defect 需要修正，發行新 revision，不靜默改寫舊 authority。

### Packet Canonical Alignment timing

依 `TRANSLATION-WORKFLOW.md` 固定三層：

1. worksheet 交 Owner 前；
2. Owner finalization 後、packet freeze／Agent handoff 前；
3. Agent implementation preflight。

Reviewer artifact 的 newline／whitespace／Markdown／snapshot／hash／identity drift 由 Reviewer 修正，不包裝成 Owner decision，也不應等 Agent 第一次發現。

GitHub freeze 發布後、Agent authorization 前，Reviewer 必須從實際 Issue payload read-back 重新核對 packet identity、exact zh-TW／canonical values、revision 與提供時的 payload SHA。Agent preflight 是獨立的第二道 guard，不是正常流程第一次發現 Reviewer publish artifact defect 的地方。

### Repository-native localization primitives

適用時優先沿用：

- `src/localization/test-support/packet-canonical-alignment.ts` 的 `verifyPacketCanonicalAlignment`、`calculateCanonicalSha256`；
- `src/localization/test-support/approved-translation-catalog-reconciliation.ts` 的 `verifyApprovedTranslationsAgainstCatalog`；
- `src/localization/test-support/localization-differential-invariants.ts` 的 `protectCanonicalState`、`verifyLocaleDifferentialInvariants`、`assertCanonicalEnglishCalculationInput`；
- `src/localization/test-support/localization-presentation-test-harness.tsx` 的 shared presentation scaffolding。

這些 helper 依 risk opt-in，不建立第二套 denominator，也不取代 class-specific public-behavior assertions。

translation Stage 1 implementation 完成後，Agent 必須用 frozen approved packet 的 in-scope slice 與實際 production catalog 執行 exact identity／zh-TW reconciliation；這是 batch-time evidence，不保存成 historical denominator。

每一個適用的 calculated presentation matrix row 都必須在 Agent Task 中對應到明確的 Hero／no-Hero／pass-through public-behavior assertion（依該 row 實際存在的 path）；測試不得刻意鎖定與 matrix 相反的行為。

### Class／Subclass Level 1 Non-Ability Required Identity

直接依 `docs/translation/TRANSLATION-WORKFLOW.md` 同名規則與 current live code，不在每個 class batch 重開 scope 辯論。需要改 shared traversal contract 時，必須由 Batch Contract 明確授權 shared-architecture change。

### Repository-native Localization Verification

translation pipeline command 與完整語意以目前 `docs/translation/TRANSLATION-WORKFLOW.md`、`package.json` scripts 與 live CI 為準，不在本 Skill 維護另一份硬編 command 清單。

## 7. Stage 1 — Agent Implementation and Remote Review Branch

online-first 預設 Stage 1 使用 **remote reviewer branch**。

Agent：

- Owner primary clone 可用且乾淨時，在該 clone 確認核准 `develop`／base 後建立或切換 Contract 指定 feature branch；不直接在 `develop` 實作，也不為一般安全理由改用 isolated worktree／另一 clone；
- 只修改 In Scope；
- 執行 risk-matched targeted verification；
- 建立 normal final commit；
- 確認 clean tree；
- push 唯一 feature branch；
- 確認 local／remote HEAD 一致；
- 在 Batch Issue 回報完整 40-character HEAD 與必要 evidence；
- STOP。

Stage 1 不可建立 PR、merge、改 `develop`、rebase、reset、amend、force push 或自行開始 Stage 3。

若 remote 不可用、Reviewer 無法讀 exact remote HEAD，或 Contract 明確要求 local-only，才使用 `AGENT-TASK-CONTRACT.md` 的 cumulative patch fallback。

## 8. Review — Two Passes

### Pass 1 — Requirement / Scope

確認 Goal／Acceptance、Owner 定稿、changed files、commit 與 scope；檢查是否有未授權 schema、ID、enum、reference、save format、canonical data 或 shared-architecture change。

### Pass 2 — Correctness / Evidence

確認必要 call path／state／persistence 語意、public-behavior tests、critical callback／canonical values，以及最後變更後的 fresh evidence；核對 Agent claim 與 actual remote diff／tests／CI evidence。

Verdict 與 Findings 直接依 `docs/REVIEWER-PRINCIPLES.md`。

Agent 自述不是獨立證據。

## 9. Stage 2 — Focused Correction

第一輪 Review 有 blocker，或 Reviewer PASS 後 manual acceptance 發現真正 blocker時使用：

- 只修 blocker，不夾帶重構或 Non-blocking Observation；
- 正常建立新 correction commit，不 amend 已審 history；
- tracked correction 使舊 exact-HEAD evidence 失效；
- Agent 重跑受影響 fresh verification、push 同一 feature branch、回 Issue 後 STOP；
- Reviewer 只 focused verify correction 與新重大問題，固定新 approved HEAD。

第二輪仍有結構性 blocker 時停止 patch loop，不進第三輪 full Review。

## 10. Manual Acceptance Gate

Reviewer PASS 後依 Risk 決定是否需要 Owner manual smoke。

只驗自動測試難以證明的視覺、responsive 或真實 interaction，用少量代表性 flow；不要無目的全站巡覽。

若 acceptance 發現 blocker，回 Stage 2 focused correction；不得帶 stale exact-HEAD evidence 進 Stage 3。

## 11. Stage 3 — Reviewer-Authorized Agent Git / PR Closeout

前提：Reviewer PASS、必要 manual acceptance PASS，且 approved HEAD、base 與 merge method 均已固定。

Reviewer 依 `GIT-SAFETY.md` 與 `ONLINE-HANDOFF.md` 先唯讀確認 remote state，然後在同一 Batch Issue 發出 explicit Stage 3 authorization。Reviewer 不在正常流程中自行修改 repository files、branches、PR 或 merge state。

### Read-only reconciliation first

任何 GitHub write 前先查 actual remote state：

- feature branch 是否存在與 exact HEAD；
- 是否已有 PR，以及 state／base／head／head SHA；
- required CI state；
- current `develop`；
- frozen `main`；
- approved HEAD 的 actual commits／changed files／tree evidence。

不得用先前 handoff 文字取代 actual GitHub state。

### Authorization and normal closeout

Issue authorization 至少固定 approved full HEAD、base、merge method、expected PR target／head、required CI／mutable gate、cleanup requirement 與 Report／Stop。Agent 接獲後依該 authorization 執行：

**PR → verify diff／commits → exact-HEAD CI → mutable pre-merge gate → merge → result check → post-merge CI → available remote cleanup → report and STOP**

Agent 不得在 Stage 3 作新的 product、scope 或 translation 決策；任何 repository／base／head／SHA、changed files、commit count、CI、mergeability、ancestry／tree、canonical safety 或其他實質 anomaly 都必須 STOP 並回報 Reviewer。

### Merge method

Reviewer 依 Principles 與 batch history固定 merge method；除非 Owner／repository policy已指定，不需要每批再請 Owner選擇。

### Required-CI Recovery

required CI failure 一律停止 merge。Reviewer先讀 failed step／evidence，再決定是否發 Stage 2 bounded correction；Agent 不得在 Stage 3 偷改 code、amend、rebase、reset 或 force push。

### Post-merge reconciliation

Batch Closed 前至少獨立確認：

- PR 確實 merged；
- merge result SHA／topology／method 正確；
- required CI 在 approved PR HEAD 成功；
- `develop` 指向預期 merge result；
- post-merge CI（若有）在 exact merge result 成功；
- `main` 未改；
- canonical／data safety evidence（若本批相關）；
- feature branch cleanup 已完成，或唯一剩餘事項符合 `ONLINE-HANDOFF.md` 明確允許的 tooling-limited non-blocking housekeeping。

Reviewer 在 Agent Stage 3 report 後，獨立唯讀複核 remote PR、merge、`develop`、`main`、CI、topology 與 cleanup 狀態，才可宣告 Batch Closed。

## 12. Completion / Handoff

完成條件：

- Reviewer PASS；
- 必要 CI／manual acceptance PASS；
- PR 依核准方法進 `develop`；
- remote reconciliation PASS；
- `main` 未改；
- 可執行的 cleanup 完成，或只剩明確允許的 non-blocking housekeeping；
- 若本批使用 Batch Issue，Reviewer 在 final remote reconciliation PASS 後明確 close Issue；因 PR target 是 `develop` 而 default branch 是 `main`，不得倚賴 PR closing keyword；
- 未開始下一批。

Owner／其他開發者可之後正常 fast-forward 自己的 local `develop`；外部 local clone 未同步本身不是 remote Batch Closed blocker。

`docs/PROJECT-STATUS.md` 只在狀態真的需要維護時更新，不複製 Issue／PR／CI 流水帳。

Handoff 只保留：最新 `develop` baseline、現行 authority、完成摘要、未完成／deferred、blocker／風險、下一個唯一目標與必要 safety。

## 13. Efficiency

- Online-first：能共用同一 Sheet／Issue／branch 就不反覆傳離線 artifact。
- 不重問已知資訊。
- 不重複相同 SHA／status 超過必要 gate。
- Agent report 採差異式。
- 不因文件完整感增加 blocker。
- 不建立平行 progress denominator。
- 小 fix 不順手重構 shared architecture。
- Reviewer 能處理的機械細節，不交回 Owner。
- Reviewer PASS 後只在同一 Batch Issue 發出綁定 exact state 的 Stage 3 Agent authorization。
- 收尾後 STOP；下一批需要新的 Batch Contract，只有需要 Agent handoff 時才要求新的 Batch Issue。

## Self-Check

- [ ] 已讀最新 Owner decision 與 `docs/REVIEWER-PRINCIPLES.md`。
- [ ] 已固定 coherent Batch、scope、Acceptance、Risk、Stop。
- [ ] 小型 Level A Agent-executed batch 已在第一次 write 前完成 Reviewer read-only review，且未因等待或順手 cleanup 擴張 scope。
- [ ] 已依 `ONLINE-HANDOFF.md` 選擇最小安全 transport。
- [ ] 若 translation worksheet 需要 Owner，已先處理 mechanical rows，並從 live exact cells 取得 final authority。
- [ ] 若使用 packet，已完成 required canonical alignment 並 freeze 明確 revision。
- [ ] Agent 只在 Reviewer 對 exact approved state 的明確授權後執行 Stage 3。
- [ ] Reviewer review 依 actual remote evidence，不只信 Agent report。
- [ ] Stage 3 GitHub write target 明確為繁中 fork。
- [ ] Findings 依 Principles 分類。
- [ ] 未重開已核准內容。

## References

### Mandatory

- `docs/REVIEWER-PRINCIPLES.md` — 權威原則與決策邊界。

### Core workflow

- `ONLINE-HANDOFF.md` — online-first Sheet／Issue／Agent boundary／authorized Agent Stage 3 transport。
- `AGENT-TASK-CONTRACT.md` — Agent Stage 1／Stage 2／authorized Stage 3 contract。
- `GIT-SAFETY.md` — Git／PR／merge／cleanup safety。
- `RISK-AND-VERIFICATION.md` — Risk 與最低證據。

### Conditional

- `FAILURE-MODES.md` — 常見失敗模式。
- `EVALUATION-SCENARIOS.md` — workflow evaluation。
- `docs/translation/TRANSLATION-WORKFLOW.md` — translation worksheet、packet、canonical alignment、glossary、calculated presentation workflow。

修改本 Skill 時，至少以變更規則相關的 evaluation scenarios／等價 thought experiment 檢查是否產生 authority、Stage boundary、Git safety 或 translation packet contradiction。
