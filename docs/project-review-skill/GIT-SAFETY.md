# Git and GitHub Safety

## 文件角色

本文件定義 Forge Steel 繁中專案的 Git／GitHub write、PR、merge 與 cleanup safety。

Reviewer 的權限與決策邊界以 `docs/REVIEWER-PRINCIPLES.md` 為準；實際 Stage 3 workflow 由 `PROJECT-REVIEW-SKILL.md` 使用本文件執行。

## 固定目標

GitHub write target：

`boyiad2110/forgesteel-zh-tw`

所有 `gh` write command 必須明確包含：

```bash
--repo boyiad2110/forgesteel-zh-tw
```

不得依賴 `gh` 自動從 origin／upstream 猜測 repository。

`develop` 是 integration branch；`main` frozen，除非有新的明確授權。

不得對 upstream write。

## Stage 3 前置條件

只有下列條件成立時才進入 Git／PR closeout：

- Reviewer PASS。
- 必要人工驗收 PASS。
- approved feature HEAD 已固定。
- working tree clean。
- 本批 merge method 已在 Stage 3 Contract 中明確固定。

Merge method 屬一般 Git 技術決策時，可由 Reviewer 依 `docs/REVIEWER-PRINCIPLES.md` 決定；除非 Owner 或 repository policy 已指定，不需要每批再請 Owner 三選一。

## Pre-write Gate

在第一次 GitHub write 前確認：

- current branch 是預期 feature branch。
- HEAD 是 Reviewer 核准 SHA。
- working tree clean。
- local／origin `develop` 符合核准 base。
- local／origin `main` 未修改。
- origin 指向繁中 fork。
- upstream 沒有 write action。

任何一項不符：停止並回報。不要先修歷史。

## Push / PR Gate

Push feature branch 後確認 remote branch HEAD 仍等於 approved HEAD，沒有額外 commit。

建立 PR 後從 GitHub 實際核對：

- repository owner 正確。
- base = `develop`。
- head = 核准 feature branch。
- PR head SHA = approved HEAD。
- commit 數符合 Batch Contract。
- changed files 符合 Batch Contract。
- 沒有未授權檔案。

若 repository／base／head／SHA／commit count／changed files 不符：停止。不要自動 rebase、reset、amend、force push 或重建 branch。

## CI / Pre-merge Gate

不得略過 required checks。

CI PASS 後、merge 前，再確認一次真正可能在等待期間改變的項目：

- PR 仍 OPEN。
- PR head SHA 仍是 approved HEAD。
- `origin/develop` 仍是核准 base，除非 Reviewer 已重新驗證新的 base。
- required checks PASS。
- PR mergeable，沒有 unexpected conflict。
- commit count／changed files 未改變。

不要為了形式重複檢查不可能變動的資訊；但等待 CI 期間可能變動的 base／head／PR state 必須重新確認。

若 `develop` 在等待 CI 期間移動：停止並回報，不自行 rebase 或直接 merge 到未審 baseline。

## Merge Method

Stage 3 Contract 必須明確寫出本批 merge method：

- normal merge commit
- squash merge
- rebase merge

不得在執行時自行換方法。

一般原則：

- 有意保留 feature commits／Review correction 歷史時，可用 normal merge commit。
- 需要把零碎實作 history 收斂成單一 commit 時，可用 squash。
- rebase merge 只有在明確需要線性 history 且不破壞本批 audit intent 時使用。

若 repository policy 或 Owner 已指定，以較高 authority 為準。

## Repository Ambiguity

若出現：

- `No commits between ...`
- 找不到 branch。
- base／head 不存在。
- repository owner 不符。
- PR 顯示與 local history 不一致。

先檢查：

```bash
gh repo view --json nameWithOwner
git remote -v
```

再用明確 repository／ref 查證。

不要先：

- rebase。
- reset。
- amend。
- force push。
- 刪 branch 重建。
- 向 upstream 開 PR。

## Local Defense in Depth

目前 clone 可能設定：

- `gh repo set-default boyiad2110/forgesteel-zh-tw`
- `remote.pushDefault=origin`
- upstream invalid push URL

這些只是 clone-local 防護。新 clone、換電腦或新工作目錄必須重新驗證，不能假設存在。

即使本機防護存在，`gh` write 仍必須使用明確 `--repo`。

## Merge and Cleanup

Merge 成功後確認：

- PR state = `MERGED`。
- 記錄 merge commit／result SHA。
- `origin/develop` 是預期 merge result。
- feature commits／result 與 `develop` ancestry 符合 merge method。
- `main` 未改。

同步 local `develop` 時優先使用正常 fast-forward；不要用 reset 模擬同步。

清理 feature branch：

- 確認 PR 已 MERGED 且 `develop` 已同步後，再刪 remote／local feature branch。
- local branch 優先使用 `git branch -d`。
- 若 `-d` 在預期應可安全刪除的 history 下拒絕，不要直接 `-D`；先重新確認 ancestry／merge method，必要時回報 Reviewer。
- 只有已明確驗證安全且 Contract／Reviewer 允許時才使用強制刪除。

最終確認：

- current branch = `develop`。
- local `develop` = `origin/develop`。
- working tree clean。
- `main` 未改。
- feature branch 已依 Contract 清理。
- upstream untouched。

收尾後停止，不開始下一批。
