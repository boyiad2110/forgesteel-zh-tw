# 先讀這裡

本專案保留現有顯示層中文化架構。先讀此摘要即可接手；詳細內容依任務載入。

## 現況與下一步

- 維護順序 1–5、DISPLAY-01、DISPLAY-02、MAINT-WORKFLOW-01 與 UI-01／UI-02 已驗收；合併狀態、PR 與驗證版本見 [PROGRESS](PROGRESS.md)。
- 核准清冊：594 個 mapping / 105 列 Forge Steel Strings 版 / 11 個英文例外，其中 UI-01 新增 151 筆、UI-03 新增 15 筆核准 UI 對照。這是防錯清冊，不是產品中文化完成率。
- DISPLAY-01 已接上自訂文化已選面向名稱，官方三面向摘要使用中文標點；剩餘位置見 [COVERAGE](COVERAGE.md)。自訂文化 Field 描述仍列 DISPLAY-03。
- DISPLAY-02 已接上建角 ancestry／culture 選項的核准標題與描述。UI-01 的 151 筆建角器及共用玩家介面譯文已由 Marc 定稿為 APPROVED；UI-02 已接入同次快照、匯出、守門與顯示層；兩項均通過 Marc 人工驗收，合併狀態見 [PR #58](https://github.com/boyiad2110/forgesteel-zh-tw/pull/58)。龍鱗動態描述及自訂文化 Field 描述仍列待辦，詳見 [TODO](TODO.md)。
- UI-03／DISPLAY-03 的建角與角色摘要範圍已由 Marc 人工驗收；15 筆 APPROVED UI 對照已接入，合併狀態見 [PR #59](https://github.com/boyiad2110/forgesteel-zh-tw/pull/59)。FeatureConfigPanel 及龍鱗動態描述等剩餘工作見 [TODO](TODO.md)。
- Career 411 筆 NEW，需先翻譯與 QA；Enhancement 仍待定。所有剩餘工作與下一動作集中 [TODO](TODO.md)。

## 不可違反的界線

1. 中文只取 Master Sheet 的 APPROVED；不得自行補譯、改寫或把草稿放公開 repo。Sheet：`1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4`。
2. 只在顯示時套用中文；不改遊戲資料、計算、存檔或分享碼。自訂／改名／未知內容保留原值。
3. 動態數值投射上游計算結果；未知改寫保留完整計算後英文。英文備援不算該段中文化完成。
4. `main` 是上游鏡像；工作分支經 PR 合進 `develop`。上游 push URL 維持禁用；分叉不自動部署。
5. 本機完整驗證優先用 `node scripts/l10n/verify-isolated.mjs`，在目前檔案的暫存副本乾淨安裝、跑六項及瀏覽器回歸；底層入口仍是 `verify.mjs`。任一檢查失敗整體即失敗；不截圖、不錄影。
6. 一般內容批次仍先對照預覽與 Marc 核准。UI-01 的 151 筆已由 Marc 定稿並標為 APPROVED，可接入公開程式碼；後續新增譯文仍須先核准。

## 任務路由

| 任務 | 讀取 |
|---|---|
| 改程式／治理 | [RULES](RULES.md)，只再讀相關決策 |
| 快照與 Note | [SNAPSHOT](SNAPSHOT.md)；先讀線上 Project State、Status，單一寫入者 |
| 上游同步／分支規則 | [UPSTREAM](UPSTREAM.md) |
| 顯示覆蓋／P3 | [COVERAGE](COVERAGE.md) |
| P4／多來源過期 | [P4-STRUCTURE](P4-STRUCTURE.md) |
| 結案 | [BATCH-TEMPLATE](BATCH-TEMPLATE.md)，補原 PR 一次 |
| 例外與決策理由 | [DECISIONS](DECISIONS.md)；只有需要時讀其中的歷史索引 |

本機：`C:\TRPG\Draw Steel site\forgesteel-zh-tw`。經典表格入口：`#/hero/view/<ID>` 改為 `#/hero/sheet/<ID>`。
