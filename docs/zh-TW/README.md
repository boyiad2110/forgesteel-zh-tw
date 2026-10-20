# 先讀這裡

本專案保留現有顯示層中文化架構。`develop` 已整合 MASTER-SPLIT B／C／D1／D2（[PR #64](https://github.com/boyiad2110/forgesteel-zh-tw/pull/64)）、套裝招式 UI 盤點（[PR #80](https://github.com/boyiad2110/forgesteel-zh-tw/pull/80)）與族裔 A–E5（[PR #81](https://github.com/boyiad2110/forgesteel-zh-tw/pull/81)）。每批的範圍、當時驗證與人工驗收請查 [PROGRESS](PROGRESS.md) 及原 PR；目前未完成工作只看 [TODO](TODO.md)。

## 中文化工作順序

1. 按 [BATCH-TEMPLATE](BATCH-TEMPLATE.md) 先列本批內容欄位、核准來源與玩家會看到的位置；逐格標明核准中文、英文原因或不適用。已有 mapping 不代表所有畫面完成。
2. 書本譯文取 Draw Steel Book Master，網站 UI／Adaptations 取 Forge Steel Localization Master；正式快照只整合兩份 Sheet 的 `APPROVED`。匯入與回讀依 [SNAPSHOT](SNAPSHOT.md)。
3. 僅在顯示層接入已核准譯文。新增或變更接點時，檢查中文、英文切換，以及自訂、改名、未知來源和動態數值的回退。
4. 交付前先用 `node scripts/l10n/coverage-report.mjs` 檢查六個位置的清單，再跑 `node scripts/l10n/verify-isolated.mjs`；把畫面證據、英文殘留與人工驗收位置放入同一 PR。已交付範圍列入 [PROGRESS](PROGRESS.md)。

## 不可違反的界線

- 書本 Glossary／Names／Strings 只取 [Draw Steel Book Master](https://docs.google.com/spreadsheets/d/1RAtKBsoL3HdPUZ0WNszdM7t2e_ac_Z3nBlpn7ud-cZ4/edit) 的核准正典；網站 UI／Adaptations／來源關聯由 [Forge Steel Localization Master](https://docs.google.com/spreadsheets/d/1bbtgLVODKGrghfsGDnp4ePECcqS9j3SnCXvcptxXWaw/edit) 管理。不得自行補譯、改寫或把未核准譯文放入公開 repo。舊單來源流程只供核准回復。
- 只改顯示，不改遊戲資料、計算、存檔或分享碼。自訂、改名、未知及沒有核准網站適配的內容保留原文；動態模板不吻合時保留完整計算後英文。
- `main` 是上游鏡像；工作分支經 PR 合入 `develop`。不自動部署；人工驗收及合併授權依 [RULES](RULES.md)。
- 正式快照筆數與雙來源版本以 `src/l10n/generated/zh-TW/meta.json`、`src/l10n/source-dependencies.json` 為準。筆數不是產品中文化完成率。

## 任務路由

| 任務 | 讀取 |
|---|---|
| 改程式／治理 | [RULES](RULES.md)，需要時讀相關決策 |
| 快照與 Note | [SNAPSHOT](SNAPSHOT.md)；先讀 Project State／Status，單一寫入者 |
| 上游同步／分支 | [UPSTREAM](UPSTREAM.md) |
| 顯示覆蓋盤點 | [COVERAGE](COVERAGE.md) |
| P4／多來源過期 | [P4-STRUCTURE](P4-STRUCTURE.md) |
| 批次交付 | [BATCH-TEMPLATE](BATCH-TEMPLATE.md) |
| 例外與決策理由 | [DECISIONS](DECISIONS.md) |

本機：`C:\TRPG\Draw Steel site\forgesteel-zh-tw`。經典表格入口：`#/hero/sheet/<ID>`。
