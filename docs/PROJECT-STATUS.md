# Forge Steel 繁體中文化專案進度

> 最後更新：2026-08-07
> 本文件是 handoff 摘要，不取代 GitHub PR、commit、V1 需求文件或 Reviewer 原則。

---

## 1. 文件目的

讓下一批 Reviewer 或 Agent 能快速確認：

- 目前應以哪個 branch 與 commit 作為基準。
- 已完成哪些批次。
- 哪些 V1 工作尚未完成。
- 下一步應該做什麼。

實作細節、diff、測試紀錄與 CI 結果以 GitHub PR 為準。

---

## 2. Current Baseline

- Repository：`boyiad2110/forgesteel-zh-tw`
- Active development branch：`develop`
- Current substantive baseline：
  `5b3a9743322704278fd943db1ad4bd6b1d3c800b`
- Frozen `main` / `origin/main`：
  `267ca1a10dcab32a700089fc65dd212dc81f880a`
- Last merged substantive PR：`#10`
- Current phase：正式 localization implementation 前的準備階段

`develop` 的實際 HEAD 以 Git repository 為準。只更新 `docs/PROJECT-STATUS.md` 的 documentation-only PR 不改寫 substantive baseline 或 last merged substantive PR。

目前尚未開始大規模正式翻譯。

---

## 3. Source of Truth

若來源之間出現差異，依下列順序判定：

1. 專案負責人在目前對話中的最新明確決定。
2. `docs/REVIEWER-PRINCIPLES.md`。
3. 現行且已核准的 V1 requirements／decision 文件：
   - `docs/requirements/V1-REQUIREMENTS.md`
   - `docs/analysis/LOCALIZATION-TECHNICAL-OPTIONS.md`
4. 本文件（`docs/PROJECT-STATUS.md`），只作狀態摘要。
5. 與該項工作直接相關的 repository code、tests、GitHub PR、commit、CI 與人工驗收 evidence。

其他現行參考文件：

- `docs/PROJECT-SCOPE.md`
- `docs/UPSTREAM-BASELINE.md`
- `docs/analysis/CODEBASE-SUMMARY.md`

本文件只提供狀態摘要，不建立新的產品規則。若 authority 之間發生衝突且當下必須決定，交由專案負責人裁定。

---

## 4. Completed Batches

本表記錄截至 current substantive baseline 的完成批次；只更新本文件的 documentation-only PR 不自我列入。

| PR | 內容 | Merge commit |
|---|---|---|
| `#1` | 建立 repository baseline | `93931b420669b05bb1117c9a9aadbf950753afd2` |
| `#2` | 定稿 V1 需求與 codebase summary | `34890a3b420d3067caa91474c9ca52afc5e39c4d` |
| `#3` | 核准 localization 技術方向 | `529ce1907884a8fea0c5f66084494ac80f8aa136` |
| `#4` | 建立 Reviewer 原則 | `1ac34b4617903cc447a3bd24bbe5465b11b7c5f6` |
| `#5` | 對齊專案文件與 Reviewer 原則 | `fdfeb017d5ed3c1a3216cc3620946d35dd29ac1f` |
| `#6` | 加入 minimal localization prototype | `82512ebc4df4aa1f1902ff1dc88f44b8c9f10e28` |
| `#7` | 對齊 Sourcebook scope 與 canonical terminology | `b3dedec03f03c9f0a88c315f0903d12faac0c847` |
| `#8` | 只保留 Official 與 Homebrew Sourcebooks | `ef96aaec9a6442375f97582ed9c8dfac27f1bcce` |
| `#9` | 修復 Homebrew Sourcebook deletion regression | `e1e21cd5071329f3a831d4300f99f6bdcfd91795` |
| `#10` | 修復缺少 `languages`／`skills` 的 incomplete Homebrew Sourcebook import compatibility | `5b3a9743322704278fd943db1ad4bd6b1d3c800b` |

---

## 5. 已完成工作摘要

### 5.1 專案治理與工作流程

- `develop` 作為整合 branch，`main` 維持 frozen baseline。
- 每個批次使用獨立 feature branch，並透過 PR 合併。
- Reviewer 負責需求、範圍、風險與驗收；Agent 負責實作、測試與 Git 操作。
- 未經 Reviewer 核准不得擴大批次範圍。
- 未經專案負責人核准不得定稿中文遊戲譯名。

### 5.2 Localization 核心技術方向與 prototype

V1 localization 的**核心技術方向已核准**：以顯示層 localization 作為 runtime 核心，並搭配 build／test-time catalog 驗證能力。

`develop` 上已有標示為 prototype 的 localization 程式碼，包含 localization context、prototype 字串來源與 locale 切換控制項，並有對應測試。此 prototype 只提供可行性證據，**production implementation 尚未完成**；library、catalog 格式、檔案位置及其他可替換的實作細節仍未定稿。

### 5.3 Sourcebook runtime policy

- 保留所有 `Official` 與所有 `Homebrew` Sourcebook。
- 排除所有 `Community` 與 `ThirdParty` Sourcebook。
- 不使用固定 Sourcebook ID allowlist；翻譯目標與 runtime 可用範圍分開管理。
- 不修改既有 Hero 的 `sourcebookIDs`。

### 5.4 Homebrew Sourcebook 相容性修復

- **Delete（PR #9）**：無引用的 Homebrew Sourcebook 可正常刪除；被引用時顯示阻擋原因且不提供刪除按鈕。
- **Import（PR #10）**：缺少 `languages` 或 `skills` 欄位的 Homebrew Sourcebook JSON 可完成 normalization、import、persistence 與 reload。修正僅在既有 normalization boundary 補上兩個缺省集合，未變更 schema、ID、enum、save format 或 Sourcebook policy。

---

## 6. 已核准的重要決策

### 6.1 Localization

- 中文化只改變顯示文字，canonical data 不因 locale 改變。
- 英文是 fallback；未翻譯內容可顯示 canonical English。
- 中文譯名必須由專案負責人核准；核准前一律使用 canonical English。

### 6.2 相容性

不得因 localization 修改 Hero schema、Sourcebook schema、ID、enum、reference、calculation logic、save format 或既有 Hero data。Hero data 不得寫入 locale、中文顯示值或翻譯 metadata。

### 6.3 範圍控制

- 不在同一批次順手修 unrelated issue，不進行未核准的重構。
- 不自行開始下一個批次。
- 不修改 upstream 或 frozen `main`。

---

## 7. 尚未完成的 V1 工作

依 `docs/requirements/V1-REQUIREMENTS.md` 與現行 repository evidence：

- 將已核准的 localization 核心技術方向落地為 production implementation；具體可替換實作細節仍須由後續批次與實作證據決定。
- 正式 locale state、translation lookup、fallback 規則與 locale preference persistence。
- 繁中／英文一鍵切換，且切換不影響 Hero data、數值與目前頁面狀態。
- Core、Orden、Beastheart、Summoner 的 Level 1–3 Hero player content 中文定稿。
- Hero creation、level-up 至 Level 2／3、Hero Sheet 等 player-facing flow 中文化。
- 翻譯資料結構、approval metadata 與翻譯缺漏檢查機制。
- V1 必測項目與封閉 Beta。
- 授權、法律聲明與發布前置條件確認。

大量 player-facing string 目前仍直接寫在 React components 內。

---

## 8. Next Work

1. 重新執行 V1 Blocker Gate，確認目前是否存在優先於 localization 的 blocker。
2. 若沒有更高優先 blocker，再由 Reviewer 選定**唯一一個** localization batch。

在該 batch 經 Reviewer 核准前，不得假定任何 localization 實作方式、範圍或 vertical slice 已獲核准，也不得開始翻譯。

---

## 9. Deferred / 需專案負責人決定

依 V1 需求第 12 節，仍然有效：

- 翻譯資料的最終格式（由 prototype 或實作證據決定）。
- 語言切換按鈕的位置與樣式。
- 免費部署平台。
- 正式發布所需的授權文字。

暫不處理：

- 與已核准 batch 無關的 baseline bug。
- 未核准的 UI redesign。
- 大型 storage refactor 與 schema migration。
- Community 或 ThirdParty 內容支援。
- V1.1 範圍。

若已知問題直接阻擋 V1 核准需求，必須在進入相關 flow 前重新評估優先順序。

---

## 10. Update Rules

本文件只在下列時機更新：

- 一個完整的 substantive 批次已合併至 `develop`。
- Current substantive baseline 改變。
- 已核准的產品決策改變。
- Next Work 改變。
- 新問題被正式列為 V1 blocker 或正式 deferred。

只更新 `docs/PROJECT-STATUS.md` 的 documentation-only PR 不自我記錄其 PR number 或 merge SHA，也不觸發另一個 status-only 更新循環。Repository 當前 HEAD 以 `develop` 的實際 Git 狀態為準。

更新時：

- 不記錄每日工作流水帳、PR body、CI log 或測試清單。
- 不記錄本機環境狀態、token、credential 或個人路徑。
- Completed Batches 每個 PR 只保留一行摘要。
- 已完成項目移入 Completed，不保留過時敘述。

所有 `gh` write command 應明確使用 `--repo boyiad2110/forgesteel-zh-tw`。push 安全設定屬於個別 clone 的本機設定，重新 clone 後必須重新確認。

詳細歷史以 GitHub 為準。
