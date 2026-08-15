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

## Takeover / Interrupted Stage 3 Recovery

若 Stage 3 換手、中斷，或前一位執行者可能已做 GitHub write，任何 GitHub write 前必須先 read-only reconcile actual remote state。不得以 handoff 文字取代 repository／GitHub evidence。

至少確認：

- remote feature branch 是否存在與其 HEAD；
- 是否已有 PR，以及 PR state、base、head 與 head SHA；
- required CI state；
- current `origin/develop`；
- remote feature commit 與 `develop` 的 ancestry；以及 local 與 remote history 不同時的 tree equivalence。

remote branch 已存在、PR 已建立或已 merge、或 local history 與 remote history 不同時，停止正常 Stage 3 假設並先選擇 recovery path。此時不得直接 push、force push、rebase、reset、amend、重建 branch、建立第二個 PR 或重複 merge。

只有 reconciliation 證明尚未開始 closeout，才可繼續下列 Pre-write Gate。若 PR 已 merge，先驗證 `develop`、CI、merge result 與 ancestry；local 與 merged commit SHA 不同時，以零 diff 的 tree equivalence 作為 cleanup 前的必要證據。

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

## Approved Evidence Inheritance

Reviewer PASS 且已取得 exact approved HEAD 或完整 reviewed patch 時，Stage 3 Contract 的 expected changed-files、commit count 與其他機械 evidence，直接從已審 evidence 與 actual Git state 取得；不要人工重新抄寫另一套預期值。

PR actual state 與 approved HEAD／reviewed patch 不符，才是異常，仍依既有 Pre-write、Push／PR 與 CI gate STOP。若只有 Stage 3 Contract 的人工文字寫錯檔名，但 PR HEAD 未變且 actual files 與已審 patch 一致，這是 clerical mismatch：修正 Contract／gate 後繼續，不得要求改 code、amend、重建 PR 或停止整個成果。

本節不放寬 repository、base、head、SHA、diff、commit count、CI、mergeability 或 ancestry 的既有 safety checks；這些 actual-state checks 仍以本文件各 gate 為準。

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

## Required CI Failure Recovery

required CI red 時 merge 一律 STOP。依序：

1. 檢查確切 workflow、job、step 與 annotations。
2. 不自動 edit code；Reviewer 必須授權範圍有限的 recovery。
3. 保留既有 PR 與 branch，不建立 duplicate PR，不得 rebase／reset／amend／force push。
4. 以一般 correction commit 修正，取得 required exact-HEAD local evidence，並正常 push 到同一 feature branch。
5. 等待新的 required CI；再次 red 就 STOP。
6. 新 CI green 時，feature HEAD 已改變，Reviewer 必須驗證 correction 並重新固定 approved HEAD，然後重跑正常 pre-merge checks（含 `develop` drift）才可 merge。

這是 recovery path，不是無限 patch loop 的授權。若 CI 顯示 substantive implementation problem，交回 Reviewer 依適當 Stage／scope 處理。

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

## Cross-baseline Local Work Transplant

當已由 Reviewer 核准的 local-only work 要重接到新的 `develop` baseline 時，先確認核准單位與 commit topology。不得只因 branch 有 final HEAD，就假設 final tip commit 是 self-contained、可單獨 cherry-pick。

若成果依賴多個未合併 commits，Reviewer 必須明確指定安全 replay 方式：replay 完整 commit series，或使用已驗證 identity 的完整 `Base..HEAD` patch／tree state。若 cherry-pick 或 replay 出現 unexpected conflict，**STOP**；不得自行解 conflict、skip、rebase、reset 或改寫已核准 history，除非 Reviewer 另行授權 recovery 方式。

使用 cumulative patch transplant 時，至少核對：

- patch identity。
- apply-check。
- 必要的 tree／file equivalence。

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
