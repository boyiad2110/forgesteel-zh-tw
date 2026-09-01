# Git and GitHub Safety

## 文件角色

本文件定義 Forge Steel 繁中專案的 Git／GitHub write、remote review branch、PR、merge、recovery 與 cleanup safety。

Reviewer 的權限與決策邊界以 `docs/REVIEWER-PRINCIPLES.md` 為準；Stage workflow 由 `PROJECT-REVIEW-SKILL.md` 定義；online transport／actor boundary 由 `ONLINE-HANDOFF.md` 定義。

**正常流程中 Reviewer 決定、review、authorize 並唯讀 reconciliation；Agent 執行 repository mutations，包括收到 explicit Stage 3 authorization 後的 GitHub closeout。**

---

## 1. Fixed Repository Targets

GitHub write target：

`boyiad2110/forgesteel-zh-tw`

所有 `gh` write command 必須明確包含：

```bash
--repo boyiad2110/forgesteel-zh-tw
```

不得依賴 `gh` 自動從 origin／upstream 猜 repository。

- `develop` 是 integration branch。
- `main` frozen，除非有新的明確 Owner authority。
- 不得對 upstream write。

---

## 2. Stage 1 / Stage 2 Remote Reviewer Branch

online-first 預設 Agent 在 final normal commit、fresh verification、clean tree 後 push feature branch，讓 Reviewer review exact remote HEAD。

Owner primary clone 可用且乾淨時，Agent 預設在同一 clone 驗證 exact authorized `develop` base，然後建立／切換 Contract 指定 feature branch；`develop` 只作 clean starting／integration branch，不得直接實作。這保留 Owner 既有 local dev environment 的 live preview。isolated worktree／另一 clone 不是 generic safety default，只在 Owner 明確要求、primary clone 不可用或不乾淨／有衝突 Owner work，或 Contract 有具體 isolation risk 時使用，並在 Contract／report 明示。workspace setup 不得無必要重建 dependency environment。

Agent push 前至少確認：

- repository／origin 是繁中 fork；
- branch 是 Contract 指定 feature branch；
- base 是核准 `develop` SHA；
- HEAD 是 final normal commit；
- working tree clean；
- `main` 未修改；
- 沒有未授權 history rewrite。

Agent 只可正常 push feature branch；不得 PR／merge／改 `develop`／改 `main`／force push／rebase／reset／amend。

push 後確認 remote feature HEAD = local HEAD，且沒有額外 commit。Reviewer 可直接 review該 exact remote state，不另外要求 cumulative patch。

local-only cumulative patch 只在 `ONLINE-HANDOFF.md`／`AGENT-TASK-CONTRACT.md` 定義的 fallback 情況使用。

---

## 3. Reviewer Stage 3 Authorization Preconditions

Batch Contract 必須明確標示 manual acceptance 為 `REQUIRED` 或 `NOT REQUIRED`。

`NOT REQUIRED` 時，只有下列條件成立才進入 normal Stage 3 PR closeout：

- Reviewer PASS；
- approved feature HEAD 已固定；
- approved base 已固定；
- merge method 已由 Reviewer固定；
- expected changed-files／commit evidence 已從 actual reviewed HEAD繼承。

Reviewer 先以 remote read-only evidence 確認上述條件，然後在同一 Batch Issue 發出明確 Stage 3 authorization。Agent 不得把 Reviewer PASS 視為 Stage 3 permission；authorization 必須綁定 approved HEAD、base 與 merge method。

`REQUIRED` 時，Reviewer 可以在 feature HEAD／base 固定後授權 **Stage 3A**：Agent 只建立或 reconcile PR，並確認 required CI 在 exact PR HEAD 成功；不得 merge 或 cleanup，完成後 STOP。Owner 必須在相同 exact PR HEAD 做 manual acceptance，Reviewer 記錄 PASS 後，才可發出綁定 unchanged HEAD、base 與 merge method 的 **Stage 3B** authorization。manual PASS 後若有 tracked-file 或 head change，acceptance 失效，必須依影響範圍重新 review／accept；不得沿用舊 PASS merge。

---

## 4. Read-only Reconciliation Before Any Stage 3 Write

Reviewer 在 authorization 前先查 actual remote state：

- remote feature branch 是否存在與 exact HEAD；
- 是否已有 PR，以及 PR state／base／head／head SHA；
- required CI state；
- current `origin/develop`；
- frozen `origin/main`；
- approved feature commit與 `develop` ancestry；
- reviewed changed files／commit count／tree evidence。

不得以 handoff 文字取代 actual GitHub evidence。

### 正常 online-first起點

Stage 1 remote reviewer branch 在 Stage 3 前本來就存在，不是 anomaly。

若同時滿足：

- remote feature HEAD = approved HEAD；
- 尚未有 PR；
- 沒有 approved HEAD 以外的額外 commit；
- `develop` = approved base；
- `main` 未改；

可直接進 Pre-write Gate。

若 PR 已存在／已 merge，或 remote state與 reviewed evidence不同，先走 recovery reconciliation，不建立第二個 PR、不重複 merge、不改寫 history。

---

## 5. Agent Remote Pre-write Gate

Agent 在任何 Stage 3 GitHub write 前，立即重新確認：

- repository owner／name 正確；
- feature branch／approved HEAD 正確；
- `develop` 仍是 approved base；
- `main` frozen；
- actual commits／changed files符合 approved review evidence；
- 沒有未授權檔案或 commit；
- merge method已固定。

任何 substantive mismatch：STOP。不要先 rebase、reset、amend、force push、重建 branch 或改 code。

如果只有 Reviewer handoff文字的檔名／count誤抄，但 actual remote HEAD與已審 evidence完全一致，屬 clerical mismatch：修正 gate認知後繼續，不改 code／history。

---

## 6. Agent PR Gate

Agent 建立或 reconcile唯一 PR後，從 GitHub actual state確認：

- repository = `boyiad2110/forgesteel-zh-tw`；
- base = `develop`；
- head = approved feature branch；
- PR head SHA = approved HEAD；
- PR base SHA = approved base；
- commit count／changed files = approved review evidence；
- 沒有未授權檔案／commit。

若不符：STOP，不自動修 history。

---

## 7. Required CI / Mutable Pre-merge Gate

不得略過 required CI。

required CI 必須對 **exact approved HEAD** 成功。

CI green後、merge前重新查等待期間可能變動的項目：

- PR仍 OPEN、non-draft；
- PR head SHA仍是 approved HEAD；
- `develop`／PR base SHA仍是 approved base；
- required checks green；
- PR mergeable，沒有 unexpected conflict；
- commit count／changed files未變。

若 `develop` 在等待 CI期間移動：STOP；不自行 rebase或直接 merge 到未審 baseline。

---

## 8. Required CI Failure Recovery

required CI red 時 Agent merge一律 STOP。

依序：

1. 檢查 exact workflow／job／step／annotation；
2. Reviewer判斷是 environment／baseline／implementation問題；
3. Agent 不在 Stage 3直接 edit code；
4. 若需要 code correction，回到 bounded Stage 2；
5. Agent在同一 feature branch加入normal correction commit，不 amend／rebase／reset／force push；
6. Agent取得 fresh evidence、push新 HEAD、回報後 STOP；
7. Reviewer focused review correction並重新固定 approved HEAD；
8. 重新走 PR／CI／pre-merge gates。

這不是無限 patch loop授權；兩輪完整 Review限制仍依 Principles。

---

## 9. Merge Method

Reviewer在 Stage 3前固定其中一種：

- normal merge commit；
- squash merge；
- rebase merge。

不得在執行時自行換方法。

一般原則：

- 要保留 feature／correction commit history時可用 normal merge commit；
- 想把零碎 docs／implementation history收斂成單一 commit時可用 squash；
- rebase merge只在明確需要線性 history且不破壞 audit intent時使用。

Owner／repository policy有指定時，以較高 authority為準。

使用支援 expected-head protection 的 API／CLI時，merge應鎖定 approved HEAD，避免 CI後 branch被移動仍誤 merge。

---

## 10. Agent Merge-result Check and Reviewer Reconciliation

Agent merge成功後確認：

- PR state = `MERGED`；
- 記錄 merge result SHA；
- merge topology／method符合固定 contract；
- approved HEAD是預期 ancestry；
- merge-result tree與 approved work符合所選 merge method；
- `develop` 指向預期 merge result；
- `main` 未改；
- cleanup 已依 authorization 執行或已記錄工具限制。

若 normal merge commit預期只是整合 approved feature tree，應驗證 feature HEAD→merge result沒有未預期 file diff；若選其他 merge method，以其預期 tree equivalence驗證。Agent 回報後，Reviewer 必須獨立唯讀重查 PR、merge result、`develop`、`main`、CI、topology 與 cleanup，才可宣告 Batch Closed。

---

## 11. Post-merge CI

repository若在 `develop` push後執行 CI，Agent應等待並確認 required post-merge job在 **exact merge-result SHA** 成功，再回報 Reviewer。

post-merge CI failure屬 anomaly；不得為了 cleanup或下一批忽略。先保留 evidence並依 Reviewer recovery決策處理。

---

## 12. Remote Feature Branch Cleanup

正常情況：PR merged、`develop`／CI／topology確認後，刪除 remote feature branch。

不得使用 force-ref rewrite、把 branch移到別的 SHA或其他技巧冒充「刪除」。

### Tooling-limited cleanup

若 Agent 的已授權 GitHub tooling沒有 delete-ref／delete-branch capability，且已確認：

- PR已正確 merge；
- remote feature branch仍固定在已 merge的 approved HEAD；
- `develop`、required CI、merge topology、`main`全部正確；

則 remote branch殘留只記為 **Non-blocking housekeeping**。

不得使用不安全 ref rewrite。之後由具備正常 delete capability的人員清理。

若 branch在 merge後又被移動到未授權 SHA，這不是 housekeeping，必須按 anomaly處理。

---

## 13. Local Clone Safety（Agent／Owner 實際使用 local clone 時）

Agent／Owner若在 local clone同步：

- 先確認 origin指向繁中 fork；
- `develop`只用 normal fast-forward同步；
- 不用 reset模擬 sync；
- local feature branch優先 `git branch -d`；
- `-d`拒絕時不直接 `-D`，先確認 ancestry／merge method；
- working tree應保持乾淨；
- `main`／upstream不動。

remote merge／reconciliation 後，primary clone owner 可切回 `develop` 並以 `git pull --ff-only origin develop` 收斂；local feature branch 仍依上述安全刪除規則處理。不得用 reset 模擬同步。

clone-local defense（例如 `gh repo set-default`、`remote.pushDefault=origin`、upstream invalid push URL）只能視為 defense in depth；新 clone／新工作目錄必須重新驗證，且 `gh` write仍要明確 `--repo`。

外部 Agent／Owner local workspace未被 Reviewer觀察，不影響 remote integration evidence；Reviewer 不因 local clone 狀態自行執行 Stage 3 writes。

---

## 14. Cross-baseline Local Work Transplant

online-first remote branch是預設，但 local-only fallback仍可能需要把已審 work重接到新的 `develop` baseline。

此時先確認核准單位與 commit topology；不得只因有 final HEAD，就假設 tip commit可單獨 cherry-pick。

若成果依賴多個未合併 commits，Reviewer必須明確指定安全 replay方式：

- replay完整 commit series；或
- 使用已驗證 identity 的完整 `Base..HEAD` cumulative patch／tree state。

若 cherry-pick／replay出現 unexpected conflict：**STOP**；不得自行解 conflict、skip、rebase、reset或改寫已核准 history，除非 Reviewer另行授權 recovery。

使用 cumulative patch transplant時至少核對：

- patch identity；
- apply-check；
- 必要 tree／file equivalence。

---

## 15. Repository Ambiguity

若出現：

- `No commits between ...`；
- 找不到 branch；
- base／head不存在；
- repository owner不符；
- PR與 reviewed history不一致；

先查明 repository／refs／PR actual state。

不要先：

- rebase；
- reset；
- amend；
- force push；
- 刪 branch重建；
- 向 upstream開 PR。

---

## 16. Approved Evidence Inheritance

Reviewer PASS且已固定 exact approved HEAD後，Stage 3 expected changed-files、commit count與其他機械 evidence直接從**已審 exact HEAD／actual Git state**取得，不人工另抄第二套預期。

只有 actual PR state與 approved evidence不符才是 anomaly。

這不放寬 repository、base、head、SHA、diff、CI、mergeability或ancestry checks。

---

## 17. Batch Close Remote Gate

Agent 完成 Stage 3 report 後，Reviewer獨立唯讀確認下列項目才可宣告 Batch Closed：

- PR actual state = MERGED；
- merge result／method／topology符合 contract；
- required CI在 approved PR HEAD成功；
- `develop`指向預期 merge result；
- post-merge CI（若有）在 merge SHA成功；
- `main` frozen；
- remote feature branch已刪除，或唯一剩餘事項符合第12節 tooling-limited Non-blocking housekeeping；
- upstream untouched。

local clone sync不是 remote Batch Closed必要條件；由需要該 clone的人之後正常 fast-forward即可。

因 integration PR target 是 `develop` 而 repository default branch 是 `main`，Reviewer 必須在 final remote reconciliation PASS 後明確 close Batch Issue；不得把 PR 的 closing keyword 當成 Issue closure。closeout後 STOP，不開始下一批。
