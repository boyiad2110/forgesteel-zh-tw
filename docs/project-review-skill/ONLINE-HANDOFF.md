# Online Handoff and Collaboration

## 文件角色

本文件定義 Forge Steel 繁中專案的 **online-first collaboration／handoff transport**：Owner translation workspace、Agent task／packet transport，以及 Reviewer-authorized Agent Stage 3 的線上執行邊界。

它不取代：

- 專案負責人的最新明確決定；
- `docs/REVIEWER-PRINCIPLES.md` 的 authority／decision boundary；
- `PROJECT-REVIEW-SKILL.md` 的 Reviewer workflow；
- `AGENT-TASK-CONTRACT.md` 的 Agent execution boundary；
- `GIT-SAFETY.md` 的 Git／PR／merge safety；
- `docs/translation/TRANSLATION-WORKFLOW.md` 的 translation denominator、worksheet semantics、packet canonical alignment、glossary 與 calculated-presentation gates。

本文件只決定「這些已定義的工作如何在線上承載與交接」。

---

## 1. Online-first Default

正常專案工作預設使用線上 authoritative surfaces，避免為了 handoff 反覆下載／上傳 `.xlsx`、`.json`、`.md` 或 patch。

預設分工：

- **Google Sheet**：Owner／Reviewer 的 translation finalization workspace。
- **GitHub Issue**：Agent 的 Batch Contract、frozen implementation packet、Stage 1／Stage 2 handoff、Stage 3 authorization／report thread。
- **GitHub feature branch**：Agent implementation 的 exact remote review state。
- **GitHub PR／CI**：Reviewer authorization 後由 Agent 執行的 integration evidence。

只有工具能力、權限、精確值保存或 remote availability 使 online path 無法安全完成時，才使用既有 offline artifact／cumulative patch fallback。

Online-first 是 transport preference，不降低任何 canonical、verification、Git safety 或 Owner approval gate。

---

## 2. Google Sheet — Owner Translation Workspace

translation batch 需要 Owner 定稿時，預設在 Owner 指定的 Google Drive folder 建立**一批一份 native Google Sheet**。

### 角色

Google Sheet 是可編輯的 Owner／Reviewer working workspace，不是 Agent implementation authority，也不是正式 V1 denominator。

內容依 `docs/translation/TRANSLATION-WORKFLOW.md` 的 Worksheet 規格組織，至少能清楚區分：

- localization identity／path；
- canonical English；
- Owner-required vs Reviewer-derived／mechanical classification；
- AI／Reviewer suggestion；
- Owner-editable Final zh-TW；
- 本批需要的 terminology／calculated-path／contract evidence（適用時）。

### Exact-value rule

packet generation 不得以 Sheet render、preview、截圖或可能縮寫的 inspection output 為 authority input。

Reviewer 必須透過可取得完整值的 Google Sheets／Drive API 或明確等價 lossless read 重新讀取 final cells，保留：

- leading／trailing newline；
- whitespace；
- Markdown；
- punctuation／escaping；
- structured text。

這只是 `TRANSLATION-WORKFLOW.md` Packet Source-Integrity Rule 在 Google Sheet transport 上的具體執行方式。

### Owner finalization

Owner 直接在線上修改同一份 Sheet。Owner 明確表示「已定稿」或同等意思後：

1. Reviewer 重新讀取 live exact cell values；
2. 執行 completeness／blank、duplicate identity、row／identity mapping 與 Owner override 檢查；
3. 執行 final packet canonical alignment；
4. 完成 glossary delta 與其他適用 gate；
5. freeze implementation packet 到 GitHub Issue。

Stage 1 開始後，Google Sheet 後續變更**不會靜默改變**已 frozen 的 Agent authority。需要改 implementation authority 時，必須依 Issue Packet Revision Rule 發行新 revision。

### Privacy

Google Drive／Sheet 可能是私人或限定權限 workspace。

**不得預設把私人 Google Sheet／folder URL 貼到 public GitHub Issue／PR。**

Agent 正常不需要存取 Owner Sheet；Agent 只依 frozen GitHub Issue packet 實作。只有 Owner 明確決定該 Sheet 可公開且確實有必要時，才可在 public GitHub surface 放連結。

---

## 3. GitHub Issue — Agent Task and Frozen Packet

需要 Agent implementation 時，預設**一個 Batch 使用一個 GitHub Issue**作為線上工作單與 handoff thread。

### Issue body

Issue body 保存 Stage 1 Batch Contract 的穩定內容：

- Goal；
- Authority pointers；
- exact Base；
- In scope／Out of scope；
- Acceptance；
- Risk Level；
- Git permission；
- Report；
- Stop；
- 預期 feature branch。

不重貼可由 stable repository references 取得的完整 project history。

### Frozen packet comment

translation implementation packet 預設放在同一 Issue 的獨立 comment，以清楚標題標示，例如：

`## Frozen Translation Packet r1`

內容使用 machine-readable JSON code block，保存 `TRANSLATION-WORKFLOW.md` 要求的 identity、exact canonical snapshot、approved zh-TW、per-record `canonicalSha256` 與其他 batch-specific metadata。

若 Reviewer 提供 online packet payload SHA-256，recipe 固定為：

> 對該 comment 中 **JSON code block 內的 exact UTF-8 bytes** 計算 SHA-256；不包含 Markdown fence、標題或 comment 其他文字。

這個 digest 只用於 online transport／freeze identity，不取代 per-record canonical alignment，也不是 aggregate canonical-slice hash。

### Packet freeze / revision

Agent task 必須指定：

- Issue number；
- authorized packet revision；
- frozen packet comment identity（可取得時使用 comment ID）；
- payload SHA-256（若有）。

Stage 1 開始後不得靜默改寫既有 frozen packet authority。

若 Reviewer 發現 mechanical packet defect：

1. 不要求 Owner 重新核准未改變的 zh-TW semantics；
2. 新增新的 frozen packet comment，例如 `r2`；
3. 明確標記 `r1 superseded by r2`；
4. 依 `TRANSLATION-WORKFLOW.md` Packet Revision Rule 更新受影響的 snapshot／identity／hash；
5. Agent 只接受最新明確授權 revision。

若 Owner semantic zh-TW 改變，仍依正常 Owner authority 重新收斂後再 freeze 新 revision。

### Agent report / Stage 2 / Stage 3 authorization

Agent Stage 1 完成後，預設在同一 Issue thread 回報 exact remote branch／HEAD 與差異式 evidence，然後 STOP。

Reviewer 有 blocker 時，在同一 Issue 留 Stage 2 focused correction instruction；Agent 只做該 correction、正常新 commit、fresh verification、push 同一 feature branch，回報新 exact HEAD 後 STOP。

Reviewer PASS 不是 Stage 3 permission。只有 Reviewer 在同一 Issue 對 approved HEAD、base 與 merge method 發出明確 Stage 3 authorization 後，Agent 才可執行 Stage 3；Agent 的 Stage 3 report 也放在同一 thread。

Issue thread 是 coordination／handoff surface；Reviewer verdict 仍以 actual remote diff、tests、CI／evidence 為準，不以 Agent comment 自述取代獨立 review。

---

## 4. Agent Execution Boundary

正常 online-first workflow 中：

- Agent 執行 **Stage 1**；
- 有 blocker 時 Agent 執行必要的 **Stage 2**；
- 只有同一 Issue 存在 Reviewer 對 fixed approved HEAD、base 與 merge method 的 explicit authorization 時，Agent 才執行 **Stage 3**。

Stage 1 預設使用 remote reviewer branch：implementation、targeted verification、final normal commit、clean tree 後 push feature branch，確認 local／remote exact HEAD 一致，回 Issue 並 STOP。

Agent 不得僅因 Reviewer 曾說 PASS 就建立 PR、merge、改 `develop`、清理 integration branch 或開始 Stage 3 GitHub closeout；需要 Issue 中的 explicit authorization。

remote 不可用或 Contract 明確要求 local-only 時，才使用 `AGENT-TASK-CONTRACT.md` 的 cumulative patch fallback。

---

## 5. Reviewer-authorized Agent Stage 3

Reviewer PASS、必要 manual acceptance PASS，且 approved HEAD、base 與 merge method 固定後，Reviewer 先唯讀 reconcile feature branch／HEAD、existing PR、`develop`、`main` 與 reviewed evidence。只有 state 無實質 anomaly 時，Reviewer 才在同一 Issue 發出 explicit Stage 3 authorization。

Agent 收到 authorization 後執行：

1. 建立或 reconcile 唯一 PR；
2. 驗證 PR base／head／exact SHA／commits／changed files；
3. 等待 required CI on exact approved HEAD；
4. 執行 mutable pre-merge gate；
5. 依固定 merge method merge；
6. 驗證 merge topology／tree equivalence／`develop`；
7. 驗證 post-merge CI（若 repository workflow 會執行）；
8. 執行可用的 remote cleanup；
9. 回 Issue report 並 STOP。

Reviewer 隨後獨立唯讀確認實際 PR、merge result、`develop`、`main`、CI、topology 與 cleanup，才可 close Batch Issue 並宣告 Batch Closed。

詳細 Git safety 仍以 `GIT-SAFETY.md` 為準。

### Local workspace is not a remote close gate

Agent 執行 Stage 3 時，不要求為了形式同步某個外部 local clone。

Batch Closed 的必要 evidence 以 remotely observable authoritative integration state 為主。Owner／其他開發者可在之後正常 fast-forward 自己的 local `develop`。

Reviewer 若恰好持有本批 local clone，只可唯讀檢查 evidence；需要 local sync／cleanup 時由 Agent、Owner 或該 clone owner 依 `GIT-SAFETY.md` 處理。無 remote contradiction 時，無法觀察某個外部 local workspace 不構成 close blocker。

### Feature branch cleanup capability

remote feature branch 在 merge 後應正常刪除；但若 Agent 的已授權 GitHub tooling **沒有 delete-ref／delete-branch capability**，且已確認：

- PR 已正確 merge；
- remote feature branch 仍固定在已 merge 的 approved HEAD；
- `develop`／CI／merge topology／`main` 全部符合 contract；

則留下 remote feature branch只記為 **Non-blocking housekeeping**，不得使用不安全 ref rewrite 冒充刪除。之後由具備正常 delete capability 的人員清理即可。

若 branch head 在 merge 後又發生未授權移動，則不是 housekeeping，必須依 Git safety anomaly 處理。

---

## 6. Issue Closure

Batch Issue 在下列條件完成後由 Reviewer close：

- Reviewer final PASS；
- 必要 acceptance PASS；
- PR merged by approved method；
- required exact-HEAD CI PASS；
- merge result／`develop`／`main` remote reconciliation PASS；
- 可執行的 cleanup 已完成，或唯一剩餘事項符合上節明確允許的 non-blocking housekeeping。

Issue close comment 只保留必要 closeout evidence／PR number／merge result／deferred housekeeping，不重寫完整歷史。

Close 後 STOP；下一批建立新的 Batch Contract／Issue。

---

## 7. Offline Fallback

以下情況才回到 offline artifact：

- Google／GitHub connector 無法可靠取得完整 exact values；
- remote feature branch 不可用；
- Agent／Reviewer 無法讀同一 GitHub Issue；
- payload 太大或 transport 限制會截斷資料；
- security／privacy 明確要求離線交接。

Fallback 仍依既有 `TRANSLATION-WORKFLOW.md`、`AGENT-TASK-CONTRACT.md` 與 `GIT-SAFETY.md`；不得因 offline fallback 降低 canonical alignment、hash、exact HEAD 或 review evidence。
