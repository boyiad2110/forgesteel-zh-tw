# KITS-GLOSSARY：套裝裝備值

## 問題與結果

套裝名稱與描述已有正體中文，但裝備分類在套裝詳情的「總覽／數據」以及建角時已選套裝摘要仍直接顯示英文列舉值。本批把 12 個已核准 Book Master Glossary 對照接入這兩個顯示位置；遊戲資料、搜尋與存檔維持原值。

## 範圍與來源

- 批次：`KITS-GLOSSARY`，承接 `KITS-01`。
- 交付：等待 Marc 人工驗收；[PR #75](https://github.com/boyiad2110/forgesteel-zh-tw/pull/75)。
- 正典來源：Draw Steel Book Master Glossary `A336:M347`，12 列均為 `APPROVED`。不新增 Forge Steel Adaptation，因網站顯示值與 Book Master 原文完全相同。
- 裝備對照：Light Armor＝輕甲、Medium Armor＝中甲、Heavy Armor＝重甲、Shield＝盾牌、Light Weapon＝輕型武器、Medium Weapon＝中型武器、Heavy Weapon＝重型武器、Bow＝弓、Ensnaring Weapon＝捕縛武器、Polearm＝長柄武器、Unarmed Strike＝徒手打擊、Whip＝鞭笞武器。
- 顯示範圍：標準套裝的詳情頁與建角面板已選套裝摘要。只比對精確官方 enum 值；未知、自訂值保留原文。英文模式維持原文。
- 快照按雙來源流程一次擷取六個核准分頁；Book 與 Forge 的修改時間及來源指紋保存在 `l10n/sheet-snapshot/source.json`。

## 驗證

2026-10-17，本機 Node v24.18.0 的 `node scripts/l10n/verify.mjs` 通過 guard、lint（0 errors、32 warnings）、TypeScript 與正式建置；Vitest 測試套件在 Windows sandbox Vite SSR 暫存檔 `ENOENT` 時無法載入，audit 則因 Registry DNS `ENOTFOUND` 未完成。最新 PR head `5bb5de9b` 的 [CI run #264](https://github.com/boyiad2110/forgesteel-zh-tw/actions/runs/38996758789) 已補足完整驗證：54/54 測試套件、1054/1054 測試、語系守門、lint、TypeScript、正式建置、audit 及 10 組瀏覽器旅程均通過。前一輪 CI 發現測試夾具誤用沒有護甲的魔弓套裝；改以山嶽套裝覆蓋護甲與武器後通過。

## 驗收位置與限制

請在目前本機開發站切換正體中文，依序確認：

1. 開啟「圖書館 → 套裝」，檢查 Light Armor、Heavy Armor、Shield、Bow、Polearm、Unarmed Strike、Whip 等套裝組合在「總覽」與「數據」分頁顯示中文。
2. 建立或開啟英雄，在建角選擇面板檢查已選套裝摘要的護甲與武器值顯示中文。
3. 切換 English，確認以上值回復英文。
4. 若可用，透過自訂／Homebrew 套裝確認不屬於 12 個核准 enum 的自訂值仍原樣顯示。

不截圖、不錄影。驗收與合併結果待發生後回寫原 PR 與 Sheet；本批未部署。
