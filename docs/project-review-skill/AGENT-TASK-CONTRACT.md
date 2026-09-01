# Agent Task Contract

## 文件角色

本文件定義 Agent 任務需要具備的最小 contract、translation implementation boundary 與 Stage 1／Stage 2 執行規則。

Reviewer 的權限、Findings、User Decision 與翻譯決策邊界以 `docs/REVIEWER-PRINCIPLES.md` 為準；本文件不重複維護第二套政策。

正常 online-first handoff 依 `ONLINE-HANDOFF.md`：Agent task／frozen packet 使用 GitHub Issue，Agent implementation 以 remote feature branch 交 Reviewer；**Agent 只在同一 Issue 收到 Reviewer 對 exact approved state 的明確授權後執行 Stage 3。**

reference routing：

- `PROJECT-REVIEW-SKILL.md`、本 Contract、`GIT-SAFETY.md`、`RISK-AND-VERIFICATION.md`、`ONLINE-HANDOFF.md` 是 stable core workflow references。
- domain-specific references 只在相關時載入。
- translation 任務必讀 `docs/translation/TRANSLATION-WORKFLOW.md`。

本批特有 risk、禁止事項、SHA、scope、acceptance 與 STOP rule 仍須明列。

---

## 1. Stage 1 Full Task

Stage 1 是 Agent 的完整 implementation task，至少包含：

1. **Goal**：唯一、可驗證結果。
2. **Authority**：支持本批的 current requirements／Owner decision。
3. **Base**：branch 與 exact expected start。
4. **In scope**。
5. **Out of scope**。
6. **Acceptance**。
7. **Risk Level**：Level A／B／C。
8. **Manual acceptance**：`REQUIRED` 或 `NOT REQUIRED`。
9. **Git permission**。
10. **Report**。
11. **Stop**。

Batch 預設 coherent、可獨立驗收；不得為單一詞彙／call site 無必要拆批，也不得把無關 architecture 塞入同批。

### Online Issue task

正常 route 使用一個 GitHub Issue 作 Batch work item：

- Issue body 保存 Stage 1 full task；
- translation packet 以 frozen revision comment 放同一 Issue；
- Agent completion report 放同一 Issue；
- Reviewer Stage 2 correction instruction 也放同一 Issue。

Agent 不需要讀 Owner Google Sheet；Google Sheet 是 mutable Owner／Reviewer workspace，不是 implementation authority。

如果 Issue 指定 frozen packet revision，Agent 只接受該 revision，不從 Sheet、舊 comment、聊天摘要或其他 artifact 自行拼湊 authority。

---

## 2. Stage 2 — Focused Correction Profile

只有 Reviewer 發現 blocker，或 Reviewer PASS 後 manual acceptance 出現真正 blocker 時使用。

Stage 2 instruction 只需要：

- original batch／Issue；
- current base／current HEAD；
- blocker；
- allowed files／forbidden collateral；
- focused acceptance／fresh verification；
- Git permission；
- Report／Stop。

Agent：

- 只修 blocker；
- 不夾帶 Non-blocking Observation、重構或下一批內容；
- 使用 normal new correction commit，不 amend／rebase／reset 已審 history；
- tracked correction 使舊 exact-HEAD evidence 失效；
- 重跑受影響 fresh verification；
- push 同一 feature branch；
- 回報新 exact HEAD 後 STOP。

Stage 2 不重貼完整 packet／Owner prose／歷史調查；stable safety 直接引用 core references。

---

## 3. Stage 3 Authorization Profile

Agent 在 Reviewer 明確授權前不得執行 Stage 3 Git／PR closeout。Reviewer PASS 本身不是 permission；authorization 必須在同一 Batch Issue，並綁定 fixed approved state。

Batch Contract 的 `Manual acceptance: NOT REQUIRED` 維持 normal Stage 3。若是 `REQUIRED`，則分為兩次明確授權：

- **Stage 3A** 只可 create／reconcile PR 並取得 exact-HEAD required CI；不得 merge 或 cleanup，完成後 STOP。
- Owner 必須在 unchanged exact PR HEAD 完成 manual acceptance，且 Reviewer 記錄 PASS。
- **Stage 3B** 才可依另一份 bound-to-unchanged-HEAD／base／merge-method authorization merge 與 cleanup。

manual PASS 後的 tracked-file 或 head change 會使 acceptance 失效；Agent 必須停止，讓 Reviewer 依影響範圍重新 review／accept，而不是沿用舊 PASS。

Stage 3 authorization 是 compact execution-critical delta，至少包含：

- approved full HEAD；
- approved base；
- merge method；
- expected PR target／head；
- required CI 與 mutable pre-merge gate；
- cleanup requirement；
- Report／Stop。

收到 normal Stage 3 authorization 後，Agent 可建立或 reconcile PR、驗證 exact head／base／files／commits、等待 required CI、執行 mutable pre-merge checks、以授權 method merge、驗證結果、執行 cleanup 並回報。Stage 3B 只可在同一 unchanged PR 上重做 mutable pre-merge check、merge、驗證結果與 cleanup；不得建立另一個 PR 或重跑 Stage 3A。Agent 不得在 Stage 3 作任何新的 product、scope 或 translation 決策；tracked correction 一律回 bounded Stage 2，並需要新的 Reviewer review 與 Stage 3 authorization 才可恢復 closeout。

---

## 4. Tooling / Package Manager

若任務需要額外 Agent skill／tooling：

- 預設 user-level／global，不安裝進 repository；
- 安裝後確認 `git status` 仍乾淨；
- 不 commit skill、lockfile、symlink、Agent metadata 或 installer 產物；
- 若 installer 產生未知 repo files，STOP；不要用 `git clean`、reset 或改 `.gitignore` 掩蓋。

執行 package-manager-dependent command、dependency install 或 recovery 前，先讀：

- `package.json` scripts／`packageManager`（若有）；
- lockfile；
- `.npmrc`／相關 config。

依 repository evidence 選 npm／pnpm／yarn；global availability 不構成自行換 manager 的理由。只有 evidence 真正衝突且影響安全執行時才 STOP。

---

## 5. Translation Boundary

Agent 不得自行建立新的中文遊戲術語、正式譯名或改變 Owner-approved semantics。

核心譯文已核准後，下列不改變語意的 mechanical variants 可依 Contract／Reviewer instruction 處理：

- singular／plural；
- `a/an`；
- 大小寫；
- 不改變語意的標點；
- 英文 plural `s`；
- dynamic placeholder 周圍純文法調整。

若出現新詞義、新術語或真正翻譯取捨，STOP 並回報 Reviewer。

### Approval scope

translation approval 依 surface、localization identity 與 semantic context 生效，不依 canonical English 字面生效。

- 相同 canonical English 可在不同 context 有不同 approved zh-TW；
- 不得自行 deduplicate／unify／overwrite；
- 只有 Owner 明確要求全域統一時才合併。

### Owner override

`Reviewer-derived／mechanical` classification 只表示不需要 Owner action，不限制 Owner 改 Final zh-TW。Owner 明確修改 Final value 時，最新 Owner value 即為 authority；packet generation 不得靜默還原舊 suggestion。

---

## 6. Translation Packet Preflight

translation task 從 approved packet 實作前，必須先驗證：

- Batch Issue／packet revision identity；
- payload SHA-256（若 Contract 提供）；
- expected base／source authority；
- exact packet identity set；
- exact canonical snapshots；
- per-record `canonicalSha256`；
- live canonical alignment。

適用時優先使用 `src/localization/test-support/packet-canonical-alignment.ts` 的 current repository primitive。

任何下列問題都在 implementation 前 STOP：

- duplicate／missing／unexpected identity；
- identity／path mismatch；
- canonical newline／whitespace／Markdown／structured text drift；
- canonical hash drift；
- authorized Issue packet revision／payload identity 不符。

Agent 不得自行重建、normalize、修補或映射 Reviewer packet authority。

### Online packet payload SHA

若 Issue task 提供 online packet payload SHA-256，recipe 依 `ONLINE-HANDOFF.md`：只 hash frozen packet comment JSON code block 內的 exact UTF-8 bytes，不包含 Markdown fence／標題。

這是 transport／freeze identity，不取代 per-record canonical alignment，也不是 aggregate canonical-slice hash。

### Packet hash semantics

`docs/translation/TRANSLATION-WORKFLOW.md` 的既有三種 hash 語意仍適用：

1. packet artifact SHA（若 offline serialized artifact 有提供）只證明 artifact transfer identity；
2. per-record `canonicalSha256` 是 canonical value alignment 的主要 record-level evidence；
3. aggregate canonical-slice hash 預設不是 gate，除非 Contract 同時定義 deterministic recipe。

不得自行發明 aggregate recipe。

---

## 7. Calculated Authored Content Presentation

calculated authored-content task 必須依 `docs/translation/TRANSLATION-WORKFLOW.md` 的 `Calculated Authored Content Presentation`。

判準是**實際 production render／call path 是否把 in-scope player-facing canonical authored field 送進 canonical calculator**，不是 Ability／non-Ability 型別。

Agent 必須：

- 依 Calculated Path Discovery Gate 分類；
- Hero／no-Hero surface 若都存在，分別驗證；
- 只使用 Contract 授權的 bounded projection／shared presenter extension；
- 不建立中文 parser／calculator；
- unsupported structural rewrite 依既有 fallback policy fail-close；
- discovery 不得擴張 translation denominator。
- 將每一個適用 matrix row 對應到 explicit Hero／no-Hero／pass-through public-behavior assertion（依該 row 實際存在的 path）；不得讓測試固定與 matrix 相反的行為。

### Shared primitives

適用時先檢查並重用：

- `localization-differential-invariants.ts`；
- `packet-canonical-alignment.ts`；
- `localization-presentation-test-harness.tsx`。

helper 只依實際 risk 使用，不取代 scenario-specific public-behavior assertions，也不授權新增 denominator／architecture。

### Class／Subclass Level 1 Non-Ability identity

若 task 涉及該 denominator／required identities，直接讀 `TRANSLATION-WORKFLOW.md` 同名規則與 current live code；不得自行建立 class-specific exclusion／平行 inventory／shared traversal expansion。

---

## 8. Stage 1 Execution

Agent：

1. reconcile repository／base／branch preflight：Owner primary clone 可用且乾淨時，先確認它的 `develop` 在核准 base，再於同一 clone 建立／切換 Contract feature branch；不得直接在 `develop` 實作。isolated worktree／另一 clone 僅限 Owner 明確要求、primary clone 不可用或不乾淨／有衝突 Owner work，或 Contract 明確的 isolation risk，且須先明示；
2. 從核准 base 建 feature branch；
3. 只修改 In Scope；
4. 執行 risk-matched minimum sufficient evidence；translation implementation 適用時，對 frozen approved packet in-scope slice 與 production catalog 執行 exact identity／zh-TW reconciliation；
5. 最後 tracked change 後建立 normal final commit；
6. 記錄完整 40-character HEAD，確認 clean tree；
7. push feature branch；
8. 確認 remote HEAD = local HEAD，沒有額外 commit；
9. 在 Batch Issue 回報 evidence；
10. STOP。

正常中間進度不是 STOP 點。只有 Contract blocker、authority mismatch、unexpected scope issue、真正需要 Owner decision、verification failure 或 repository anomaly 才停止。

### Stage 1 remote reviewer branch — default

online-first 專案預設授權 Agent 在 final commit／clean tree 後 push 該 batch feature branch，讓 Reviewer review exact remote HEAD。

primary clone 的此一預設讓 Owner 可在同一 working directory 繼續使用 repository 的既有 local dev environment（例如 `npm run start`）live preview；workspace setup 不得無必要刪除／重建依賴環境或建立第二份依賴環境。只有確有 package-manager recovery 時才依本文件 Tooling / Package Manager 的 repository evidence 處理，並確認沒有 tracked-file mutation。

Agent 仍不得：

- PR；
- merge；
- rebase；
- reset；
- amend；
- force push；
- history rewrite；
- 寫 `main`／upstream。

final report 必須包含 remote branch 與完整 HEAD。

### Local-only cumulative patch — fallback

只有下列情況使用：

- Contract 明確 local-only；
- remote 不可用／push 失敗；
- Reviewer 無法可靠存取 remote HEAD。

此時 final commit／clean tree 後輸出完整 `Base..HEAD` patch 到 repository 外，並附：

- reverse-apply check；
- byte size；
- SHA-256；
- full HEAD；
- Base..HEAD range；
- patch 後 clean tree。

Stage 2 後重新輸出完整 cumulative patch，不只 correction diff。

---

## 9. Exact-HEAD Verification

若 Contract 要求 CI-equivalent local evidence：

1. 完成 edits 與 final commit；
2. 記錄 full HEAD，確認 clean tree；
3. 讀**目前** repository CI workflow／相關 commands；
4. 執行 Contract 指定且可 local 重現的 gates；
5. 保存真實 exit code／failure／warning／summary。

不得把 lint／tsc／vitest／build 永久硬編成通用 CI 定義；current CI 與 Risk Contract 優先。

任何 tracked-file change 發生在 verification 後，都使該 evidence 對 final HEAD 失效。

---

## 10. Git Permission

Agent 只能執行 Contract 明確授權的 Git 動作。

online-first 典型 Stage 1／Stage 2：

- 可建 feature branch；
- 可 edit／test；
- 可 normal commit；
- 可 push 該 feature branch；
- 不可 PR／merge；
- 不可改 `develop`／`main`；
- 不可 history rewrite；
- 不可 upstream write。

所有未授權 Git write 都禁止。

---

## 11. Report Style

採差異式回報，只包含 Reviewer 決策所需證據：

- Batch Issue／packet revision（translation 適用）；
- Branch／full 40-character HEAD；
- remote HEAD reconciliation；
- actual changed files；
- 核心 implementation／correction approach；
- tests／lint／typecheck／build 等 fresh verification；
- canonical／data safety evidence（若相關）；
- smoke（若要求）；
- clean tree；
- deviations／risks／真正需要 Reviewer／Owner決策事項。

不要重複完整專案歷史、正常 command流水帳、同一 SHA 多次抄寫或長篇「未做什麼」。

---

## 12. Stop

- **Stage 1**：push feature branch、確認 remote exact HEAD、回報後 STOP。
- **Stage 2**：完成 focused correction、push 新 exact HEAD、回報後 STOP。
- **Stage 3**：只有在有效 authorization 後，完成指定 GitHub execution、回報實際結果後 STOP；等待 Reviewer 獨立 reconciliation。

Agent 不得自行開始 Stage 3 或下一批。
