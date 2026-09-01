# Common Failure Modes

## 1. Baseline Bug 被錯誤降級

錯誤：

> 這是 upstream 原本就有的 bug，所以 localization 之後再處理。

修正：

回到 V1 Blocker Gate。問題來源不決定優先級；是否直接違反核准 V1 才決定。

## 2. 只反轉表面 Boolean

錯誤：

看到 `disabled` 判斷相反就直接反轉。

修正：

追查 shared component 的 open、message、confirmation 與 callback 語意，再找最小正確修法。

## 3. 翻譯範圍變成 Runtime Allowlist

錯誤：

只翻譯少數 Sourcebook，就只允許這些 ID 載入。

修正：

不要從翻譯 completeness 推導 runtime availability。每次依現行 authority 確認兩者邊界。

## 4. 文件偏好阻擋已驗收成果

錯誤：

功能、CI 與人工驗收已通過，仍因 PR body 或文件格式退回。

修正：

列為 Non-blocking Observation。功能 Review 結束，僅執行必要收尾。

## 5. 每批都用 Level C

錯誤：

純文案也要求 storage、reload、full smoke 與人工驗收。

修正：

先分類風險，採最低足夠證據。

## 6. 只信任 Agent 自述

錯誤：

看到「所有測試通過」就直接 PASS。

修正：

依風險核對實際 diff、tests、CI、PR 或最後變更後的 fresh evidence。

## 7. `gh` 選錯 Repository

錯誤：

依賴 `gh` 自動判斷 origin／upstream。

修正：

所有 write command 明確使用：

```bash
--repo boyiad2110/forgesteel-zh-tw
```

## 8. 小修正夾帶重構

錯誤：

修單一 regression 時順便重寫 shared storage 或 common component。

修正：

保持最小 fix。沒有 blocker evidence 的改善列為 deferred。

## 9. 自行決定新的中文譯名

錯誤：

Agent 或 Reviewer 覺得某個新遊戲術語翻譯自然就直接採用。

修正：

保留 canonical English；真正的新術語／新語意由 Owner 核准。

已核准譯文的 singular／plural、`a/an`、大小寫、標點、英文 plural `s` 等純機械變體不屬於新的翻譯決策。

## 10. 收尾後開始下一批

錯誤：

merge 完成立即修改下一項。

修正：

同步、清理、回報、停止。下一批需要新的 Batch Contract。

## 11. 把純機械翻譯差異升級成 User Decision

錯誤：

`Bespoke Culture` 已核准後，仍因 `Bespoke Cultures` 多一個 `s`；或同一句只差 `a/an`、大小寫、句號，就再次要求 Owner 逐項核准。

修正：

先判斷是否真的改變語意。若只是已核准譯文的機械變體，由 Reviewer／Agent 依既有語意直接處理；只有新詞義、新術語或真正翻譯取捨才提出 User Decision。

## 12. Agent Skill 安裝污染 Repository

錯誤：

在 repo root 執行 project-local skill installation，產生 `.agents/`、`.claude/skills/`、`skills-lock.json` 等 untracked tooling files，再考慮把它們加入 `.gitignore`。

修正：

Agent skill／tooling 預設 user-level／global 安裝，安裝後確認 `git status` 仍乾淨。若 installer 產生未知 repo files，停止回報；不要用 `git clean` 或修改 `.gitignore` 掩蓋。

## 13. Batch 切得過小

錯誤：

把一個詞、一個 call site 或單一小檔案當成獨立 localization batch，造成大量重複 Contract、Review、PR、CI 與 cleanup 成本。

修正：

預設以 coherent、可獨立驗收的 UI／功能 slice 為 Batch；只有風險、authority 或 dependency 需要隔離時才縮小。也不要反向把 shared architecture、遊戲內容與不相關功能硬塞進同一批。

## 14. 正常 Stage 3 被切成過多人工停點

錯誤：

Reviewer PASS、manual gate PASS、approved HEAD 固定後，仍要求 Agent 在 push、PR、CI、merge 前每一步都回來重新請示，即使所有 gate 都正常。

修正：

若 Reviewer 已明確授權完整 Stage 3，可一次執行 `push → PR → CI → merge → sync → cleanup`；只有 repository／SHA／diff／CI／mergeability／ancestry 等 gate 出現異常才停止。

## 15. Stage 3 換手時直接依舊 handoff 續跑

錯誤：

新 Agent 依前一位執行者的最後報告直接 push、建立 PR 或 merge，沒有先確認 remote branch、PR、CI 與 `origin/develop` 的 actual state。

修正：

Stage 3 換手、中斷，或 prior executor 可能做過 GitHub write 時，先只做 read-only reconciliation。確認 remote branch HEAD、PR state／base／head、CI、`origin/develop`、ancestry；local 與 remote commit identity 不同時再確認 tree equivalence。任何不一致先走 recovery path，不直接 push、force 或改寫 history。

## 16. 只測 Desktop／直接 Call Site

錯誤：

確認 desktop 直接 localized call site 顯示正確就結案，未覆蓋 responsive／compact／icon-only branch，也未驗證 shared component 的 fallback 或 default label。

修正：

materially relevant 的不同 render path 要有代表性 targeted test；delegated presentation 驗證最終 rendered public behavior，不只檢查傳入 argument。

## 17. Rerun 到 Green 就忽略先前 Failure

錯誤：

full suite 出現 timeout／intermittent failure，反覆 rerun 直到綠燈，只回報最後一次結果。

修正：

如實回報 failure，並以最低足夠 isolation evidence 判斷是否與本批相關。不得修改 timeout、test config 或無關 production code 換取綠燈。Stage 3 required CI failure 一律 STOP。

## 18. 因 Canonical English 相同就統一譯文

錯誤：

看到不同 surface 的 canonical English 字面相同，就把已核准的 zh-TW 互相 deduplicate、unify 或 overwrite。

修正：

approval 依 surface、localization identity 與 semantic context 生效。不同 context 可以有不同 approved 譯文；只有 Owner 明確要求全域統一時才合併，其餘列為回報事項。

## 19. Local-only Branch 缺乏完整 Diff Evidence 就 Review

錯誤：

Reviewer 無法存取 Agent local workspace，也沒有 push／PR，卻只憑 Agent 自述的 changed files 與摘要就下 verdict。

修正：

要求 final commit 後的完整 `Base..HEAD` patch，放在 repository 外，附 reverse-apply check、byte size、SHA-256 與 patch 後的 clean tree 確認；Stage 2 後重新輸出完整 patch。

## 20. Fallback Fixture 與 Production Catalog Collision

錯誤：

測試 fallback 時使用真實 canonical name，例如 `Caelian`／`Alchemy`；未來該 identity 加入正式 catalog 後，測試語意改變甚至失敗。

修正：

fallback test 使用明確不存在於 approved catalog 的 fixture identity；real approved identity 的 localization behavior 由獨立 tests 驗證。不靠「目前還沒翻到」作永久 test assumption。

## 21. 用 Array Position 找 Catalog Entry

錯誤：

test helper 用 `approvedEntries[2]` 之類位置取得 entry；新增新的 entry kind 後 index 漂移，可能讓 test 根本沒測到預期 entry，形成 false-green。

修正：

使用 entry `kind`、semantic key、localization identity 或 explicit predicate 取得目標 entry。不得依 production catalog array position 作 semantic identity。

## 22. Slice Test Pin Global Completeness State

錯誤：

slice-specific test 把 global `requiredCount`、unresolved count 或完整 unresolved list 寫死；其他合法 batch 增加 denominator 或完成 domain 時，舊 test 也被迫失敗。

修正：

slice-specific test 只 assert 該 slice 自己的 identities、delta 或特定 domain contract；global completeness test 才負責 exact global `requiredCount` 與 unresolved state。若某 batch acceptance 本身是新增固定數量 identities 或移除特定 domain，可 assert 自己的 delta／該 domain 消失，但不得 pin 其他 slice 的全域狀態。

## 23. Final Verification 未綁定 Final HEAD

錯誤：

lint／test 在最後一次 tracked-file modification 前通過，卻拿來宣告最後成果 PASS。

修正：

先 commit、確認 clean tree，再對 exact HEAD 做 required verification。其後任何 tracked-file change 都使 final-HEAD evidence 失效。

## 24. 把正常 Stage 1 Progress 當成 STOP 點

錯誤：

Agent 完成一般實作或驗證後反覆詢問「是否繼續？」。

修正：

preflight 後連續完成授權 Stage；只有真實 blocker 才停止。

## 25. Reviewer Packet Canonical Snapshot Drift

錯誤：

手動重建 packet canonical content，遺失 leading newline、whitespace 或 Markdown-sensitive 內容。

修正：

Agent handoff 前以 machine comparison 對 live canonical source 比對 packet snapshots；不符即停止實作。

## 26. Glossary Delta Gate 被靜默略過

錯誤：

translation batch 完成時沒有明確決定 reusable approved terminology 是否進 glossary。

修正：

每個 packet／batch 都記錄 exact glossary delta，或明確的空 delta 與理由。

## 27. 「Representative」Calculated Test 漏掉不同 Grammar Family

錯誤：

以泛用 Power Roll/render test 宣稱已涵蓋特殊 movement wording、potency、condition emphasis 或其他 identity-bound calculated 結構。

修正：

實作前分類 materially distinct dynamic grammar families，並為每一類選擇 representative production evidence。

## 28. CI Failure Recovery 臨時發明流程

錯誤：

Agent 自動修失敗 PR、改寫 history、建立第二個 PR，或在新 green HEAD 後立即 merge。

修正：

只依 Reviewer 授權的 bounded recovery，在同 branch／PR 加一般 correction commit，取得 exact-HEAD evidence 與 CI，再由 Reviewer 固定新的 approved HEAD。

## 29. 未查 Precedent 就誤判新 Architecture

錯誤：

看到 shared component、presenter、calculated grammar 或 fallback，就未查近期 merged precedent、現行 code 與 tests，直接稱為未知 architecture 並 STOP。

修正：

先依 `PROJECT-REVIEW-SKILL.md` 的 Precedent Gate 查足以判定本批的最近相關前例，再依實際 extension risk 固定 Contract。

## 30. Stage 3 重抄 Approved Evidence 製造假 Mismatch

錯誤：

已審 patch 是 `.test.tsx`，但 Stage 3 Contract 人工寫成 `.test.ts`，於是把這個文字錯誤當成 PR／code 異常。

修正：

依 `GIT-SAFETY.md` 的 Approved Evidence Inheritance 比對 approved HEAD／reviewed patch 與 actual Git state；只有 actual state 不符才 STOP。純 clerical mismatch 修正 Contract／gate 後繼續。

## 31. 未讀 Repository Tooling Evidence 就換 Package Manager

錯誤：

因 global pnpm 可用就執行 `pnpm install`，沒有先讀 `package.json`、lockfile 與 config。

修正：

依 `AGENT-TASK-CONTRACT.md` 的 Tooling / Skill repository evidence 選擇 manager；只有 evidence 真正衝突且影響安全執行時才 STOP。
## 32. 把最新 Precedent 直接 Copy-forward 到不同 Scope

錯誤：

上一批完成的是某 class 的 Ability slice，下一批是另一個 class 的 non-Ability slice；因為前者是最近 merged precedent，就直接沿用它的 Ability collector／enumerator 與 identity 假設，未比較兩批的 scope boundary。

修正：

依 `PROJECT-REVIEW-SKILL.md` Precedent Gate 的 **Scope-equivalence check**：reuse 前先比較 base class／subclass、Ability／non-Ability、identity／traversal contract、supplemental fields 與 presenter extension point。只重用真正 shared 的 architecture，batch-specific boundary 仍依本批 Contract 判定。scope 不同不代表 precedent 無效，也不自動 STOP；「它是最新的」不是 reuse 理由。

## 33. 把 Agent Preflight 當成第一次 Packet Alignment

錯誤：

Reviewer 未在 worksheet 交 Owner 前、也未在 packet freeze 前做 machine alignment，直到 Agent implementation preflight 才第一次發現 leading newline／whitespace／hash drift，於是 Stage 1 重來，或把 Reviewer artifact defect 當成 Owner 待決事項。

同一個失敗模式的另一種形態是 **identity／path drift**：packet 帶著完全正確的 exact canonical English，`canonicalSha256` 也重算相符，但該筆 record 的 field／path 寫成 `trigger`，而 repository 現行 localization identity authority 是 `type.trigger`。因為 hash 相符，就把它當成「已對齊」，或在 preflight 發現後靜默把 packet identity 映射到 repository identity。

修正：

依 `TRANSLATION-WORKFLOW.md` **Packet Canonical Alignment Gate** 的三層 timing：Owner handoff 前先驗一次、Owner finalization 後 packet freeze 前再驗一次，Agent preflight 只作 defense in depth。Reviewer artifact drift 由 Reviewer 依 Packet Revision Rule 自行修正，不變成 Owner decision。preflight 首次發現 drift 時，除了 STOP，也應視為前兩層 timing 未執行。

identity／path drift 另外適用：

- record-level canonical hash 驗證的是 **value bytes，不是 localization identity**；hash 相符不是 identity 正確的證據。
- alignment 必須獨立比較 identity set／path；這類 drift 會表現為一筆 unexpected packet identity 加一筆 missing packet identity。
- 正常流程應由 Reviewer-side alignment 在 Agent implementation 前就攔下。
- 若由 Agent preflight 首次發現：STOP，不得自行 normalize 或映射 identity。
- 由 Reviewer 發行 superseding 的 mechanical packet revision，只修 identity／path。
- approved zh-TW semantics 未變時，不產生任何 Owner semantic decision；canonical bytes 未變時也不改 per-record `canonicalSha256`。

上述 `trigger` / `type.trigger` 只是通用示例，不是特定 class 或 batch 的永久政策。

## 34. Stage 2／Stage 3 Contract 重貼完整歷史

錯誤：

focused correction 或 closeout 的 handoff 重貼完整翻譯 packet、Owner prose、歷史調查與整套 Stage workflow 與 stable Git 禁止事項，使每一輪都付出接近完整 Stage 1 任務書的固定成本，真正的 delta（blocker、approved HEAD、merge method）反而被淹沒。

修正：

依 `AGENT-TASK-CONTRACT.md` 的 **Compact Stage Handoff Profiles** 只寫本輪 delta；stable safety 以 pointer 引用既有文件。只有本批特有 gate、SHA、scope boundary 或禁止事項才明列。delta-only 不降低任何既有 safety authority 的效力。

## 35. 只從 Ability 型別判定 Calculated Path

錯誤：

以 `FeatureType.Ability` 當成 calculated presentation 的判準，於是漏掉 production calculator 實際會轉換的 non-Ability Feature description／prose；或反過來，把 production 並不做 calculated transform 的 Ability 欄位硬塞進 calculated matrix。

修正：

依 `TRANSLATION-WORKFLOW.md` 第 13 節 **Calculated Authored Content Presentation** 的 **Calculated Path Discovery Gate**：從本批已固定的 in-scope identities 加上實際 production render／call path 判定，Ability 是常見情況而非型別邊界。discovery 不擴張 denominator，也不授權額外 traversal。

## 36. Packet SHA 概念混用／未定義的 Aggregate Hash

錯誤：

把 packet 檔案 SHA、per-record `canonicalSha256` 與一個無法重現的 aggregate canonical-slice hash 當成可互換的「SHA-256」；或 Contract 只給 aggregate 數值沒給 recipe，Agent 就自行發明 ordering／serialization 反推，並在算不出相同值時宣稱 alignment failure。

修正：

依 `TRANSLATION-WORKFLOW.md` 的 **Packet Hash Semantics** 區分三者。aggregate hash 預設不是 gate；只有 Contract 同時宣告數值**並**定義 deterministic recipe 時才 blocking。recipe 缺席時改用 packet-file SHA 加 exact record-level alignment，不得反推 recipe。

## 37. 把 Stage 3 Agent 自述當成 Batch Closed

錯誤：

Agent 回報 Stage 3 已 merge、已清理、已同步，Reviewer 未做任何獨立 remote 核對就宣告 `Batch Closed`。

修正：

依 `PROJECT-REVIEW-SKILL.md` 的 **Post-merge Reviewer Reconciliation Gate**，close 前獨立核對 remotely observable state（PR 實際 merged、merge SHA／topology、required CI、`origin/develop`、frozen `origin/main`、remote branch cleanup）。Reviewer 無法獨立觀察的 local-only claim 記為「not independently observed」，不因此阻擋，但也不當成已驗證。

## 38. 排除可 Reach 的巢狀內容／把 Canonical Field 切一半

錯誤：

某 nested record 在 in-scope Level 1 flow 中直接可選，卻因為它在 model／檔案上掛得比較深或名義 level 不同就排除；或某 canonical description 內含較高 level 的 threshold，就只翻譯前半段、後半段留英文。

修正：

依 `TRANSLATION-WORKFLOW.md` 的 **In-scope Nested Reachability 與 Canonical Field Atomicity**：以實際 in-scope player-facing reachability 判定，且該邊界必須由 Batch Contract 明確固定；同一 canonical field 整筆翻譯與驗證，不產生部分翻譯的混合結果。這不授權遞迴走訪任意 descendant，也不把後續 level 的 sibling record 拉進 scope。

## 39. 為 generic safety 另開 isolated workspace／誤以 PR keyword 會 close Batch Issue

錯誤：

Owner primary clone 可用且乾淨，Agent 卻只因「隔離比較安全」建立 worktree／另一 clone，讓 Owner 的既有 local dev server 看不到 Stage 1 changes；或 integration PR target 是 `develop`，卻用 `Closes #...` 當作 Batch Issue 已關閉的依據。

修正：

依 `ONLINE-HANDOFF.md` 與 `GIT-SAFETY.md`，預設在 primary clone 的 feature branch 實作，保留 Owner local live preview；isolation 只限 Owner 明確要求、primary clone 不可用或不乾淨／有衝突 Owner work，或具體 batch risk，且須明示。Reviewer 的 authority 仍是 exact remote HEAD。final remote reconciliation PASS 後，Reviewer 必須 explicit close Batch Issue；因 default branch 是 `main`，不得依賴 target `develop` 的 PR closing keyword。
