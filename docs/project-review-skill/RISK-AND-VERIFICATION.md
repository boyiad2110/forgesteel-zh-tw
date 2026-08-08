# Risk and Verification

## 原則

驗證必須與實際風險相稱。Fresh evidence 是「最後變更後重新執行的必要證據」，不等於每批都執行完整 test、build、smoke 與人工驗收。

## Level A — 低風險

適用：

- 文件更新。
- 已核准靜態文案。
- 無 state、data selection、shared component 或 persistence 影響的顯示 localization。

最低證據：

- 核對 diff 與 changed files。
- 最接近變更的 targeted check／test（若存在）。
- `git diff --check`。
- 修改 source code 時，執行適用的 lint 或 typecheck。

通常不要求：

- storage／reload smoke。
- full CRUD。
- 專案負責人人工驗收。
- mutation-style 測試證明。

## Level B — 一般行為風險

適用：

- component behavior。
- state handling。
- filtering。
- localization lookup、fallback 或 locale switching。
- shared UI wiring。

最低證據：

- Targeted behavior tests。
- lint。
- typecheck。
- 相關 test suite；影響面廣時執行 full suite。
- 影響 bundling 或 runtime integration 時執行 build。
- 檢查 scope 外沒有 side effect。

人工 smoke 只在自動測試無法可靠覆蓋關鍵 interaction 時要求。

## Level C — 高風險

適用：

- delete。
- import。
- storage／persistence／reload。
- migration／schema／save format。
- data-loss。
- security／authorization。
- 可能改變 canonical data 或 runtime data set 的工作。

最低證據：

- Level B 全部。
- 真實 smoke test。
- persistence／reload 驗證。
- data integrity／compatibility 驗證。
- 重要 player-facing 或 destructive flow 要求專案負責人人工驗收。

## Test Quality

優先測 public behavior：

- success path 產生正確結果。
- blocked path 不執行 destructive callback。
- error path 顯示可理解資訊。
- locale switching 不改變 canonical data。
- filtering 不因翻譯完整度改變 runtime set。

避免：

- 只測 internal boolean。
- mock 掉被 Review 的 critical component。
- 只 snapshot 大型 UI 而沒有行為 assertion。
- 為了 coverage 加入無法保護 requirement 的測試。

## Mutation-style Evidence

只有在以下情況使用：

- 高風險 regression。
- 測試有效性存在實質疑問。
- Reviewer 明確要求。

不要在每個小批次都暫時移除 production fix 或破壞 code 來證明測試會失敗。

## Fresh Evidence Gate

宣告 PASS 前：

1. 找出能證明每個重要 claim 的 command 或人工步驟。
2. 確認它是在最後 code change 後執行。
3. 讀取 exit code、failures、warnings 與完整摘要。
4. Claim 必須與 evidence 一致。
5. 缺少證據時標記「尚未驗證」，不要推測通過。
