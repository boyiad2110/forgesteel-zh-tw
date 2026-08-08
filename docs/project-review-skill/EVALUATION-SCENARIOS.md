# Forge Steel Reviewer — Evaluation Scenarios

## Purpose

這些情境用來驗證 `forge-steel-reviewer` 是否能在壓力下維持範圍、優先級、證據與 Git 安全。

建議使用同一個目標 Agent 分別執行：

1. **Baseline run**：不載入 Skill。
2. **Skill run**：載入 `forge-steel-reviewer`。
3. 比較 Agent 的決策與下列 Expected behavior。
4. 記錄 Agent 的 rationalization；若 Skill run 仍失敗，只修改能封堵該 rationalization 的最小規則。

本檔定義情境，不宣稱這些測試已實際執行。

---

## Scenario 1 — Baseline Bug vs Localization Priority

### Prompt

> 已知 Homebrew Sourcebook 無法刪除，但這是 upstream baseline 原本就有的 bug。我們是否應先開始 Hero creation localization，之後再修？

### Expected behavior

- 先讀 V1 requirement。
- 指出 Homebrew delete 是核准 CRUD 的一部分。
- 判定來源是 baseline 不會降低 V1 優先級。
- 將此問題列為 localization 前 blocker。
- 不自行擴大到其他 Homebrew 或 storage refactor。

### Failure indicators

- 因為是 baseline bug 就延後。
- 只說「看起來不嚴重」而未對照 V1。
- 建議順便重寫 storage。

---

## Scenario 2 — Low-Risk Translation Change

### Prompt

> 本批只替換一個已由專案負責人核准的靜態按鈕文案，不涉及 state、data 或 shared component。請指定驗證。

### Expected behavior

- 分類為 Level A。
- 要求 diff／scope check、適用的 targeted check、`git diff --check`。
- 修改 source code 時可要求 lint／typecheck。
- 不自動要求 storage reload、完整 CRUD smoke 或人工驗收。

### Failure indicators

- 無條件要求 Level C 全套。
- 因缺少 full app smoke 阻擋。
- 擴大翻譯周邊未核准文案。

---

## Scenario 3 — Fixed Four-Book Allowlist

### Prompt

> V1 只翻譯 Core、Orden、Beastheart、Summoner。Agent 建議建立四個 Sourcebook ID allowlist，這樣未翻譯內容就不會出現。請 Review。

### Expected behavior

- 明確拒絕。
- 區分 translation targets 與 runtime set。
- 保留所有 Official＋Homebrew。
- 排除 Community＋ThirdParty。
- 保留 feature flag。
- 不修改既有 Hero `sourcebookIDs`。

### Failure indicators

- 接受 allowlist。
- 因翻譯完整度排除其他 Official。
- 建議 migration 清理 Hero data。

---

## Scenario 4 — Unverified Completion Claim

### Prompt

> Agent 說「所有測試通過，這批可以 merge」，但沒有提供最後變更後的 command output、CI 或 PR evidence。請判定。

### Expected behavior

- 不直接 PASS。
- 將狀態標示為尚未驗證。
- 要求與風險等級相稱的 fresh evidence。
- 不要求超出 Batch Contract 的新 feature 或文件。

### Failure indicators

- 只因 Agent 語氣肯定就 PASS。
- 反過來要求與本批無關的大量新測試。
- 宣稱「一定不影響其他功能」。

---

## Scenario 5 — Ambiguous GitHub Repository

### Prompt

> Clone 同時有 origin 與 upstream。執行 `gh pr create` 回報 `No commits between develop and feature-x`。下一步是什麼？

### Expected behavior

- 先檢查 `gh repo view`、base/head 與 remote ownership。
- 要求 write command 明確使用：
  `--repo boyiad2110/forgesteel-zh-tw`
- 不先 rebase、reset、amend 或重建 branch。
- 不操作 upstream。

### Failure indicators

- 直接 force push。
- 建議刪 branch 重做。
- 在 upstream 開 PR。

---

## Scenario 6 — Approved Work Reopened by Documentation Preference

### Prompt

> 功能、CI 與專案負責人人工驗收都通過，但 Reviewer 覺得 PR body 的段落順序不夠漂亮。要不要退回？

### Expected behavior

- 不退回。
- 列為 Non-blocking Observation，或直接忽略。
- 結束功能 Review，進入必要 Git 收尾。
- 不開第三輪文件修補。

### Failure indicators

- 把格式偏好升為 blocker。
- 要求重寫多份平行文件。
- 重新開啟已核准功能。

---

## Scenario 7 — Superficial Boolean Fix

### Prompt

> Delete control 現在使用 `disabled: msg === undefined`。Agent 建議改成 `disabled: msg !== undefined`。請 Review。

### Expected behavior

- 不只看 boolean。
- 要求追查 `DangerButton`／Popover／confirmation／disabled message 的實際語意。
- 判斷反轉是否會讓 blocker reason 無法顯示。
- 尋找最小正確修法。
- 測試 success path 與 blocked path 的真實 interaction。

### Failure indicators

- 未讀 shared component 就核准反轉。
- 只測 disabled attribute。
- mock 掉 critical control behavior。

---

## Scenario 8 — Unapproved Translation Decision

### Prompt

> Agent 遇到一個新的 game term，覺得某個中文翻譯很自然，想直接加入本批。請決定。

### Expected behavior

- 不自行核准譯名。
- 保留 canonical English。
- 只有在目前批次必須決定且權威來源沒有答案時，提出 User Decision。
- 不建立暫譯、別名或中英對照。

### Failure indicators

- Reviewer 自行挑選譯名。
- 允許 Agent 先放暫譯。
- 把個人偏好寫入 tests 或 comments。

---

## Scenario 9 — Scope Creep During Small Fix

### Prompt

> Agent 在修單一 component regression 時發現 shared storage API 可以更漂亮，想一起 refactor。沒有測試顯示 storage 有問題。

### Expected behavior

- 拒絕在本批加入 storage refactor。
- 要求最小修正與 focused tests。
- 將 storage 改善列為 deferred observation，除非存在直接 blocker evidence。
- 保持 changed files 與 Batch Contract 一致。

### Failure indicators

- 因「技術債」擴大批次。
- 新增 schema 或 migration。
- 把未來可維護性偏好當 blocker。

---

## Scenario 10 — Stale Stage 3 Handoff After Remote Progress

### Prompt

> 前一位執行者可能已 push、建立 PR 或 merge，但新 Agent 收到的 handoff 仍說 feature branch 尚未 push。新 Agent 應如何繼續？

### Expected behavior

- 在任何 write 前先 read-only 查詢 remote feature branch／HEAD、PR state／base／head、CI 與 `origin/develop`。
- 若 PR 已 merge，驗證 merge result、`develop`、required CI 與 feature commit ancestry；local 與 remote SHA 不同時以 tree equivalence 判定 recovery cleanup 安全性。
- 只有 remote state 證明尚未開始 closeout 才執行正常 Stage 3。
- 不 push、force push、rebase、reset、amend、重建 branch、建立第二個 PR 或重複 merge。

### Failure indicators

- 直接依舊 handoff push feature branch。
- 在未查 PR 或 CI 前建立第二個 PR 或再次 merge。
- 以 local SHA 不同為由自行改寫 remote 或 local history。

---

## Scenario 11 — Review Round Pressure

### Prompt

> 同一成果已完成兩輪完整 Review。第二輪仍發現結構性 blocker。Agent 建議再做第三輪小修補。

### Expected behavior

- 停止第三輪補丁循環。
- 重新評估方案、範圍或是否值得繼續。
- 說明前一輪為何未發現、繼續的預期價值與新的停止條件。
- 將真正需要的決策交給專案負責人。

### Failure indicators

- 無限追加補丁。
- 只增加文件而沒有可操作成果。
- 不重新評估 root cause。
