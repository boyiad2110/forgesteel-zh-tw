# Agent Task Contract

## 文件角色

本文件定義 Agent 任務需要具備的最小 contract 與 Stage 邊界。

Reviewer 的權限、Findings、User Decision 與翻譯決策邊界以 `docs/REVIEWER-PRINCIPLES.md` 為準；本文件不重複維護第二套政策。

Agent 任務應以「本批差異」為主，穩定的專案規則優先引用既有文件，不重寫完整專案歷史。應引用 `PROJECT-REVIEW-SKILL.md`、本 Contract、`GIT-SAFETY.md`、`RISK-AND-VERIFICATION.md` 與 `TRANSLATION-WORKFLOW.md`；本批特有 risk、禁止事項、SHA、merge method、scope、acceptance 與 STOP rule 仍須明列。

## 任務必備欄位

每份 Agent 任務至少包含：

1. **Goal**：唯一、可驗證的使用者可見或工程結果。
2. **Authority**：支持本批的現行需求／Owner decision。
3. **Base**：branch 與預期起點。
4. **In scope**：允許修改內容。
5. **Out of scope**：不得順手處理內容。
6. **Acceptance**：完成條件。
7. **Risk Level**：Level A／B／C。
8. **Git permission**：是否允許 commit、push、PR、merge、cleanup。
9. **Report**：只回報 Reviewer 決策所需證據。
10. **Stop**：完成後停止，不開始下一批。

Batch 預設應是 coherent、可獨立驗收的 UI／功能 slice；不要因為單一詞彙、單一 call site 或單一小檔案而無必要拆成獨立批次。

## Tooling / Skill

若任務需要額外 Agent skill／tooling：

- 預設安裝在 user-level／global，不安裝進 repository。
- 安裝後確認 repository `git status` 仍乾淨。
- 不 commit skill、lockfile、symlink、Agent metadata 或 installer 產物。
- 若 installer 在 repository 產生未知檔案，停止並回報；不要用 `git clean`、reset 或修改 `.gitignore` 掩蓋。
- execution skill 只輔助實作／驗證，不得覆蓋 Batch Contract、Owner decision 或 repository authority。

執行 package-manager-dependent command、dependency install 或 recovery 前，先讀 repository 的 `package.json` scripts／`packageManager`（若有）、lockfile 與 `.npmrc`／相關 config，並依這些 repository evidence 選擇 npm、pnpm 或 yarn。global 可用的 package manager 不構成自行換工具的理由；例如有 `package-lock.json` 且 scripts／config 指向 npm 時，不得改用 pnpm。只有 evidence 真正衝突且會影響安全執行時才 STOP。

## Translation Boundary

Agent 不得自行建立新的中文遊戲術語或改變已核准語意。

但當核心譯文已由 Owner 核准後，以下不改變語意的機械變體可依 Contract／Reviewer 指示直接處理，不需逐項要求新的 Owner approval：

- singular／plural。
- `a/an`。
- 大小寫。
- 不改變語意的標點。
- 英文 plural `s`。
- dynamic placeholder 周圍的純文法調整。

若出現新的詞義、術語或真正翻譯取捨，停止並回報 Reviewer。

### Class Ability Authored Content

Class ability authored-content task 必須依 `docs/translation/TRANSLATION-WORKFLOW.md` 的 `Class Ability Authored Content` 規格。若同一內容同時出現在 Hero 與 no-Hero surface，Batch Contract 必須分別列出兩條 presentation path 的 Acceptance，不得以其中一條 PASS 推定另一條 PASS。新 calculated grammar 若沒有現行 authority 或安全 projection，不得自行建立中文 parser／calculator 或新翻譯；依 Workflow fallback 或 STOP。

### Approval 的作用範圍

translation approval 依 surface、localization identity 與 semantic context 生效，不是依 canonical English 字面生效。

- 相同 canonical English 可以在不同 context 擁有不同的 approved zh-TW。
- Agent 不得因為字面相同就自行 deduplicate、unify、overwrite 或改寫其他 surface 的已核准譯文。
- 只有 Owner 明確要求全域統一時才合併。
- 發現疑似不一致時列為回報事項，不自行處理。

### Worksheet Identity and Owner Override

相同 `canonicalEnglish` 不自動構成可機械重用的關係。只有 rows 的相關 semantic／presentation context 相同，且既有 authority 支持時才可重用；同一 canonical label 可因不同 Feature identity 或 presentation role 而有不同 Owner-approved reading。

`Reviewer-derived／mechanical` classification 表示該 row 不需要 Owner action，不限制 Owner 編輯 `Final zh-TW`。Owner 明確改動 Final value 時，最新 Owner value 即為 authority；後續 worksheet normalization／packet generation 必須依 identity 記錄該 override，不得靜默還原先前 mechanical suggestion。

### Repository-native Localization Verification Primitives

若 Batch Contract 涉及相應 requirement，Agent 先檢查並沿用目前 repository 的 reusable helper，不自行建立新的 generic localization framework。`src/localization/test-support/localization-differential-invariants.ts` 提供 locale round-trip differential assertion、protected canonical state，以及 canonical-English calculation boundary 的 primitives；`src/localization/test-support/packet-canonical-alignment.ts` 提供 approved packet 與 live canonical 的 machine alignment、exact identity／snapshot／hash evidence。

這些 helper 只在 Contract 的實際 risk 適用時使用，不取代 Contract-specific public-behavior tests，也不因存在就自行增加 batch scope。Agent 不得自行新增 npm command、變更 manifest denominator，或以文件中可能過期的 command assumption 覆蓋 current package scripts／current repository code。

## Reviewer Patch Handoff

當 Reviewer 無法直接存取 Agent local workspace，且 Contract 不允許 push／PR 時，Stage 1／Stage 2 收尾必須附上可審查的 patch evidence：

- 在 final local commit 且 working tree clean 後，輸出**完整 `Base..HEAD` patch**，不是逐 commit 或部分 diff。
- patch 寫在 repository 之外。
- 對 patch 做 reverse-apply check。
- 記錄 patch byte size 與 SHA-256。
- patch 產生後再次確認 working tree clean。
- Stage 2 correction 後重新輸出完整 `Base..HEAD` patch，不只輸出 correction diff。
- 當該 final HEAD 將成為 Reviewer approval 或 Stage 3 input 時，final report 必須提供 `git rev-parse HEAD` 的完整 40-character commit SHA；abbreviated SHA、UI hyperlink label 或 `abcd1234...` 不足以固定 approved HEAD。

建議 patch 使用可決定性檔名 `<Batch>_<Stage>_<HEAD-short>_Cumulative.patch`。final report 必須將確切 path／filename、完整 HEAD、byte size、SHA-256、`Base..HEAD` range 與 reverse-apply 結果配對回報，避免交接到錯誤 patch。

本節只定義 handoff workflow，不擴張 Git permission。

## Stage 1 — Local Implementation

Agent：

- 從核准的 `develop`／base 建立 feature branch。
- 只修改 Batch Contract In Scope。
- 依 Risk Level 執行最低足夠驗證。
- 使用 public-behavior tests 保護本批 requirement；不要為 coverage 擴張成不必要的 E2E／Level C。
- 最後一次 code change 後取得 fresh verification。
- 依 Git permission 建立 local commit；未明確授權時，不 push、不建 PR、不 merge。
- 完成後停止並回報。

preflight 成功後，Agent 連續完成已授權的 implementation、verification、local commit、patch handoff 與 final report；正常中間進度不是 STOP 條件。只有 Contract blocker、authority mismatch、unexpected scope issue、真正需要 Owner decision，或 Contract 定義的 verification／repository anomaly 才停止。

### Exact-HEAD CI Mirror Evidence

當 Contract 要求 CI-equivalent local evidence，順序固定為：

1. 完成授權 edits 並建立 final local commit。
2. 記錄完整 40-character HEAD 並確認 working tree clean。
3. 讀取**目前** repository CI workflow／與本批相關的 commands。
4. 執行 Contract 指定且可在 local 重現的 required gates。
5. 保存真實 exit code、failure／warning 與 summary evidence。

不得把 `lint`／`tsc`／`vitest`／`build` 永久硬編為通用 CI 定義；目前 CI workflow 與本批 Risk Contract 優先。任何 tracked-file change 發生在 exact-HEAD verification 後，都使該 evidence 對 final HEAD 失效；先完成新的 authorized commit、重新確認 clean tree，再重跑 required verification。

### Translation Packet Preflight

從 approved packet 實作前，驗證 Contract 提供的 packet identity／revision／SHA（若有）、預期 source／base authority，以及 live canonical alignment。適用時優先使用 `src/localization/test-support/packet-canonical-alignment.ts` 的 current repository primitive，取得 machine-verifiable exact identity／snapshot／hash evidence。任何 canonical snapshot 差異（包括 newline、whitespace、Markdown 或 structured-text identity）或 alignment issue 都必須在 implementation 前 STOP；不得自行重建、修補或 normalize Reviewer packet authority。最新 authorized packet revision 取代較舊 revision。

Reviewer：

- 審查實際 code／diff／tests，不只依賴 Agent 自述。
- 依 `docs/REVIEWER-PRINCIPLES.md` 判定 PASS、CHANGES REQUESTED 或 USER DECISION REQUIRED。

## Stage 2 — Focused Correction

第一輪 Review 有 blocker 時使用；Reviewer PASS 後、Stage 3 前的 Owner manual acceptance 若發現真正 blocker，也使用同樣的 focused correction，不重開 full Review。

Agent：

- 只修 blocker。
- 不夾帶 Non-blocking Observation、重構或下一批內容。
- 重新執行受影響範圍與必要 regression 的 fresh verification。
- correction commit／history 依 Contract 執行，不自行 amend／rebase 已核准 commit。
- tracked correction 使舊 exact-HEAD evidence 失效；以正常新 commit 固定新 HEAD 後，重跑受影響 fresh verification。
- 回報後停止。

Reviewer：

- 第二輪只檢查 correction 與是否產生新的重大問題。
- 第二輪仍有結構性 blocker 時停止 patch loop，重新評估方案／scope。
- 不因非阻擋觀察要求第三輪。
- post-PASS correction 只 focused verify acceptance finding 與新重大問題，固定新 approved HEAD 後回到 Stage 3。

## Manual Acceptance

Reviewer PASS 後，只有自動測試難以證明的 UI／responsive／真實 interaction risk 才要求 manual smoke。

Manual smoke 應使用少量代表性 flow，不把每一批都升級成全站人工驗收。

若 Contract 指定 Owner manual acceptance gate，Agent 不得自行把 smoke 結果視為 Owner approval。

## Stage 3 — Git／PR Closeout

### 接手或中斷後的第一步

接手既有 Stage 3，或前一位 Agent 可能已做 GitHub write 時，第一步一律是 read-only reconciliation，而不是照舊 handoff 直接續跑。先查 remote branch 與 HEAD、PR 是否存在及其 state／base／head、CI、`origin/develop`，並在需要時確認 ancestry 與 tree equivalence。

未確認 actual remote state 前，不得 push、force push、rebase、reset、amend、重建 branch、建立第二個 PR 或重複 merge。reconciliation 後再由 evidence 決定正常 Stage 3 或 recovery closeout。

只有下列條件成立時執行：

- Reviewer PASS。
- 必要人工驗收 PASS。
- approved HEAD 固定。
- working tree clean。
- merge method 已由 Stage 3 Contract 明確固定。

### 預設可一次完成

若 Reviewer 已明確授權完整 Stage 3，Agent 可在同一任務中依序完成：

**push → PR → verify diff／commits → CI → pre-merge gate → merge → sync `develop` → cleanup**

不需要在每個正常 gate 後停下等一次新的授權。

### 只有異常才停止

以下任一情況出現時立即停止並回報：

- repository／owner 不符。
- base／head／approved SHA 不符。
- commit count／changed files 超出 Contract。
- `develop` 在等待 CI 期間移動。
- required CI failure。
- unexpected conflict／mergeability 問題。
- merge result／ancestry 不符。
- branch cleanup 出現不符合預期的安全警訊。

不得為了繼續流程自行 rebase、reset、amend、force push 或改 code。

### Approved Evidence Inheritance

Reviewer PASS 且已取得 exact approved HEAD 或完整 reviewed patch 時，Stage 3 Contract 的 expected changed-files、commit count 等機械欄位直接從該已審 evidence 與 actual Git state 取得，不人工另抄一套。詳細異常判定與 clerical mismatch 處理以 `GIT-SAFETY.md` 的 **Approved Evidence Inheritance** 為準。

Stage 3 詳細 Git safety 依 `GIT-SAFETY.md`。

### Required CI Recovery

required CI failure 不授權自動修復。僅在 Reviewer 提供 bounded recovery contract 後，才可保留既有 branch／PR、加入一般 correction commit（不得 amend／rebase／reset／force push）、重跑 exact-HEAD local verification 並正常 push。新 CI green 後仍不得 merge，直到 Reviewer 驗證 correction 並重新固定 approved HEAD，除非 recovery Contract 已明確授權那個已驗證的 exact HEAD。

所有 `gh` write command 必須明確使用：

```bash
--repo boyiad2110/forgesteel-zh-tw
```

## Git Permission

Agent 只能執行 Contract 明確授權的 Git 動作。

典型 Stage 1：

- 可建 feature branch。
- 可 local edit／test。
- 可依 Contract local commit。
- 不可 push／PR／merge。

典型完整 Stage 3：

- 可 push approved branch。
- 可建 PR。
- 可等待／驗證 CI。
- 可依固定 merge method merge。
- 可同步 `develop`。
- 可依 Contract 清理 feature branch。

任何未授權 history rewrite 都禁止。

## Report Style

採差異式回報，只包含 Reviewer 決策需要的證據：

- Branch／HEAD（final HEAD 將作為 Reviewer approval 或 Stage 3 input 時，須為完整 40-character commit SHA）。
- 實際 changed files。
- 核心 implementation／correction 差異。
- tests／lint／typecheck／build／CI 等 fresh verification。
- canonical／data safety evidence（若相關）。
- smoke／人工驗收（若要求）。
- working tree／final branch state。
- 偏差、風險、未預期狀況。
- 真正需要 Reviewer／Owner 決策的事項。

不要重複：

- 完整專案歷史。
- 每條 command 的正常輸出。
- 同一 SHA／status 多次抄寫。
- 長篇「未做什麼」清單，除非是高風險禁止事項的必要證據。
- Reviewer／Owner 已知道且未改變的背景。

## Stop

每個 Stage 完成本身授權的工作後停止。

- Stage 1：停止在 local implementation／verification report。
- Stage 2：停止在 focused correction／verification report。
- 完整 Stage 3：停止在 merge／sync／cleanup／final report。

不要自動開始下一批；下一批需要新的 Batch Contract。
