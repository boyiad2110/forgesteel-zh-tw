# 目前進度

2026-10-10：本次附件維護 1–5，使用者明確授權自主驗證與結案，免人工驗收。原 develop 基底 `90f87618`，上游同步目標 `5968ff54`（14.207.0）。本批未改 Master Sheet、核准譯文、mapping 或快照；428／105／11 清冊維持。

## 本批結果

| 順序 | 狀態與成果 | 證據／入口 |
|---|---|---|
| 1 | 已檢查 PR #53 完成；統一入口在本次同步版也通過 | verify 六項全部 exit 0；原來源掃描預設設定通過 |
| 2 | main 已 fast-forward 至上游 5968ff54；5 個整合衝突已解；遠端分支保護已 API 回讀 | [UPSTREAM](UPSTREAM.md)，本批同步 PR 保留 merge commit 祖先 |
| 3 | 文件瘦身、明確待辦、批次記錄集中原 PR、歷史封存 | [README](README.md)、[TODO](TODO.md)、[BATCH-TEMPLATE](BATCH-TEMPLATE.md) |
| 4 | 玩家六旅程位置與 P3 阻塞完成盤點；加入可重複瀏覽器回歸 | [COVERAGE](COVERAGE.md)，browser-smoke.mjs |
| 5 | 105 列完整依賴守門，含 5 組多來源；多用途資料契約定案 | [P4-STRUCTURE](P4-STRUCTURE.md)，DEC-0010／0011 |

遠端設定：預設分支 develop；develop 必須 PR、strict `l10n`（GitHub Actions app 15368）、零位必要人工審查者，管理者適用；main 不要求 PR 以維持鏡像。兩分支皆禁止 force push／刪除。部署及 registry 清理 workflow 在此分叉為 disabled_manually，Localization check 保持 active；停用前確認兩者各 0 次執行、repo secrets／variables 各 0，不影響上游。每週一台灣 09:00 Upstream watch 唯讀比較 main／develop 積欠，不自動整合或部署。

## 驗證

2026-10-10 本次程式工作樹，以 Node 24.18.0／npm 11.10.1、依上游 lockfile 加最小 brace-expansion 5.0.12 修補安裝；使用原 workers／逾時／建置設定，在沙盒外完整驗證。守門、Lint（0 error、既有匯入排序 warning）、TypeScript、Vitest **972/972（43 檔）**、正式建置、npm audit **0 漏洞**，六項皆 exit 0。最後完整重跑依序約 2.8／25.7／16.5／12.1／9.1／1.9 秒；日期／版本以本批 PR 程式提交為準。早期整合中的失敗不作完成證據：Lint 的 JSX 大括號與 staged snapshot fixture 已修，完整重跑通過。新來源守門含 staged catalog 測試；更改後續來源能確實失敗，沒有降低守門。

隔離 Edge 無頭瀏覽器：族裔候選→已選→儲存後英雄總覽、英／正體中文切換、經典表格核准名稱及列印 media 下頁首水平溢出、擒抱力量 2→3（期望值獨立取核准文字位置，不呼叫被測投射器）、關閉計算回到原核准文字，全部通過；page errors 為 0。沒有截圖或錄影。列印檢查只證明本次 fixture 頁首與 DOM，不宣稱所有英雄的整份表格視覺驗收。CI 另用 Chromium 跑相同腳本。

**維護順序 1–5 已完成並通過自主驗證**；交付集中 [PR #54](https://github.com/boyiad2110/forgesteel-zh-tw/pull/54)，程式提交 `cc74a2b5`。最終程式與治理版本 `70fa69e2` 的 [CI #37993319244](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/37993319244) 全數成功：六項完整檢查與 Chromium 玩家旅程回歸均通過。依使用者授權以 merge commit 合併，合併 SHA 與時點以 PR #54 的 GitHub 紀錄為準，不另開結案文件 PR。此後只補驗證紀錄，程式內容未變。後續只有文件補記時引用同程式版本驗證，git diff --check 仍需通過。

## 下一步與來源限制

下一內容批次是 DISPLAY-01：自訂文化已核准面向名稱值補線預覽；UI 標籤另批。2026-10-10 實讀 Master Sheet metadata 共 11 分頁，尚無 Forge Steel UI；Project State 確認 Career 411 NEW。所有阻塞與下一動作見 TODO；此次維護完成不代表 P3/P4 譯文已核准或網站正式發布。

完整歷史保留 [2026-10-10 前進度](history/PROGRESS-2026-10-10.md)，僅需要原批次驗收與版本時再讀。來源掃描逾時（#53）、快照 Note 整合（#37）、總數集中化（#34）均已完成，不能從封存舊段落重新列成待辦。
