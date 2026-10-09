# 上游同步與分支規則

2026-10-10 同步目標：`andyaiken/forgesteel main @ 5968ff545f243d5dd89d34dae5cfc7629b6fd8ea`，14.207.0。原鏡像 2fec6637，帶入 8 個提交、106 檔。實際遠端鏡像、合併版本及檢查結果見 PROGRESS。

## 每週與重大變更

`.github/workflows/upstream-watch.yml` 每週一台灣 09:00 及手動執行；分別比較 origin/main 與 origin/develop 是否包含 upstream/main。沒有積欠就成功，有積欠就失敗並將提交／差異寫 Actions summary，提醒依本文件處理；不寫 issue、不自動合併、不部署。重大資料或顯示更新可提前手動跑。

## 操作

```bash
git status --short
git fetch upstream
git fetch origin
git switch main
git merge --ff-only upstream/main
git push origin main
git switch develop
git pull --ff-only origin develop
git switch -c codex/upstream-sync-YYYY-MM-DD
git merge main
# 解衝突、檢查中文化接點、執行完整驗證
node scripts/l10n/verify.mjs
node scripts/l10n/browser-smoke.mjs
git push -u origin HEAD
# 開 PR 到 develop；必要檢查通過後合併，切回 develop 同步
```

main 出現 divergence 時停止查原因，不能用 force push 冒充鏡像同步。`upstream` 的 push URL 必須保持 `DISABLED_DO_NOT_PUSH`。同一批程式／文件共用 PR；同步後程式驗證完成再補結案結果。

## 中文化回歸

1. 上游變更 → 與顯示層重疊檔案 → mapping 英文雜湊 → 動態數值與資料不變。
2. 本次 5 個衝突：classic conditions card、ability panel、health panel、hero sidebar、data context。保留上游自訂條件解析／新增選單、招式 Level 標籤及 director sourcebooks；重新接核准中文。新 ConditionAddMenu 沿用九個條件名稱，Custom／Quick／擷取條件保持上游文字。
3. 來源與 display 分離、語言切換、自訂／改名、候選／已選、英雄卡與精簡列、招式計算／開關、經典表格列印 DOM 都要查。不能只看 mapping 清冊。
4. 上游新增 extensions、sourcebook 欄位與資料更新照原生整合；中文化不另算遊戲數值。完整守門確認英文字串沒有未核准改變。

## GitHub 門檻

目標設定（實際 API 回讀見 PROGRESS）：

- develop：PR 必要、required status `l10n`（GitHub Actions），strict 要求分支含最新 base；零位必要審查者，避免單人專案無法合併；管理者也適用。禁止 force push／刪分支。
- main：禁止 force push／刪分支，管理者也適用；不要求 PR／l10n，讓上游鏡像可 fast-forward 推送，且不把分叉 workflow 加進 main。
- Localization check 在 develop PR／push 執行六項，任一失敗即整個 l10n 失敗；另有瀏覽器回歸，不因其他失敗而略過必要檢查。

設定與程式同步分開核對，不把文件寫出來當成遠端保護已生效。

同步 PR 使用 merge commit 保留 upstream 提交祖先，讓每週比較與下一次合併能準確判斷已整合；一般內容 PR 維持 squash。GitHub 預設分支為 develop，分叉排程及 PR 範本由 develop 載入。
