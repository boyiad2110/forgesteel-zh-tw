# 進度

## 目前狀態 / 下一步

2026-10-09：P2-SOURCES「內建官方來源與來源入口」已通過 Marc 本機驗收，PR #43 squash 合併至 develop（5081a1c8），本批已接受。集中總數維持 428／105／11。P3 等 Forge Steel UI 分頁；Enhancement、既有來源掃描逾時與 audit 4 個漏洞另案。

2026-10-09：P2-1-2「條件免疫名稱顯示補齊」已通過 Marc 本機驗收，PR #45 squash 合併至 develop（31510b4e），本批結案；集中總數維持 428／105／11。P3 介面標籤仍待 Forge Steel UI 分頁；既有測試逾時與 audit 4 個漏洞另案。

2026-10-09：P2-1-3「英雄側欄條件免疫名稱」已通過 Marc 本機驗收並 squash 合併 PR #47 至 develop（`47b1be6df2370c923479606b303362094cb6200a`）；補一般卡片與精簡列兩處，沿用九個 APPROVED `ConditionName` 對照，不新增譯文、mapping 或例外，總數維持 428／105／11。標籤留 P3；怪物詳情與怪物列印頁另批。單檔 110/110、完整 Vitest 828/828（單 worker／30 秒）通過；既有來源掃描測試 5 秒逾時與 audit 4 個漏洞另案。

2026-10-08 接續摘要：P2-9-1 與治理文件已接受（PR #31、#32）。總數測試維護 PR #34 已通過 Marc 驗收並 squash 合併至 develop（12115ea1）。P2-9-2 符文銘刻已通過 Marc 本機驗收、同步新基底並完成重新驗證，本批已接受（PR #33）；集中預期總數為 421／99／10。P2-9-3 虹彩鱗片六個選項已通過 Marc 本機驗收，PR #35 squash 合併至 develop（d5f353a2）；集中預期總數為 427／105／10。本機 develop 已同步，本批結案。

快照 CSV 與核准動態 Note 整合維護已通過 Marc 本機驗收，PR #37 於 2026-10-08 squash 合併至 develop（6e21b001）。P2-6-3 隨從與專案面板技能／語言名稱已由 Marc 驗收通過，PR #39 squash 合併至 develop（9236f0f7）；本機已同步；P2-5-3 已接受並合併 PR #41（1bbc7725），集中總數為 428／105／11。下一個 P2 內容範圍先提出對照預覽，P3 仍待 Master Sheet 的 Forge Steel UI 分頁。

## P2-SOURCES 內建官方來源與來源入口（已接受）

Marc 於 2026-10-09 核准最小範圍與驗收條件。分支 `codex/official-sourcebooks-only` 從 `develop @ 57d66e34` 建立；四個程式檔移除 Community、六個第三方來源及 Community 預覽／Age of Secrets 的載入、瀏覽與選擇入口。官方四份來源及既有 Patreon／Playtest 條件保留；Homebrew 建立、匯入與儲存流程保留。Library 與建造選單沿用集中來源清單，沒有逐頁新增過濾。原始資料、來源列舉、英雄格式及分享壓縮字典不變；不做既有非官方英雄相容或移轉。譯文、mapping、快照與集中預期總數 428／105／11 不變。

驗證（2026-10-09）：守門、匯出一致性、Lint、TypeScript、`git diff --check`、本批六項回歸及 inventory 3/3 通過。本批回歸在修改前有四項預期失敗，修改後通過。完整 Vitest 826/826（35 檔，`--maxWorkers=1 --testTimeout=30000`）及原始設定的 production build 通過。原始 `npm run check` 在沙盒外執行，Lint／TypeScript 通過，Vitest 825 通過、1 個既有來源掃描測試超過預設 5 秒，exit 1，未接續 audit；另補本批 `npm audit --json`，仍為既有 4 個漏洞（1 moderate、3 high），exit 1。不宣稱完整 check 通過，不改依賴或設定。初次沙盒檢查曾遇暫存模組 ENOENT，build 曾誤報缺少 sass-embedded；確認已安裝 sass 後，同一設定在沙盒外建置通過。

本機驗收位置：Library → Sourcebooks（只含 Official／Homebrew）；Homebrew 建立、匯入、重載保存及內容瀏覽；新英雄 Start 的來源分組；英雄頁 Settings 的來源分組；英／正體中文切換。無截圖或錄影。Marc 於 2026-10-09 回覆驗收通過；[PR #43](https://github.com/boyiad2110/forgesteel-zh-tw/pull/43) squash 合併至 develop（`5081a1c832c2f7d5363ab2eedb7073e990d0e761`），本機已快轉同步。上述程式與正式建置驗證對應 `87680ac9`；GitHub Localization check #120 對應 `44115499`，通過。結案僅更新文件及 Master Sheet，驗證守門、匯出一致性與文件差異，不重跑遊戲測試。

獨立無頭 Edge 已在本批正式建置驗證上述操作：保留既有社群旗標時仍只有四份官方來源及兩個來源分頁；建立與匯入 Homebrew 後重載資料保留；匯入族裔出現在 Library，英／正體中文切換正常；新英雄能勾選 Homebrew 並選用其族裔，保存後 Settings 仍只提供 Official／Homebrew。未發現瀏覽器 page error。正式建置未產生社群／第三方來源的獨立 chunk；這不代表移除凍結分享字典裡的原始文字。測試瀏覽器與暫時 QA 腳本已關閉／移除；不替代 Marc 人工驗收。

## P2-5-3 Orden 語言名稱：Za’hariax（已接受）

Marc 於 2026-10-08 核准預覽。Forge Steel 的語言名稱為 Za'hariax，Master Sheet Names 第 25 列的既有 APPROVED Source Name 是 Za’hariax、Target Name 是「札哈里亞語」。兩者只有直引號／彎引號差異；不改 Sheet 或名稱資料。本批新增 `language:Za'hariax` 對照並列出該鍵的 punctuation 例外；技能／語言 helper 已支援既有顯示位置，不增加畫面 hook、動態句型或 Forge Steel 版。42 個 Orden 語言名稱都涵蓋後，總 mapping 428、Forge Steel Strings 105、英文例外 11。

驗證（2026-10-08）：在地化守門、集中 inventory 測試 3/3、ESLint、TypeScript、`git diff --check` 通過。完整 `npm run check` 的 Lint 與 TypeScript 通過；Vitest 34 檔中 4 檔通過、30 檔因 Windows 沙盒暫存模組檔 ENOENT 無法載入，並有 1 個既有來源掃描測試超過 5 秒；106 項測試通過。另一次執行本批 lookup 測試也受相同暫存檔問題及缺少 sass-embedded 阻擋，沒有執行到該檔測試。完整檢查在 Vitest 失敗後未執行 npm audit；本批未改依賴，既有 audit 結果另案處理。production build 未執行。Marc 於 2026-10-08 本機人工驗收通過；PR #41 squash 合併至 develop（1bbc77256c7ada4a4325b0a126ee2831c2634ced），本機已切回 develop 並快轉同步；集中總數 428／105／11。GitHub Localization check #115 的守門與完整 Vitest 通過。

## P2-6-3 隨從與專案面板名稱（已接受）

Marc 於 2026-10-08 核准只沿用既有 APPROVED 對照，補上隨從完整詳情、專案候選隨從及已選隨從摘要中的技能與語言名稱。六處欄位顯示共用既有 57 個技能鍵、42 個語言鍵（含 Kalliac spelling 例外）；不新增譯文、對照鍵或 Forge Steel 版，集中總數維持 427／105／10。UI 標籤仍留英文，P3 待 Forge Steel UI 分頁。

已在 `codex/p2-6-3-follower-project-localization` 修改兩個共用面板，程式提交 `e2c83dea`；PR #39（https://github.com/boyiad2110/forgesteel-zh-tw/pull/39）GitHub Localization check #108 通過。Marc 逐項驗收隨從詳情的技能與語言名稱，以及專案候選、選取後摘要名稱，均回覆通過。PR #39 於 2026-10-08 squash 合併至 develop（`9236f0f75c97f5e1e7e54c91796610838bbd30f4`），本機已切回 develop 並快轉同步；集中總數 427／105／10。守門、`git diff --check`、兩檔 ESLint 與 TypeScript 通過。Vitest 與 production build 因本機缺少 `sass-embedded` 而無法載入 Sass；`npm ls sass sass-embedded --depth=0` 顯示僅安裝 `sass@1.105.0`。未改依賴或專案設定，沿用此驗證限制；既有測試逾時與 audit 4 個漏洞仍另案處理。合併後本次只補結案文件，未重跑遊戲測試；無截圖或錄影。

## 快照 CSV 與核准動態 Note 整合維護（已接受）

Marc 於 2026-10-08 核准維護範圍與流程。分支 `codex/l10n-snapshot-refresh` 從 `develop @ ee46cd14` 建立；集中總數維持 427／105／10，不新增譯文、mapping、句型或綁定，不改 runtime、上游計算、依賴與測試設定。P3、Enhancement、來源掃描逾時與 audit 漏洞另案。

`sheet-capture.mjs` 使用連接器前後修改時間確認同次取得，依欄名投影三頁核准必要欄位與動態 Note；原始草稿只留記憶體。`refresh-sheet.mjs` 預設試跑，同時重建 CSV、Note 與 source，沿用既有匯出器及守門驗證暫存產物，成功才更新快照與產物；可捕捉寫入失敗還原，斷電／強制終止不保證復原。操作方式見 SNAPSHOT.md。

實際取得 Sheet：第一次前後修改時間不一致，已丟棄；重取一致時間為 `2026-10-08T04:11:01.924Z`。Glossary 332、Names 42、Strings 535、動態 Note 1。命定末視 Note 原樣一致，英文與正體中文內容未變；掙脫／擒抱／擊退的舊快照 Last Updated 誤用 Forge Steel 日期，本次依書本 Last Updated 同步為 2026-09-30，不改 Sheet。CSV 按 ID 排序，六個虹彩鱗片列移回排序位置；重跑同份輸入零變更。

驗證（2026-10-08，基底 ee46cd14）：守門、匯出一致性、腳本語法與 git diff --check 通過；初次相關測試 88/88 通過。最後檢閱將既有句型驗證共用於擷取與匯出，補上「未核准句型不得進暫存輸入」測試；最終完整 Vitest 820/820（34 檔，`--maxWorkers=1 --testTimeout=30000`）通過，新增 26 項擷取／整合／失敗還原測試。暫時讓守門讀舊產物，目標範圍回歸測試失敗；還原後完整測試通過。再次透過 captureSheet 取得資料與前份輸入完全相同，最終共用驗證也產生相同輸入；核准內容與基底逐項一致。

最終完整 `npm run check` 原設定：Lint／TypeScript 通過，Vitest 819 通過、1 個既有來源掃描測試超過 5 秒，exit 1 且未接續 audit；另補本批 `npm audit --json` 為既有 4 個漏洞（1 moderate、3 high），exit 1。初次沙盒相關測試曾因 Vitest 模組暫存檔 ENOENT 未載入整合測試，已以原設定在沙盒外重跑；不改設定或依賴，不宣稱整體檢查通過。

Marc 於 2026-10-08 回覆「過」，本批已接受。PR #37（https://github.com/boyiad2110/forgesteel-zh-tw/pull/37）最終 GitHub l10n CI 通過，已 squash 合併至 develop（6e21b0017daa84cca767e6c1816a6087c03b9cd8）。本機切回 develop 並同步後，守門及匯出一致性通過，工作目錄乾淨。最終程式驗證對應 3e6c8bcf；合併後僅補驗收與狀態紀錄，不重跑遊戲測試。既有預設逾時與 audit 4 個漏洞保留，無截圖或錄影；本輪停在結案。

## P2-9-3 虹彩鱗片六個選項

Marc 於 2026-10-08 核准六個 Forge Steel 選項名稱「虹彩鱗片（酸蝕／寒冷／腐朽／火焰／閃電／毒素）」，並指定數值顯示沿用英文順序，例如「酸蝕 2」。此為 DEC-0009 的六項限縮例外，DEC-0010 與 Master Sheet Strings 942–947、CHG-0073 已記錄。範圍只含六個名稱，以及經典表格裡這六項的計算值行；其他免疫摘要與共用 UI 仍為 P3。

本機分支 `codex/p2-9-3-prismatic-scales` 從 `develop @ b6e2e8e4` 建立。新增六個名稱 mapping，並只在經典表格將這六項的傷害值顯示成核准中文傷害類型加 Forge Steel 上游計算值；集中預期總數更新為 427／105／10。PR #35：https://github.com/boyiad2110/forgesteel-zh-tw/pull/35，於 2026-10-08 通過 Marc 本機驗收並 squash 合併（d5f353a2df83cca43092858466df9a10db77daa1）。守門、匯出一致性、Lint、TypeScript、全套測試、production build 與 GitHub l10n CI 通過。預設完整檢查仍受既有來源掃描測試 5 秒逾時影響；提高至 30 秒並限制單一 worker 後 794/794 通過。`npm audit` 回報既有 4 個漏洞（1 moderate、3 high），未改依賴。本機已回到 develop @ d5f353a2；快照自動整合維持待辦。

## 在地化總數測試維護

維護分支 `codex/l10n-inventory-tests` 從 `develop @ a609c698` 建立。維護 PR #34（https://github.com/boyiad2110/forgesteel-zh-tw/pull/34）於 2026-10-08 通過 Marc 驗收並 squash 合併（12115ea18501e1038fb0f0624f0457673c33278e），合併前 GitHub CI 通過。`src/l10n/inventory.test.ts` 集中 mapping、Forge Steel Strings 列與英文例外總數，各以獨立測試檢查；維護批次的基底預期值為 420／98／10。移除 `lookup.test.ts` 的重複全域總數斷言，保留各批鍵、例外內容與翻譯行為檢查。新增內容後只更新集中預期值，不以實際總數推導預期值、不改成寬鬆下限。維護 PR 不含 #33 的譯文或新增對照鍵。

驗證（2026-10-08，基底 a609c698）：守門、匯出一致性、Lint 無警告、TypeScript 通過；相關測試 105/105、完整 Vitest 788/788（33 檔，`--maxWorkers=1 --testTimeout=30000`）通過。暫時把三種預期值各降低 1，三個測試各自失敗，還原後完整測試通過；12 處重複全域斷言改為 3 個集中測試，移除 4 個只檢查總數的舊測試並新增 3 個，總測試數 789→788，內容與行為斷言保留。沙盒測試曾遇暫存檔 ENOENT，以原設定於沙盒外重跑相關測試通過，未改專案設定。

完整 `npm run check` 預設執行仍在既有來源掃描測試 5 秒逾時處失敗（787 通過、1 逾時），audit 未接續執行；另補本批 `npm audit`，回報既有 4 個漏洞（1 moderate、3 high），exit 1。未改依賴，沒有宣稱整體檢查通過。

上述維護批次程式驗證對應 e61e1908；後續僅補 PR 連結，未變更測試或執行程式。維護已接受；#33 已同步新基底，mapping／Forge Steel Strings 預期值改為 421／99，重新驗證完成，依既有內容驗收結果結案。快照自動取得 CSV 與動態 Note 的整合仍待實作。

## P2-9-2 符文銘刻

Marc 於 2026-10-08 核准預覽：Strings 第 134 列的 Forge Steel 主說明刪去「從以下選擇 1 項：」，接上第 141 列已核准限制段，中間空一行；不新增文字、不改寫。Master Sheet 已更新第 134 列 P–V、Status 與 CHG-0071；第 141 列是合併來源。新增鍵 `element:dwarf-feature-1:description`；其餘 7 鍵沿用。上游數值皆固定，不新增動態句型或計算綁定。

本批已接受，PR #33（https://github.com/boyiad2110/forgesteel-zh-tw/pull/33）的內容已通過 Marc 本機驗收。分支 `codex/p2-9-2-runic-carving` 從 `develop @ a609c698` 建立，已同步維護 PR #34 合併後的 `develop @ 12115ea1`。譯文、快照與對照鍵保持已驗收版本，僅將集中預期值改為 421／99／10；讀回 Master Sheet 第 134 列確認原文、核准中文與 Basis Hash 完全一致。無截圖或錄影。

整合驗證（2026-10-08，基底 12115ea1）：守門、匯出一致性、Lint 無警告、TypeScript、git diff --check 通過；完整 Vitest 788/788（33 檔，`--maxWorkers=1 --testTimeout=30000`）通過。完整 `npm run check` 預設執行仍在既有來源掃描測試 5 秒逾時處失敗（787 通過、1 逾時），未接續 audit；另補本批 `npm audit`，仍回報既有 4 個漏洞（1 moderate、3 high），exit 1，未改依賴。初次實作曾未執行 Vitest／完整檢查，CI 六個舊總數斷言失敗已另開 #34 處理；本次補上整合測試，不宣稱完整 `npm run check` 通過。GitHub 最終合併與 CI 紀錄見 PR #33。

## P2-9-1 治理紀錄

上述 P2-9-2 整合程式驗證對應 6e4a2b10；其後僅補結案表與待辦狀態，未再修改程式或譯文。

治理改善：已記錄動態中文提前預覽、環境排錯順序、檢查結果如實記錄、快照同步及減少重複維護。9-1 稽核重跑相關測試 169/169、守門與匯出一致性通過；這不補足當時完整 npm run check／本批 npm audit 的紀錄缺口。尚待實作：同次自動取得 CSV 與動態 Note；集中既有總鍵數斷言。P2-9-1 治理文件回合未改上述程式或翻譯內容。

本輪治理文件驗證（2026-10-08，程式版本 68289deb）：文件差異、守門、匯出一致性通過。完整 `npm run check` 執行一次，Lint／TypeScript 通過，Vitest 788 通過、1 個既有來源掃描測試超過預設 5 秒，整體 exit 1 且未執行 audit；另補跑 `npm audit --json`，回報 4 個漏洞（1 moderate、3 high），exit 1。本輪未修改依賴；沒有宣稱整體檢查通過，也未為純文件變更反覆重跑遊戲測試。治理文件 PR #32 已驗收通過，結案後本機切回 develop；上述測試逾時與 audit 結果仍保留，未宣稱已修復。下一個內容批次未開始。

P2-7 完成；招式批次 8-1（族裔招式名稱，19 鍵）已接受（#26，2026-10-07）。

招式批次 8-2（族裔描述與內文段）已通過 Marc 驗收，已接受（#28，2026-10-07）。新增 17 鍵（description 10、文字段 7），mapping 398→415；Forge Steel 版 85→93。Master Sheet Strings 第 58、65、69、91、191、245、287、304 列 P–V，CHG-0064（2026-10-07）。

招式批次 8-3（Escape Grab、Grab、Knockback 的「效果：」段）對照預覽已核准；Master Sheet Strings 第 38、39、41 列 P–V 已寫入，新增 CHG-0065。mapping 415→418、Forge Steel 版 93→96。Marc 核准保留自動計算並顯示正確中文後，新增擒抱、擊退的動態數值綁定；Strings U39、U41 補註 CHG-0066，核准譯文原樣保存。上游計算結果中的數字投射到中文，關閉閃電時恢復原文；未知改寫保留完整計算後英文。Marc 於 2026-10-07 回覆「驗收通過」，本批已接受（PR #29）。守門、匯出一致性、ESLint、TypeScript 通過，完整 Vitest 771/771 通過（`--maxWorkers=1 --testTimeout=10000`）。本機 Edge 無頭瀏覽器確認擒抱／擊退閃電開關、力量 2→3、英／正體中文切換與掙脫擲骰加值；無截圖或錄影，招式資料維持原樣。新測試在暫時恢復固定中文時有 4 個數值案例失敗，還原修正後通過。`npm run check` 的預設 Vitest 仍有 1 個既有來源掃描測試逾時；`npm audit` 仍為既有 4 個漏洞（1 moderate、3 high），本批未改依賴。

8-2 驗證：`node scripts/l10n/check.mjs` 通過；`npm run check` 的 ESLint、TypeScript、760 個測試通過（本機以 `VITEST_MAX_WORKERS=1` 避免既有來源掃描測試在平行執行時逾時）。最後 `npm audit` 回報既有相依套件 4 個漏洞（1 moderate、3 high），整體指令 exit 1；本批未修改 `package.json`／`package-lock.json`，未處理相依套件更新。

8-3 追修（2026-10-07）：治理稽核確認共用原文查鍵會讓閃耀熾目的固定中文蓋掉上游等級數值，Marc 已核准修正，並要求原文數字變動時中文必須同步。原文查鍵改為只允許已有顯示綁定的段落；共用轉接器拒絕未綁定的真實改寫，補上閃耀熾目的 `your level` →「你等級」位置綁定。新增等級 1／2／3／10、開關／英語／自訂內容／不改資料的回歸測試，以及遍歷全部已翻譯文字段的動態數值覆蓋測試。Strings U91 補註 CHG-0067；mapping 418 鍵、Forge Steel 版 96 列，靜態譯文不變。Marc 於 2026-10-07 回覆「驗收通過」，追修已接受（PR #30）；本輪停在結案。驗證：守門、匯出一致性、ESLint（無警告）、TypeScript 通過；完整 Vitest 780/780 通過（--maxWorkers=1 --testTimeout=10000）。本機 Edge 無頭頁面確認閃耀熾目的閃電開關、等級 2→3、英／正體中文切換，並回歸擒抱／擊退／掙脫；無截圖、錄影，招式原始資料不變。原版的閃耀熾目 4 個等級數值案例先失敗，修正後通過。npm run check 的既有來源掃描測試仍超過預設 5 秒；npm audit 為既有 4 個漏洞，本次未改依賴。

P2-9-1（2026-10-08）：哈肯人總覽與命定末視已依核准對照實作，PR #31（https://github.com/boyiad2110/forgesteel-zh-tw/pull/31）Marc 於 2026-10-08 回覆「驗收通過」，本批已接受。Strings 204、220 的 P–V 與 CHG-0068 已寫入；205、221–222 標示併列，命定末視保留三段，Hacaarl 依 DEC-0009 不補。mapping 420 鍵、Forge Steel 版 98 列。

## P2-9-1 動態句型追修（2026-10-08）

Marc 確認復元值能自動更新，核准把「你會恢復等於 13 的體力」改為「你會恢復 13 點體力」。2026-10-07 因使用者要求暫停，2026-10-08 恢復並完成追修驗證；分支為 `codex/p2-9-1-hakaan-doomsight`，Marc 於 2026-10-08 驗收通過，PR #31 依流程 squash 合併至 develop。

- Sheet Strings U220:V220 保存核准句型、CHG-0069 記錄核准。書本及 Forge Steel 靜態譯文維持原樣，Status 第 8 列結案為 COMPLETE。
- `l10n/sheet-snapshot/calculation-displays.json` 保存 U220 原樣 Note；匯出器解析唯一的 `Calculation Display:` JSON 紀錄，要求 APPROVED、唯一目標片語、單一 `{value}`，匯出為 fs.calculationDisplay。片語「等於你復元值的體力」在計算後換成「 {value} 點體力」。
- 共用轉接器只投射上游數字，命定末視 targetSpan 為 [331,340]，useDisplayTemplate 啟用 Sheet 句型；sourceHash 錨定裁去頭尾空白後的原文，enHash 仍錨定原始上游字串。守門核對句型目標範圍，未知改寫保留完整計算後英文。
- 新增 13→16、資料不變、未計算時保留三段、語言切換、自訂改寫完整英文及缺失／不合法模板的渲染測試；匯出器測試拒絕未核准句型、不存在的片語與不合法占位符。舊 mapping 數量斷言更新為 420、Forge Steel 版 98，移除哈肯人兩個已對照鍵的舊 unmapped 斷言。
- 驗證：完整 Vitest 789/789 通過（32 檔，`--maxWorkers=1 --testTimeout=30000`）、正式建置通過；ESLint 無警告、TypeScript、守門與匯出一致性通過。原先 Sass 解析及測試暫存檔 ENOENT 屬沙盒環境限制，原始設定在沙盒外執行通過；暫時的樣式略過設定已移除，未改相依套件或 Vite 設定。無截圖、錄影。
- 結案：Marc 於 2026-10-08 回覆「驗收通過」。本批接受後合併 PR #31，本機切回 develop；原始譯文、語言切換、未知改寫英文備援維持。停在本批結案，下一批先提出對照預覽。

## 已完成

| 批次 | 內容 | PR | 狀態 | 接受日 |
| --- | --- | --- | --- | --- |
| P0-1 | 本地環境、`develop` 分支 | 無 | 已接受 | 2026-10-03 |
| P0-2 | 部署流程保護、`README.zh-TW.md` | #1 | 已接受 | 2026-10-03 |
| P1-1 | Master Sheet 匯出流程 | #2 | 已接受 | 2026-10-03 |
| P1-2 | 語言開關，以及顯示當下才查對照 | #3 | 已接受 | 2026-10-03 |
| P1-3 | 在地化守門 | #4 | 已接受 | 2026-10-03 |
| P1-4 | 思源黑體備用字型、中文斜體、只在這個分叉跑的自動檢查 | #5 | 已接受 | 2026-10-03 |
| P1-5 | 治理文件 | #6 | 已接受 | 2026-10-03 |
| P2-1 | 條件名稱，以及七段規則 | #7 | 已接受 | 2026-10-03 |
| P2-2 | 五個屬性名稱 | #8 | 已接受 | 2026-10-03 |
| P2-3 | 歐克族裔 | #9 | 已接受 | 2026-10-03 |
| P2-3 族裔續批 | 矮人、哈肯人、梅莫人，以及 Forge Steel 版支援 | #10 | 已接受 | 2026-10-03 |
| P2-3 族裔第三批 | 魔鬼、高等精靈、波德人 | #11 | 已接受 | 2026-10-04 |
| P2-3 族裔第四批 | 人類、幻林精靈、時空獵手 | #12 | 已接受 | 2026-10-05 |
| P2-3 族裔第五批 | 還魂屍、龍騎士（族裔最後一批） | #13 | 已接受 | 2026-10-06 |
| P2-4 文化第一批 | 13 個文化面向（環境、組織、成長經歷） | #15 | 已接受 | 2026-10-06 |
| P2-4 文化第二批 | 16 個職業型文化名稱 | #16 | 已接受 | 2026-10-06 |
| P2-4 文化第三批 | 11 個族裔文化名稱 | #17 | 已接受 | 2026-10-06 |
| P2-5 語言 5-1 | 語言名稱（文化面板與建造頁） | #18 | 已接受 | 2026-10-06 |
| P2-5 語言 5-2 | 語言名稱（英雄側欄、經典表格、Reference、來源書、小隊、協商） | #19 | 已接受 | 2026-10-06 |
| P2-5-3 | Orden 語言 Za’hariax 對照既有核准名稱「札哈里亞語」 | #41 | 已接受 | 2026-10-08 |
| P2-6 技能 6-1 | 技能名稱與類別（建造頁技能選擇、選技能視窗、Reference 技能頁） | #20 | 已接受 | 2026-10-06 |
| P2-6 技能 6-2 | 技能名稱與類別（英雄側欄、小隊、來源書、經典表格技能卡／隨從卡／同伴卡／特性、失去技能糾葛、選技能視窗標籤） | #21 | 已接受 | 2026-10-06 |
| P2-6-3 | 隨從詳情、專案候選與已選隨從的技能／語言名稱 | #39 | 已接受 | 2026-10-08 |
| P2-7 基本動作 7-1 | 基本動作名稱（Reference 的 Abilities 頁、招式視窗、列印頁、英雄頁招式列表、側欄 Triggers） | #23 | 已接受 | 2026-10-06 |
| P2-7 基本動作 7-2 | 基本動作名稱（經典表格招式卡、英雄頁 Standard Abilities 檢視、設定裡選基本動作的抽屜、表格預覽頁的 Included Standard Abilities 選單） | #24 | 已接受 | 2026-10-06 |
| P2-7 基本動作 7-3 | 基本動作描述（Reference 的 Abilities 頁、招式視窗、列印頁、經典表格招式卡、英雄頁 Standard Abilities 檢視） | #25 | 已接受 | 2026-10-07 |
| P2-8 招式批次 8-1 | 族裔招式名稱 19 個（建造頁族裔可購買特性選項、英雄頁招式列表與招式視窗、經典表格招式卡、圖書館族裔頁；Remember your Oath、Draconic Pride 走 Forge Steel 版；Strings 第 33、34 列「在」已修） | #26 | 已接受 | 2026-10-07 |
| P2-8 招式批次 8-2 | 族裔招式描述 10 鍵與內文段 7 鍵；Strings 第 58、65、69、91、191、245、287、304 列 P–V（CHG-0064），mapping 415 鍵、Forge Steel 版 93 列 | #28 | 已接受 | 2026-10-07 |
| P2-8 招式批次 8-3 | Escape Grab、Grab、Knockback 效果段；Strings 第 38、39、41 列 P–V（CHG-0065）；擒抱／擊退動態數值綁定（CHG-0066）；mapping 418 鍵、Forge Steel 版 96 列 | #29 | 已接受 | 2026-10-07 |
| P2-8 招式批次 8-3 追修 | 閃耀熾目等級數值綁定、共用查鍵限制與完整計算後英文備援；Strings U91（CHG-0067）；mapping 418 鍵、Forge Steel 版 96 列 | #30 | 已接受 | 2026-10-07 |

| P2-9-1 | 哈肯人總覽、命定末視，以及核准動態中文句型；mapping 420 鍵、Forge Steel 版 98 列 | #31 | 已接受 | 2026-10-08 |
| 在地化總數測試維護 | 集中 mapping、Forge Steel Strings 列與英文例外總數；保留各批鍵與行為檢查 | #34 | 已接受 | 2026-10-08 |
| P2-9-2 | 符文銘刻主說明；Strings 第 134 列併入第 141 列（CHG-0071）；mapping 421 鍵、Forge Steel 版 99 列 | #33 | 已接受 | 2026-10-08 |

## P2-1-2 條件免疫名稱顯示補齊（已接受）

Marc 於 2026-10-09 核准沿用既有九個 APPROVED Glossary 對照，補齊兩處已確認的條件免疫名稱：特性詳情的 Cannot Be 值，以及經典表格共用特性列。兩處均使用 `ConditionName`；排序與逗號分隔維持原樣，未對照／自訂條件與英文模式保留英文。只改顯示，不動資料、存檔、計算或排版估算；介面標籤仍留 P3。不新增譯文、mapping 或例外，總數維持 428／105／11。

回歸測試以多個核准條件及自訂條件確認兩處顯示與英文備援。Marc 於 2026-10-09 本機驗收通過特性詳情與經典表格的正體中文名稱及英／正體中文切換；[PR #45](https://github.com/boyiad2110/forgesteel-zh-tw/pull/45) squash 合併至 develop（`31510b4e754a4c66a9c2bf2a848b4e09f9c391ae`），本機已快轉同步。GitHub Localization check 通過。合併版本驗證：守門、匯出一致性、全專案 ESLint、TypeScript 及 Vitest 827/827（單 worker／30 秒）通過；預設 `npm run check` 仍因既有來源掃描測試超過 5 秒逾時而退出，未接續 audit；另跑 `npm audit` 仍為既有 4 個漏洞（1 moderate、3 high），未改依賴。英雄側欄摘要與列印頁不在本批範圍，後續另行評估。總數維持 428／105／11；無截圖或錄影。

## P2-1-3 英雄側欄條件免疫名稱（已接受）

Marc 核准補齊英雄側欄 `Cannot Be` 摘要的一般卡片與精簡列，沿用九個 APPROVED 條件名稱及 `ConditionName`。排序、逗號分隔、點擊行為、英文模式及未對照名稱備援維持原行為；不新增譯文、mapping 或例外，總數維持 428／105／11。標籤仍留 P3；怪物詳情與怪物列印頁另行評估。

回歸測試涵蓋九個核准名稱、兩種版面、英文模式及未對照條件。沙盒內完整 Vitest 曾受 Windows 暫存模組 ENOENT 影響；沙盒外單檔 110/110、完整 Vitest 828/828（單 worker／30 秒）、改動檔 ESLint、TypeScript、在地化守門與匯出一致性通過。原始 `npm run check` 的 Lint／TypeScript 通過，Vitest 827 項通過、1 個既有來源掃描測試超過預設 5 秒逾時，exit 1、未接續 audit；另補 `npm audit --json`，仍有既有 4 個漏洞（1 moderate、3 high），未改依賴。Marc 於 2026-10-09 本機驗收一般卡片與精簡列的正體中文條件名稱及英／正體中文切換，回覆驗收通過；[PR #47](https://github.com/boyiad2110/forgesteel-zh-tw/pull/47) GitHub Localization check 通過並 squash 合併至 develop（`47b1be6df2370c923479606b303362094cb6200a`）。不新增譯文、mapping 或例外；總數維持 428／105／11。結案只更新文件及 Master Sheet，不重跑遊戲測試；無截圖或錄影。

## 後面預計做的

**P2，依這個順序做內容。** 每一批都先給對照預覽。

1. conditions（P2-1，已接受）
2. 五個屬性名稱（P2-2，已接受）。「Characteristic」這個詞等 P3
3. ancestries：歐克（P2-3，已接受）；矮人、哈肯人、梅莫人，以及 Forge Steel 版支援（P2-3 族裔續批，已接受）；魔鬼、高等精靈、波德人（P2-3 族裔第三批，已接受）；人類、幻林精靈、時空獵手（P2-3 族裔第四批，已接受）；還魂屍、龍騎士（P2-3 族裔第五批，已接受）。族裔到此全部做完。招式（各族的可購買招式、特色招式）留到之後的招式批次（見第 8 項）
4. cultures（P2-4）：第一批 13 個文化面向（已接受）。第二批 16 個職業型文化名稱（已接受）。第三批 11 個族裔文化名稱（已接受）
5. languages（P2-5）：5-1 語言名稱，文化面板與建造頁（已接受）。5-2 語言名稱，英雄側欄、經典表格、Reference、來源書、小隊、協商（已接受）。5-3 Orden 語言 Za’hariax 對照既有核准名稱「札哈里亞語」（已接受，#41）。語言描述留英文。特性名、Field 標籤 Language、類型標籤、「I Speak Their Language (…)」、「Unselected」、「None」、「Related to:」、類型標題，以及「Choose a language.」等 P3。sourcebook-panel 編輯模式留英文。經典表格排版估算不改。選語言抽屜的搜尋維持只認英文。編輯器下拉留英文
6. skill groups（P2-6）：6-1 技能名稱與類別，建造頁技能選擇、選技能視窗、Reference（已接受）。6-2 技能名稱與類別，英雄側欄、小隊、來源書、經典表格技能卡／隨從卡／同伴卡／特性、失去技能糾葛、選技能視窗標籤（已接受）。6-3 隨從詳情、專案候選與已選隨從的技能／語言名稱（已接受）。擲骰修正說明、分組標題 P3。技能描述留英文。搜尋排序維持英文
7. basic actions（P2-7）：7-1 網頁名稱，Reference 的 Abilities 頁、招式視窗、列印頁、英雄頁招式列表、側欄 Triggers（已接受）。7-2 經典表格名稱（已接受）。7-3 動作描述（已接受：9 段 Forge Steel 版、5 段直接對照）。Escape Grab、Grab、Knockback 的「效果：」段已於招式批次 8-3 接受；簡略描述仍留英文。Opportunity Attack、Go Prone、Swap 的描述留英文。Melee Free Strike／Ranged Free Strike、Go Prone、Swap 留英文。動作類型標籤、分組標題、Reference Abilities 分頁標籤、經典表格參考卡留 P3
8. 招式批次（P2-8）：8-1 族裔招式名稱 19 個（已接受，#26）。Remember your Oath（書：Remember Your Oath）、Draconic Pride（書：Draconian Pride）的名稱走 Forge Steel 版，中文與書本相同。8-2 族裔描述與內文段（已接受，#28）：description 10 鍵（直接對照 6、Forge Steel 版 4）、文字段 7 鍵（直接對照 3、Forge Steel 版 4）；Sheet 寫 8 列 P–V（第 58、65、69、91、191、245、287、304 列）；程式改 `src/l10n/ability-text.ts`（`abilitySectionKey` 擴到族裔招式、新增 description 鍵）、`ability-panel.tsx`（description：compact 與 full 兩處）、`ability-card.tsx`（description）。8-3 Escape Grab、Grab、Knockback 的「效果：」段（第 38、39、41 列各 1 段，`section:<id>:2`）已接受（#29，2026-10-07）：Sheet 寫 3 列 P–V 並新增 CHG-0065。Grab／Knockback 以原始英文字串查翻譯鍵，再將上游計算數值投射到核准中文（`calculation-bindings.json`／`calculated-text.ts`）；關閉計算恢復原文。Strings U39、U41 補註 CHG-0066，Project State／Status 已更新；Marc 已驗收閃電開關與力量 2→3。擲骰（tier）、關鍵字、距離、目標、觸發句、Forge Steel 改寫的段留英文；第 177、331、356 列的引言不對照；Foresight（2-2b）只做名稱。職業、套組、領域、專長招式不在這批。矮人、哈肯人、歐克沒有招式
9. 跟書對不上的項目（排在 P2-4 與招式批次之後）：哈肯人總覽、命定末視（P2-9-1 已接受，#31）、符文銘刻（P2-9-2 已接受，#33）；虹彩鱗片 6 個選項（P2-9-3 已接受，#35；結案文件 #36）。

同一階段：P2-SOURCES 內建僅載入官方來源、移除社群與第三方入口，已驗收通過並合併 PR #43，本批結案。

**P3。** 介面文字。等 Master Sheet 有「Forge Steel UI」分頁之後才做。在那之前介面維持英文。

**P4。** careers（生涯）、classes（職業），以及表上接下來核准的其他內容。期間定期把上游合併進來。
