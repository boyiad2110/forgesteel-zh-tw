# Git and GitHub Safety

## 文件角色

本文件定義 Forge Steel 繁中專案的 Git／GitHub write、remote review branch、PR、merge、recovery 與 cleanup safety。

Reviewer 的權限與決策邊界以 `docs/REVIEWER-PRINCIPLES.md` 為準；Stage workflow 由 `PROJECT-REVIEW-SKILL.md` 定義；online transport／actor boundary 由 `ONLINE-HANDOFF.md` 定義。

**正常流程中 Agent 只執行 Stage 1／Stage 2 feature-branch work；Stage 3 由 Reviewer 執行。**

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

## 3. Reviewer Stage 3 Preconditions

只有下列條件成立才進入 PR closeout：

- Reviewer PASS；
- 必要 manual acceptance PASS；
- approved feature HEAD 已固定；
- approved base 已固定；
- merge method 已由 Reviewer固定；
- expected changed-files／commit evidence 已從 actual reviewed HEAD繼承。

Reviewer remote-first Stage 3 不要求先取得 Agent local workspace；local clone state 只有在 Reviewer實際使用該 clone 執行 Git 時才成為 execution gate。

---

## 4. Read-only Reconciliation Before Any Stage 3 Write

任何 Stage 3 GitHub write 前先查 actual remote state：

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

## 5. Remote Pre-write Gate

Reviewer第一次 GitHub write 前確認：

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

## 6. PR Gate

建立或 reconcile唯一 PR後，從 GitHub actual state確認：

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

required CI red 時 merge一律 STOP。

依序：

1. 檢查 exact workflow／job／step／annotation；
2. Reviewer判斷是 environment／baseline／implementation問題；
3. 不在 Stage 3直接 edit code；
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

## 10. Merge-result Reconciliation

merge成功後確認：

- PR state = `MERGED`；
- 記錄 merge result SHA；
- merge topology／method符合固定 contract；
- approved HEAD是預期 ancestry；
- merge-result tree與 approved work符合所選 merge method；
- `develop` 指向預期 merge result；
- `main` 未改。

若 normal merge commit預期只是整合 approved feature tree，應驗證 feature HEAD→merge result沒有未預期 file diff；若選其他 merge method，以其預期 tree equivalence驗證。

---

## 11. Post-merge CI

repository若在 `develop` push後執行 CI，Reviewer應等待並確認 required post-merge job在 **exact merge-result SHA** 成功。

post-merge CI failure屬 anomaly；不得為了 cleanup或下一批忽略。先保留 evidence並依 Reviewer recovery決策處理。

---

## 12. Remote Feature Branch Cleanup

正常情況：PR merged、`develop`／CI／topology確認後，刪除 remote feature branch。

不得使用 force-ref rewrite、把 branch移到別的 SHA或其他技巧冒充「刪除」。

### Tooling-limited cleanup

若 Reviewer當前 GitHub tooling沒有 delete-ref／delete-branch capability，且已確認：

- PR已正確 merge；
- remote feature branch仍固定在已 merge的 approved HEAD；
- `develop`、required CI、merge topology、`main`全部正確；

則 remote branch殘留只記為 **Non-blocking housekeeping**。

不得為了刪 branch把 Stage 3重新交回 Agent，也不得使用不安全 ref rewrite。之後由具備正常 delete capability的人員清理。

若 branch在 merge後又被移動到未授權 SHA，這不是 housekeeping，必須按 anomaly處理。

---

## 13. Local Clone Safety（只有實際使用 local clone 時）

Reviewer／Owner若在 local clone同步：

- 先確認 origin指向繁中 fork；
- `develop`只用 normal fast-forward同步；
- 不用 reset模擬 sync；
- local feature branch優先 `git branch -d`；
- `-d`拒絕時不直接 `-D`，先確認 ancestry／merge method；
- working tree應保持乾淨；
- `main`／upstream不動。

外部 Agent／Owner local workspace未被 Reviewer觀察，不影響 remote integration evidence；不要為了形式把 Stage 3交回 Agent。

---

## 14. Repository Ambiguity

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

## 15. Approved Evidence Inheritance

Reviewer PASS且已固定 exact approved HEAD後，Stage 3 expected changed-files、commit count與其他機械 evidence直接從**已審 exact HEAD／actual Git state**取得，不人工另抄第二套預期。

只有 actual PR state與 approved evidence不符才是 anomaly。

這不放寬 repository、base、head、SHA、diff、CI、mergeability或ancestry checks。

---

## 16. Batch Close Remote Gate

Reviewer宣告 Batch Closed前，至少確認：

- PR actual state = MERGED；
- merge result／method／topology符合 contract；
- required CI在 approved PR HEAD成功；
- `develop`指向預期 merge result；
- post-merge CI（若有）在 merge SHA成功；
- `main` frozen；
- remote feature branch已刪除，或唯一剩餘事項符合第12節 tooling-limited Non-blocking housekeeping；
- upstream untouched。

local clone sync不是 remote Batch Closed必要條件；由需要該 clone的人之後正常 fast-forward即可。

closeout後 STOP，不開始下一批。
