# 一批只記一次

以下內容放原 PR 描述；合併前更新實際結果。PROGRESS 只保留狀態、PR、版本與下一步，不另開每批結案 PR。

## 執行與合併順序

1. 確認 Git 狀態、保留既有修改；內容批次先取得預覽核准。
2. 本機用 `node scripts/l10n/verify-isolated.mjs`，在副本乾淨安裝與驗證；使用者瀏覽器資料不作測試 fixture。必要故障回歸使用同一隔離 context，不截圖或錄影。
3. 交付同一 PR 與具體驗收位置。Marc 驗收後，把實際結果寫入 PR，並在該分支同步 PROGRESS／TODO／README／有效決策；repo 記「已驗收；合併狀態見 PR」，完成的內容從 TODO 移除。文件只引用同程式版本驗證，另查 diff／連結／狀態。
4. 等最新 head 的必要 CI 成功，再確認 base 是 develop、驗收授權適用於本批、合併方式正確。一般內容／工具改善用 squash；上游同步用 merge。合併要求 head 未變，不能忽略新增提交或繞過必要檢查。
5. 合併後只把實際 merge SHA 補到原 PR 與 Sheet，依 SNAPSHOT 精準寫入及回讀。同步本機 develop 前再確認工作目錄；不改寫已合併歷史。

GitHub CLI 一律指定 repo；合併命令範例（先完成上述核對）：

```powershell
gh pr view <PR> --repo boyiad2110/forgesteel-zh-tw --json baseRefName,headRefOid,state,isDraft,statusCheckRollup
gh pr checks <PR> --repo boyiad2110/forgesteel-zh-tw
gh pr merge <PR> --repo boyiad2110/forgesteel-zh-tw --squash --match-head-commit <已核對的完整HEAD>
# 只有上游同步 PR 將 --squash 改為 --merge
```

```markdown
## 問題與結果
觸發情境、原行為、完成後顯示。

## 範圍與來源
批次 ID；玩家旅程位置；核准 Sheet ID／用途；動態依賴與綁定。

## 驗證
程式版本、日期、完整 verify 結果；瀏覽器操作結果；未跑項目及原因。
只有文件改變時引用同程式版本的既有驗證，不冒稱重跑。

## 驗收位置與限制
候選→已選→摘要→總覽→詳情→經典表格；英／正體中文、自訂／改名、動態數值與未知改寫。
不截圖、不錄影。正常内容批次記 Marc 結果；明確授權自主維護則記自動驗證，不能冒稱人工驗收。

## 結案
Marc 驗收結果或適用的自主維護授權；合併方式；驗證程式版本；Master Sheet 必要狀態；新待辦 ID 與下一個動作。
repo 文件記「已驗收；合併狀態見 PR」。PR 描述合併前記「已驗收，待最新 CI／合併」，不預寫未知 merge SHA；合併後只在本 PR 補實際 SHA。
```
