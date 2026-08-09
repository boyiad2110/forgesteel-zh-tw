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
