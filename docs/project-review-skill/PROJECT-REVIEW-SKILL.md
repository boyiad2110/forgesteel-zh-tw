---
name: forge-steel-reviewer
description: Use when reviewing, scoping, planning, handing off, or closing implementation, localization, testing, documentation, Git, or release batches in the boyiad2110/forgesteel-zh-tw project.
metadata:
  author: Forge Steel 中文版開發
  version: "0.6.2"
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
- **Git permission**。
- **Report**。
- **Stop**。

Batch 大小依 Principles：優先 coherent、可獨立驗收的 UI／功能 slice。

固定 Batch Contract 前，translation batch 必須先執行 `docs/translation/TRANSLATION-WORKFLOW.md` 的 **Batch Cost Checkpoint**；其他 batch 在 scope 可比時比照其成本／risk 思考，不引入 identity count、LOC 或 file count 硬門檻。

缺少 Goal、scope、Acceptance 或 Stop，不開始實作。

### Level A Small Batch Fast Path

Reviewer 直接執行的小型 Level A batch，若不涉及產品行為、state／data、canonical／schema、翻譯語意或其他需要隔離的風險，優先使用下列 fast path：

- **第一次 write 前先完成 read-only review**：確認 authority、scope、必要 dependency 與預期 changed-file set；scope 尚未收斂時不要先寫、先開 PR 或先跑 CI。
- **採 surgical edit**：一次完成 coherent 修改 → self-review → 固定 final HEAD → 依 repository policy 執行本批適用的 exact-HEAD CI → Reviewer Stage 3。預期仍會有 tracked edit 時，不先消耗 final CI。
- **純 docs-only Level A 可免 application CI**：若 actual changed-file set 全部位於 `docs/**`，且 repository workflow 對該集合明確不觸發 application CI，Reviewer 將 application CI 記為 **not applicable**，不為形式補跑 Node／TypeScript／localization／test／build。只要出現任何非 `docs/**` tracked change，就回到一般 CI gate。
- **任何追加工作都重新過成本 gate**：若不是本批 Acceptance 必要、不是 blocker，也沒有立即降低具體風險，就列為 Non-blocking Observation／deferred，不因「順手」併入本批。
- **外部等待只是 gate，不是擴 scope 的空檔**：CI／remote wait 期間不另開無關調查；避免反覆輪詢沒有狀態變化的同一 evidence，只在必要 state transition 與 mutable pre-merge gate 重查。
- **Acceptance 達成後立即收斂**：只有 blocker／repository anomaly 才重新打開工作；其餘直接 closeout、STOP。

這個 fast path 不降低 Principles、Git safety 或 exact-HEAD evidence；`required CI` 只指 repository policy 對本批實際適用的 CI gate。

## 3. Online-first Handoff

正常 collaboration／handoff 依 `ONLINE-HANDOFF.md`：

- translation Owner workspace 預設使用 Google Sheet；
- 需要 Agent 時，Batch Contract／frozen implementation packet 預設使用同一個 GitHub Issue；
- Agent Stage 1／Stage 2 結果預設 push feature branch，Reviewer review exact remote HEAD；
- Reviewer PASS 後，Stage 3 由 Reviewer 直接執行；不再建立 Stage 3 Agent Task；
- offline `.xlsx`／`.json`／`.md`／cumulative patch 只在 online path 無法安全完成時使用。

Online-first 只改 transport，不降低 translation canonical alignment、Owner approval、exact-HEAD review、CI 或 Git safety。

私人 Google Drive／Sheet URL 不預設放到 public GitHub Issue／PR；Agent 正常只需要 frozen Issue packet。

Reviewer 直接完成、沒有 Agent handoff 的小型 batch 不要求為形式建立 GitHub Issue。

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

**Stage 1 full task**至少包含 Goal、Authority、Base、In／Out scope、Acceptance、Risk、Git permission、Report、Stop。

### Stage 2 compact handoff

第一輪 Review 有 blocker 時，Reviewer 在同一 Issue 留 focused correction instruction，只需：

- original batch／current base／current HEAD；
- blocker；
- allowed files／forbidden collateral；
- focused acceptance／fresh verification；
- Git permission；
- Report／Stop。

Stage 2 不重貼完整 packet 或歷史。Agent 正常新 correction commit、push 同一 feature branch、回報新 exact HEAD 後 STOP。

### No Agent Stage 3

Agent execution boundary 正常止於 Stage 1／Stage 2。Reviewer PASS 後直接進本 Skill 第 11 節 Stage 3；不得為了 closeout 再建立 Stage 3 Agent Task。

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

### Repository-native localization primitives

適用時優先沿用：

- `src/localization/test-support/packet-canonical-alignment.ts` 的 `verifyPacketCanonicalAlignment`、`calculateCanonicalSha256`；
- `src/localization/test-support/localization-differential-invariants.ts` 的 `protectCanonicalState`、`verifyLocaleDifferentialInvariants`、`assertCanonicalEnglishCalculationInput`；
- `src/localization/test-support/localization-presentation-test-harness.tsx` 的 shared presentation scaffolding。

這些 helper 依 risk opt-in，不建立第二套 denominator，也不取代 class-specific public-behavior assertions。

### Class／Subclass Level 1 Non-Ability Required Identity

直接依 `docs/translation/TRANSLATION-WORKFLOW.md` 同名規則與 current live code，不在每個 class batch 重開 scope 辯論。需要改 shared traversal contract 時，必須由 Batch Contract 明確授權 shared-architecture change。

### Repository-native Localization Verification

translation pipeline command 與完整語意以目前 `docs/translation/TRANSLATION-WORKFLOW.md`、`package.json` scripts 與 live CI 為準，不在本 Skill 維護另一份硬編 command 清單。

## 7. Stage 1 — Agent Implementation and Remote Review Branch

online-first 預設 Stage 1 使用 **remote reviewer branch**。

Agent：

- 從核准 `develop`／base 建 feature branch；
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

## 11. Stage 3 — Reviewer Git / PR Closeout

**Stage 3 由 Reviewer 執行。**

前提：Reviewer PASS、必要 manual acceptance PASS、approved HEAD 固定。

依 `GIT-SAFETY.md` 與 `ONLINE-HANDOFF.md` 執行，預設 remote-first。

### Read-only reconciliation first

任何 GitHub write 前先查 actual remote state：

- feature branch 是否存在與 exact HEAD；
- 是否已有 PR，以及 state／base／head／head SHA；
- applicable required CI state；
- current `develop`；
- frozen `main`；
- approved HEAD 的 actual commits／changed files／tree evidence。

不得用先前 handoff 文字取代 actual GitHub state。

### Normal closeout

正常可連續完成：

**reconcile → PR → verify diff／commits → applicable exact-HEAD CI → mutable pre-merge gate → merge → merge-result reconciliation → applicable post-merge CI → available remote cleanup → close Batch Issue（若本批使用 Issue）**

純 `docs/**` Level A 若依 repository workflow 不會觸發 application CI，則兩個 CI 節點均記為 not applicable；其餘 batch 維持一般 CI gate。

只有 repository／base／head／SHA、changed files、commit count、CI、mergeability、ancestry／tree、canonical safety 或其他實質 anomaly 才停止。

### Merge method

Reviewer 依 Principles 與 batch history固定 merge method；除非 Owner／repository policy已指定，不需要每批再請 Owner選擇。

### Required-CI Recovery

required CI failure 一律停止 merge。Reviewer先讀 failed step／evidence，再決定是否發 Stage 2 bounded correction；不得在 Stage 3 偷改 code、amend、rebase、reset 或 force push。

### Post-merge reconciliation

Batch Closed 前至少獨立確認：

- PR 確實 merged；
- merge result SHA／topology／method 正確；
- required CI 在 approved PR HEAD 成功（若本批適用）；
- `develop` 指向預期 merge result；
- post-merge CI 在 exact merge result 成功（若 repository workflow 對該 merge result 啟動）；
- `main` 未改；
- canonical／data safety evidence（若本批相關）；
- feature branch cleanup 已完成，或唯一剩餘事項符合 `ONLINE-HANDOFF.md` 明確允許的 tooling-limited non-blocking housekeeping。

Reviewer 不需要為了觀察或同步外部 Agent local workspace，把 Stage 3 重新交回 Agent。

## 12. Completion / Handoff

完成條件：

- Reviewer PASS；
- 必要 CI／manual acceptance PASS；
- PR 依核准方法進 `develop`；
- remote reconciliation PASS；
- `main` 未改；
- 可執行的 cleanup 完成，或只剩明確允許的 non-blocking housekeeping；
- 若本批使用 Batch Issue，Issue 已 close；
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
- Reviewer PASS 後不再建立 Stage 3 Agent handoff。
- 收尾後 STOP；下一批需要新的 Batch Contract，只有需要 Agent handoff 時才要求新的 Batch Issue。

## Self-Check

- [ ] 已讀最新 Owner decision 與 `docs/REVIEWER-PRINCIPLES.md`。
- [ ] 已固定 coherent Batch、scope、Acceptance、Risk、Stop。
- [ ] 小型 Level A Reviewer-direct batch 已在第一次 write 前完成 read-only review，且未因等待或順手 cleanup 擴張 scope。
- [ ] 若本批是純 `docs/**` Level A，已從 actual changed-file set 確認 application CI 是否依 repository workflow 為 not applicable；只要有任何非 docs tracked change 就沒有套用豁免。
- [ ] 已依 `ONLINE-HANDOFF.md` 選擇最小安全 transport。
- [ ] 若 translation worksheet 需要 Owner，已先處理 mechanical rows，並從 live exact cells 取得 final authority。
- [ ] 若使用 packet，已完成 required canonical alignment 並 freeze 明確 revision。
- [ ] Agent 只執行 Stage 1／必要 Stage 2，沒有被交付 Stage 3。
- [ ] Reviewer review 依 actual remote evidence，不只信 Agent report。
- [ ] Stage 3 GitHub write target 明確為繁中 fork。
- [ ] Findings 依 Principles 分類。
- [ ] 未重開已核准內容。

## References

### Mandatory

- `docs/REVIEWER-PRINCIPLES.md` — 權威原則與決策邊界。

### Core workflow

- `ONLINE-HANDOFF.md` — online-first Sheet／Issue／Agent boundary／Reviewer Stage 3 transport。
- `AGENT-TASK-CONTRACT.md` — Agent Stage 1／Stage 2 contract。
- `GIT-SAFETY.md` — Git／PR／merge／cleanup safety。
- `RISK-AND-VERIFICATION.md` — Risk 與最低證據。

### Conditional

- `FAILURE-MODES.md` — 常見失敗模式。
- `EVALUATION-SCENARIOS.md` — workflow evaluation。
- `docs/translation/TRANSLATION-WORKFLOW.md` — translation worksheet、packet、canonical alignment、glossary、calculated presentation workflow。

修改本 Skill 時，至少以變更規則相關的 evaluation scenarios／等價 thought experiment 檢查是否產生 authority、Stage boundary、Git safety 或 translation packet contradiction。
